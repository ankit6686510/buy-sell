import User from '../models/User.js';
import ProductListing from '../models/ProductListing.js';
import Transaction from '../models/Transaction.js';
import Analytics from '../models/Analytics.js';
import Message from '../models/Message.js';
import analyticsService from './analyticsService.js';
import emailService from './emailService.js';
import searchService from './searchService.js';

class AdminService {
  
  /**
   * Get comprehensive platform overview dashboard
   */
  async getPlatformOverview(timeframe = '30d') {
    try {
      const startDate = this.getStartDate(timeframe);
      const now = new Date();

      const [
        userMetrics,
        listingMetrics,
        revenueMetrics,
        engagementMetrics,
        systemHealth,
        recentActivity
      ] = await Promise.all([
        this.getUserMetrics(startDate),
        this.getListingMetrics(startDate),
        this.getRevenueMetrics(startDate),
        this.getEngagementMetrics(startDate),
        this.getSystemHealth(),
        this.getRecentActivity(10)
      ]);

      return {
        summary: {
          totalUsers: userMetrics.total,
          activeUsers: userMetrics.active,
          totalListings: listingMetrics.total,
          activeListings: listingMetrics.active,
          totalRevenue: revenueMetrics.total,
          monthlyGrowth: revenueMetrics.growth
        },
        metrics: {
          users: userMetrics,
          listings: listingMetrics,
          revenue: revenueMetrics,
          engagement: engagementMetrics
        },
        systemHealth,
        recentActivity,
        generatedAt: now
      };
    } catch (error) {
      console.error('Platform overview error:', error);
      throw error;
    }
  }

  /**
   * Get detailed user analytics and management data
   */
  async getUserManagement(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        subscriptionTier,
        search
      } = filters;

