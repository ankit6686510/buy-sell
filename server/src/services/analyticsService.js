import { UserActivity, PageView, Conversion, ABTest, Performance, ErrorLog } from '../models/Analytics.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import ProductListing from '../models/ProductListing.js';

class AnalyticsService {
  
  /**
   * Track user events for analytics
   * @param {Object} eventData - Event data
   */
  async trackEvent(eventData) {
    try {
      const {
        userId,
        sessionId,
        event,
        properties = {},
        userAgent,
        ipAddress,
        referrer,
        page
      } = eventData;

      const analytics = new UserActivity({
        user: userId,
        sessionId,
        action: event,
        metadata: {
          ...properties,
          userAgent,
          ipAddress,
          referrer,
          pageUrl: page
        }
      });

      await analytics.save();

      // Track specific revenue-related events
      if (event === 'promotion_purchased') {
        await this.trackPromotionConversion(properties);
      } else if (event === 'listing_created') {
        await this.trackListingCreation(properties);
      } else if (event === 'user_registered') {
        await this.trackUserRegistration(properties);
      }

      return analytics;
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Get real-time revenue dashboard data
   */
  async getRevenueDashboard(timeframe = '30d') {
    try {
      const startDate = this.getStartDate(timeframe);
      
      const [
        totalRevenue,
        totalTransactions,
        averageOrderValue,
        topCategories,
        revenueByDay,
        conversionRates,
        userMetrics
      ] = await Promise.all([
        this.getTotalRevenue(startDate),
        this.getTotalTransactions(startDate),
        this.getAverageOrderValue(startDate),
        this.getTopCategories(startDate),
        this.getRevenueByDay(startDate),
        this.getConversionRates(startDate),
        this.getUserMetrics(startDate)
      ]);

      return {
        revenue: {
          total: totalRevenue,
          transactions: totalTransactions,
          averageOrderValue,
          growth: await this.getRevenueGrowth(startDate)
        },
        categories: topCategories,
        timeline: revenueByDay,
        conversion: conversionRates,
        users: userMetrics,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Revenue dashboard error:', error);
      throw error;
    }
  }

  /**
   * Track promotion conversion for revenue optimization
   */
  async trackPromotionConversion(properties) {
    const { packageId, amount, listingId } = properties;
    
    // Update promotion performance metrics
    await Analytics.updateOne(
      { 'properties.packageId': packageId },
      { 
        $inc: { 
          'properties.conversions': 1,
          'properties.revenue': amount 
        }
      },
      { upsert: true }
    );
  }

  /**
   * Get total revenue for timeframe
   */
  async getTotalRevenue(startDate) {
    const result = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$platformFee' },
          count: { $sum: 1 }
        }
      }
    ]);

    return result[0] || { total: 0, count: 0 };
  }

  /**
   * Get total transactions
   */
  async getTotalTransactions(startDate) {
    return await Transaction.countDocuments({
      status: 'completed',
      completedAt: { $gte: startDate }
    });
  }

  /**
   * Get average order value
   */
  async getAverageOrderValue(startDate) {
    const result = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          averageValue: { $avg: '$amount' }
        }
      }
    ]);

    return result[0]?.averageValue || 0;
  }

  /**
   * Get top performing categories
   */
  async getTopCategories(startDate) {
    return await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'productlistings',
          localField: 'listing',
          foreignField: '_id',
          as: 'listing'
        }
      },
      {
        $unwind: '$listing'
      },
      {
        $group: {
          _id: '$listing.category',
          revenue: { $sum: '$platformFee' },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
      }
    ]);
  }

  /**
   * Get revenue by day for charts
   */
  async getRevenueByDay(startDate) {
    return await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$completedAt' 
            }
          },
          revenue: { $sum: '$platformFee' },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
  }

  /**
   * Get conversion rates
   */
  async getConversionRates(startDate) {
    const [visits, signups, listings, purchases] = await Promise.all([
      Analytics.countDocuments({ event: 'page_view', timestamp: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      ProductListing.countDocuments({ createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ status: 'completed', completedAt: { $gte: startDate } })
    ]);

    return {
      visitToSignup: visits > 0 ? ((signups / visits) * 100).toFixed(2) : 0,
      signupToListing: signups > 0 ? ((listings / signups) * 100).toFixed(2) : 0,
      listingToPurchase: listings > 0 ? ((purchases / listings) * 100).toFixed(2) : 0,
      visitToPurchase: visits > 0 ? ((purchases / visits) * 100).toFixed(2) : 0
    };
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(startDate) {
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      new: newUsers,
      retention: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
    };
  }

  /**
   * Get revenue growth percentage
   */
  async getRevenueGrowth(startDate) {
    const currentPeriod = await this.getTotalRevenue(startDate);
    const periodLength = Date.now() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodLength);
    const previousPeriod = await this.getTotalRevenue(previousStart);

    if (previousPeriod.total === 0) return 0;
    
    return (((currentPeriod.total - previousPeriod.total) / previousPeriod.total) * 100).toFixed(2);
  }

  /**
   * Track user funnel for optimization
   */
  async trackUserFunnel(userId, step, properties = {}) {
    const funnelSteps = [
      'landing', 'signup', 'email_verified', 'first_listing', 
      'first_promotion', 'first_sale', 'repeat_customer'
    ];

    await this.trackEvent({
      userId,
      event: `funnel_${step}`,
      properties: {
        step,
        stepNumber: funnelSteps.indexOf(step) + 1,
        ...properties
      }
    });
  }

  /**
   * Get promotion package performance
   */
  async getPromotionPerformance() {
    return await Transaction.aggregate([
      {
        $match: {
          type: 'promotion',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$promotionData.packageId',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);
  }

  /**
   * Get user lifetime value
   */
  async getUserLifetimeValue(userId = null) {
    const matchQuery = userId ? { buyer: userId } : {};
    
    const result = await Transaction.aggregate([
      {
        $match: {
          ...matchQuery,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: userId ? null : '$buyer',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          platformRevenue: { $sum: '$platformFee' }
        }
      },
      {
        $addFields: {
          averageOrderValue: { $divide: ['$totalSpent', '$transactionCount'] }
        }
      },
      ...(userId ? [] : [{ $sort: { totalSpent: -1 } }])
    ]);

    return userId ? result[0] : result;
  }

  /**
   * A/B testing framework
   */
  async trackExperiment(experimentName, variant, userId, outcome = null) {
    await this.trackEvent({
      userId,
      event: 'experiment_exposure',
      properties: {
        experiment: experimentName,
        variant,
        outcome
      }
    });
  }

  /**
   * Get experiment results
   */
  async getExperimentResults(experimentName) {
    return await Analytics.aggregate([
      {
        $match: {
          event: 'experiment_exposure',
          'properties.experiment': experimentName
        }
      },
      {
        $group: {
          _id: '$properties.variant',
          exposures: { $sum: 1 },
          conversions: {
            $sum: {
              $cond: [{ $ifNull: ['$properties.outcome', false] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $multiply: [
              { $divide: ['$conversions', '$exposures'] },
              100
            ]
          }
        }
      }
    ]);
  }

  /**
   * Helper function to get start date based on timeframe
   */
  getStartDate(timeframe) {
    const now = new Date();
    const timeframes = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const days = timeframes[timeframe] || 30;
    return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  }

  /**
   * Real-time event tracking for immediate insights
   */
  async getRealtimeMetrics() {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    
    const [activeUsers, recentTransactions, recentSignups] = await Promise.all([
      Analytics.distinct('userId', { 
        timestamp: { $gte: last5Minutes },
        event: { $in: ['page_view', 'listing_view', 'search'] }
      }),
      Transaction.countDocuments({
        createdAt: { $gte: last5Minutes }
      }),
      User.countDocuments({
        createdAt: { $gte: last5Minutes }
      })
    ]);

    return {
      activeUsers: activeUsers.length,
      recentTransactions,
      recentSignups,
      timestamp: new Date()
    };
  }
}

export default new AnalyticsService();