      // Build query
      let query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (subscriptionTier) {
        query.subscriptionTier = subscriptionTier;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ];
      }

      // Get users with pagination
      const users = await User.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('-password')
        .lean();

      const totalUsers = await User.countDocuments(query);

      // Enhance user data with metrics
      const enhancedUsers = await Promise.all(
        users.map(async (user) => {
          const [listingsCount, transactionsCount, totalSpent, totalEarned] = await Promise.all([
            ProductListing.countDocuments({ user: user._id }),
            Transaction.countDocuments({ $or: [{ buyer: user._id }, { seller: user._id }] }),
            Transaction.aggregate([
              { $match: { buyer: user._id, status: 'completed' } },
              { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
              { $match: { seller: user._id, status: 'completed' } },
              { $group: { _id: null, total: { $sum: '$sellerAmount' } } }
            ])
          ]);

          return {
            ...user,
            stats: {
              listingsCount,
              transactionsCount,
              totalSpent: totalSpent[0]?.total || 0,
              totalEarned: totalEarned[0]?.total || 0,
              lastActive: user.lastActive || user.createdAt
            }
          };
        })
      );

      return {
        users: enhancedUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit),
          hasNext: page * limit < totalUsers,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('User management error:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics with detailed breakdown
   */
  async getRevenueAnalytics(timeframe = '30d') {
    try {
      const startDate = this.getStartDate(timeframe);

      const [
        totalRevenue,
        revenueByType,
        revenueTimeline,
        topSpenders,
        promotionPerformance,
        conversionMetrics
      ] = await Promise.all([
        this.getTotalRevenue(startDate),
        this.getRevenueByType(startDate),
        this.getRevenueTimeline(startDate),
        this.getTopSpenders(startDate, 10),
        this.getPromotionPerformance(startDate),
        this.getConversionMetrics(startDate)
      ]);

      return {
        summary: {
          total: totalRevenue.amount,
          growth: totalRevenue.growth,
          transactions: totalRevenue.count,
          averageOrderValue: totalRevenue.amount / (totalRevenue.count || 1)
        },
        breakdown: revenueByType,
        timeline: revenueTimeline,
        topSpenders,
        promotions: promotionPerformance,
        conversions: conversionMetrics
      };
    } catch (error) {
      console.error('Revenue analytics error:', error);
      throw error;
    }
  }

  /**
   * Get listing management and moderation data
   */
  async getListingManagement(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'all',
        category,
        flagged = false,
        promoted = false
      } = filters;

      let query = {};
      
      if (status !== 'all') {
        query.status = status;
      }
      
      if (category) {
        query.category = category;
      }
      
      if (flagged) {
        query.flagged = true;
      }
      
      if (promoted) {
        query.promotion = { $exists: true };
      }

      const listings = await ProductListing.find(query)
        .populate('user', 'name email trustScore')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      const totalListings = await ProductListing.countDocuments(query);

      // Get flagged listings that need attention
      const flaggedListings = await ProductListing.find({ 
        flagged: true,
        status: 'available'
      }).countDocuments();

      // Get pending approvals
      const pendingApprovals = await ProductListing.find({
        status: 'pending'
      }).countDocuments();

      return {
        listings,
        pagination: {
          page,
          limit,
          total: totalListings,
          pages: Math.ceil(totalListings / limit)
        },
        moderation: {
          flaggedCount: flaggedListings,
          pendingApprovals
        }
      };
    } catch (error) {
      console.error('Listing management error:', error);
      throw error;
    }
  }

  /**
   * Get real-time platform activity feed
   */
  async getActivityFeed(limit = 50) {
    try {
      const [
        recentUsers,
        recentListings,
        recentTransactions,
        recentMessages
      ] = await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(10).select('name email createdAt'),
        ProductListing.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name').select('title status createdAt user'),
        Transaction.find().sort({ createdAt: -1 }).limit(10).populate('buyer seller', 'name').select('type amount status createdAt buyer seller'),
        Message.find().sort({ createdAt: -1 }).limit(10).populate('sender', 'name').select('content createdAt sender')
      ]);

      // Combine and sort all activities
      const activities = [];
      
      recentUsers.forEach(user => {
        activities.push({
          type: 'user_registered',
          timestamp: user.createdAt,
          data: { userName: user.name, userEmail: user.email },
          icon: '👤'
        });
      });

      recentListings.forEach(listing => {
        activities.push({
          type: 'listing_created',
          timestamp: listing.createdAt,
          data: { 
            title: listing.title, 
            userName: listing.user?.name,
            status: listing.status 
          },
          icon: '📦'
        });
      });

      recentTransactions.forEach(transaction => {
        activities.push({
          type: 'transaction_completed',
          timestamp: transaction.createdAt,
          data: {
            amount: transaction.amount,
            type: transaction.type,
            buyer: transaction.buyer?.name,
            seller: transaction.seller?.name
          },
          icon: '💳'
        });
      });

      recentMessages.forEach(message => {
        activities.push({
          type: 'message_sent',
          timestamp: message.createdAt,
          data: {
            sender: message.sender?.name,
            preview: message.content.substring(0, 50) + '...'
          },
          icon: '💬'
        });
      });

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

    } catch (error) {
      console.error('Activity feed error:', error);
      throw error;
    }
  }

  /**
   * Get system health and performance metrics
   */
  async getSystemHealth() {
    try {
      const [
        databaseHealth,
        searchHealth,
        emailHealth,
        serverMetrics
      ] = await Promise.all([
        this.getDatabaseHealth(),
        searchService.healthCheck(),
        this.getEmailHealth(),
        this.getServerMetrics()
      ]);

      const overallHealth = this.calculateOverallHealth([
        databaseHealth,
        searchHealth,
        emailHealth,
        serverMetrics
      ]);

      return {
        overall: overallHealth,
        services: {
          database: databaseHealth,
          search: searchHealth,
          email: emailHealth,
          server: serverMetrics
        },
        lastChecked: new Date()
      };
    } catch (error) {
      console.error('System health error:', error);
      return {
        overall: { status: 'error', message: error.message },
        lastChecked: new Date()
      };
    }
  }

  /**
   * Moderate listing content
   */
  async moderateListing(listingId, action, reason = '') {
    try {
      const listing = await ProductListing.findById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      const user = await User.findById(listing.user);
      let updateData = {};
      let emailType = null;

      switch (action) {
        case 'approve':
          updateData = { status: 'available', flagged: false };
          emailType = 'listing_approved';
          break;
        
        case 'reject':
          updateData = { status: 'rejected', rejectionReason: reason };
          emailType = 'listing_rejected';
          break;
        
        case 'flag':
          updateData = { flagged: true, flagReason: reason };
          emailType = 'listing_flagged';
          break;
        
        case 'suspend':
          updateData = { status: 'suspended', suspensionReason: reason };
          emailType = 'listing_suspended';
          break;
        
        default:
          throw new Error('Invalid moderation action');
      }

      await ProductListing.findByIdAndUpdate(listingId, updateData);

      // Send notification email to user
      if (emailType && user) {
        await emailService.sendModerationEmail(user, listing, action, reason);
      }

      // Log moderation action
      await this.logModerationAction(listingId, action, reason);

      return { success: true, action, listingId };
    } catch (error) {
      console.error('Listing moderation error:', error);
      throw error;
    }
  }

  /**
   * Manage user account (suspend, activate, upgrade, etc.)
   */
  async manageUser(userId, action, data = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let updateData = {};
      let emailType = null;

      switch (action) {
        case 'suspend':
          updateData = { 
            status: 'suspended', 
            suspensionReason: data.reason,
            suspendedAt: new Date()
          };
          emailType = 'account_suspended';
          break;
        
        case 'activate':
          updateData = { 
            status: 'active',
            suspensionReason: null,
            suspendedAt: null
          };
          emailType = 'account_activated';
          break;
        
        case 'upgrade_subscription':
          updateData = { subscriptionTier: data.tier };
          emailType = 'subscription_upgraded';
          break;
        
        case 'verify':
          updateData = { 
            'verification.email.verified': true,
            'verification.phone.verified': true,
            trustScore: Math.min(user.trustScore + 20, 100)
          };
          emailType = 'account_verified';
          break;
        
        default:
          throw new Error('Invalid user management action');
      }

      await User.findByIdAndUpdate(userId, updateData);

      // Send notification email
      if (emailType) {
        await emailService.sendUserManagementEmail(user, action, data);
      }

      // Log admin action
      await this.logAdminAction(userId, action, data);

      return { success: true, action, userId };
    } catch (error) {
      console.error('User management error:', error);
      throw error;
    }
  }

  /**
   * Get promotion campaign analytics
   */
  async getPromotionCampaigns() {
    try {
      const campaigns = await Transaction.aggregate([
        {
          $match: {
            type: 'promotion',
            status: 'completed'
          }
        },
        {
          $group: {
            _id: '$promotionData.packageId',
            totalRevenue: { $sum: '$amount' },
            totalSales: { $sum: 1 },
            averagePrice: { $avg: '$amount' },
            lastSale: { $max: '$createdAt' }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        }
      ]);

      // Get conversion rates for each package
      const campaignMetrics = await Promise.all(
        campaigns.map(async (campaign) => {
          const views = await Analytics.countDocuments({
            event: 'promotion_viewed',
            'properties.packageId': campaign._id
          });

          return {
            ...campaign,
            conversionRate: views > 0 ? (campaign.totalSales / views * 100).toFixed(2) : 0,
            views
          };
        })
      );

      return campaignMetrics;
    } catch (error) {
      console.error('Promotion campaigns error:', error);
      throw error;
    }
  }

  /**
   * Export platform data for reports
   */
  async exportData(type, filters = {}) {
    try {
      const { startDate, endDate, format = 'json' } = filters;
      let data = [];

      switch (type) {
        case 'users':
          data = await User.find({
            createdAt: { 
              $gte: startDate || new Date('2020-01-01'),
              $lte: endDate || new Date()
            }
          }).select('-password').lean();
          break;
        
        case 'listings':
          data = await ProductListing.find({
            createdAt: {
              $gte: startDate || new Date('2020-01-01'),
              $lte: endDate || new Date()
            }
          }).populate('user', 'name email').lean();
          break;
        
        case 'transactions':
          data = await Transaction.find({
            createdAt: {
              $gte: startDate || new Date('2020-01-01'),
              $lte: endDate || new Date()
            }
          }).populate('buyer seller', 'name email').lean();
          break;
        
        case 'revenue':
          data = await analyticsService.getRevenueDashboard('30d');
          break;
        
        default:
          throw new Error('Invalid export type');
      }

      return {
        type,
        data,
        generatedAt: new Date(),
        count: Array.isArray(data) ? data.length : 1
      };
    } catch (error) {
      console.error('Data export error:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  
  async getUserMetrics(startDate) {
    const [total, active, new_, verified, suspended] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ 'verification.email.verified': true }),
      User.countDocuments({ status: 'suspended' })
    ]);

    return { total, active, new: new_, verified, suspended };
  }

  async getListingMetrics(startDate) {
    const [total, active, new_, featured, promoted] = await Promise.all([
      ProductListing.countDocuments(),
      ProductListing.countDocuments({ status: 'available' }),
      ProductListing.countDocuments({ createdAt: { $gte: startDate } }),
      ProductListing.countDocuments({ featured: true }),
      ProductListing.countDocuments({ promotion: { $exists: true } })
    ]);

    return { total, active, new: new_, featured, promoted };
  }

  async getRevenueMetrics(startDate) {
    const result = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
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

    const current = result[0] || { total: 0, count: 0 };
    
    // Calculate growth vs previous period
    const periodLength = Date.now() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodLength);
    const previousResult = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: previousStart, $lte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$platformFee' }
        }
      }
    ]);

    const previous = previousResult[0]?.total || 0;
    const growth = previous > 0 ? ((current.total - previous) / previous * 100).toFixed(2) : 0;

    return { ...current, growth: parseFloat(growth) };
  }

  async getEngagementMetrics(startDate) {
    const [pageViews, searches, messages, listings] = await Promise.all([
      Analytics.countDocuments({ 
        event: 'page_view',
        timestamp: { $gte: startDate }
      }),
      Analytics.countDocuments({ 
        event: 'search_performed',
        timestamp: { $gte: startDate }
      }),
      Message.countDocuments({ createdAt: { $gte: startDate } }),
      ProductListing.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    return { pageViews, searches, messages, listings };
  }

  async getDatabaseHealth() {
    try {
      const start = Date.now();
      await User.findOne().limit(1);
      const responseTime = Date.now() - start;
      
      return {
        status: responseTime < 100 ? 'healthy' : 'slow',
        responseTime: `${responseTime}ms`,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastChecked: new Date()
      };
    }
  }

  async getEmailHealth() {
    try {
      // Simple check - could be enhanced with actual email sending test
      const emailConfig = process.env.SENDGRID_API_KEY || process.env.SMTP_USER;
      
      return {
        status: emailConfig ? 'healthy' : 'warning',
        configured: !!emailConfig,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastChecked: new Date()
      };
    }
  }

  async getServerMetrics() {
    const used = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      status: 'healthy',
      memory: {
        used: Math.round(used.heapUsed / 1024 / 1024),
        total: Math.round(used.heapTotal / 1024 / 1024)
      },
      uptime: Math.round(uptime / 60), // minutes
      lastChecked: new Date()
    };
  }

  calculateOverallHealth(services) {
    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const totalCount = services.length;
    const healthPercentage = (healthyCount / totalCount) * 100;
    
    if (healthPercentage === 100) return { status: 'healthy', score: 100 };
    if (healthPercentage >= 75) return { status: 'warning', score: healthPercentage };
    return { status: 'critical', score: healthPercentage };
  }

  async logModerationAction(listingId, action, reason) {
    // Implementation for logging moderation actions
    console.log(`Moderation: ${action} on listing ${listingId}, reason: ${reason}`);
  }

  async logAdminAction(userId, action, data) {
    // Implementation for logging admin actions
    console.log(`Admin action: ${action} on user ${userId}`, data);
  }

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

  async getTotalRevenue(startDate) {
    const result = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$platformFee' },
          count: { $sum: 1 }
        }
      }
    ]);

    return result[0] || { amount: 0, count: 0, growth: 0 };
  }

  async getRevenueByType(startDate) {
    return await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          revenue: { $sum: '$platformFee' },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getRevenueTimeline(startDate) {
    return await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
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

  async getTopSpenders(startDate, limit) {
    return await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$buyer',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          transactionCount: 1
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: limit
      }
    ]);
  }

  async getPromotionPerformance(startDate) {
    return await Transaction.aggregate([
      {
        $match: {
          type: 'promotion',
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$promotionData.packageId',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
          averagePrice: { $avg: '$amount' }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);
  }

  async getConversionMetrics(startDate) {
    const [visits, signups, listings, purchases] = await Promise.all([
      Analytics.countDocuments({ 
        event: 'page_view', 
        timestamp: { $gte: startDate } 
      }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      ProductListing.countDocuments({ createdAt: { $gte: startDate } }),
      Transaction.countDocuments({ 
        status: 'completed', 
        createdAt: { $gte: startDate } 
      })
    ]);

    return {
      visitToSignup: visits > 0 ? ((signups / visits) * 100).toFixed(2) : 0,
      signupToListing: signups > 0 ? ((listings / signups) * 100).toFixed(2) : 0,
      listingToPurchase: listings > 0 ? ((purchases / listings) * 100).toFixed(2) : 0,
      overallConversion: visits > 0 ? ((purchases / visits) * 100).toFixed(2) : 0
    };
  }

  async getRecentActivity(limit) {
    return await Analytics.find({
      event: { $in: ['user_registered', 'listing_created', 'payment_completed'] }
    })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
  }
}

export default new AdminService();
