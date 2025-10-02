import { 
  UserActivity, 
  PageView, 
  Conversion, 
  ABTest, 
  Performance, 
  ErrorLog,
  getDeviceType,
  getBrowserInfo 
} from '../models/Analytics.js';

// Track user activity
export const trackActivity = async (req, res) => {
  try {
    const { action, metadata = {} } = req.body;
    const userAgent = req.get('User-Agent');
    const { browser, platform } = getBrowserInfo(userAgent);
    
    const activity = new UserActivity({
      user: req.user?.id,
      sessionId: req.sessionID || req.headers['x-session-id'],
      action,
      metadata: {
        ...metadata,
        userAgent,
        ipAddress: req.ip,
        referrer: req.get('Referer'),
        pageUrl: req.get('Origin') + req.originalUrl,
        deviceType: getDeviceType(userAgent),
        browser,
        platform
      }
    });
    
    await activity.save();
    res.status(201).json({ message: 'Activity tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking activity', error: error.message });
  }
};

// Track page views
export const trackPageView = async (req, res) => {
  try {
    const { page, url, duration, metadata = {} } = req.body;
    const userAgent = req.get('User-Agent');
    const { browser, platform } = getBrowserInfo(userAgent);
    
    const pageView = new PageView({
      user: req.user?.id,
      sessionId: req.sessionID || req.headers['x-session-id'],
      page,
      url,
      referrer: req.get('Referer'),
      duration,
      metadata: {
        ...metadata,
        userAgent,
        ipAddress: req.ip,
        deviceType: getDeviceType(userAgent),
        browser,
        platform
      }
    });
    
    await pageView.save();
    res.status(201).json({ message: 'Page view tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking page view', error: error.message });
  }
};

// Track conversions
export const trackConversion = async (req, res) => {
  try {
    const { conversionType, value, metadata = {} } = req.body;
    
    const conversion = new Conversion({
      user: req.user?.id,
      sessionId: req.sessionID || req.headers['x-session-id'],
      conversionType,
      value,
      metadata
    });
    
    await conversion.save();
    res.status(201).json({ message: 'Conversion tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking conversion', error: error.message });
  }
};

// Track errors
export const trackError = async (req, res) => {
  try {
    const { errorType, errorMessage, errorStack, page, severity, metadata } = req.body;
    
    const errorLog = new ErrorLog({
      user: req.user?.id,
      sessionId: req.sessionID || req.headers['x-session-id'],
      errorType,
      errorMessage,
      errorStack,
      page,
      userAgent: req.get('User-Agent'),
      severity,
      metadata
    });
    
    await errorLog.save();
    res.status(201).json({ message: 'Error tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking error', error: error.message });
  }
};

// Get analytics dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // Get user activity stats
    const activityStats = await UserActivity.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get page view stats
    const pageViewStats = await PageView.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$page',
          views: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      },
      { $sort: { views: -1 } }
    ]);
    
    // Get device type distribution
    const deviceStats = await PageView.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$metadata.deviceType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get conversion stats
    const conversionStats = await Conversion.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$conversionType',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);
    
    // Get error stats
    const errorStats = await ErrorLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { type: '$errorType', severity: '$severity' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get daily activity trend
    const dailyTrend = await UserActivity.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          activities: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          date: '$_id',
          activities: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    res.json({
      period,
      activityStats,
      pageViewStats,
      deviceStats,
      conversionStats,
      errorStats,
      dailyTrend,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// Get user journey data
export const getUserJourney = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    // Get user activities in chronological order
    const activities = await UserActivity.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Get page views
    const pageViews = await PageView.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Get conversions
    const conversions = await Conversion.find({ user: userId })
      .sort({ timestamp: -1 })
      .lean();
    
    // Merge and sort all events
    const allEvents = [
      ...activities.map(a => ({ ...a, type: 'activity' })),
      ...pageViews.map(p => ({ ...p, type: 'pageview' })),
      ...conversions.map(c => ({ ...c, type: 'conversion' }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      userId,
      events: allEvents.slice(0, parseInt(limit)),
      totalEvents: allEvents.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user journey', error: error.message });
  }
};

// Get funnel analysis
export const getFunnelAnalysis = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    startDate.setDate(now.getDate() - parseInt(period.replace('d', '')));
    
    // Define funnel steps
    const funnelSteps = [
      { name: 'Registration', action: 'register' },
      { name: 'Email Verification', conversionType: 'email_verification' },
      { name: 'First Listing', conversionType: 'first_listing' },
      { name: 'First Message', conversionType: 'first_message' },
      { name: 'First Match', conversionType: 'first_match' }
    ];
    
    const funnelData = [];
    
    for (const step of funnelSteps) {
      let count = 0;
      
      if (step.action) {
        count = await UserActivity.countDocuments({
          action: step.action,
          timestamp: { $gte: startDate }
        });
      } else if (step.conversionType) {
        count = await Conversion.countDocuments({
          conversionType: step.conversionType,
          timestamp: { $gte: startDate }
        });
      }
      
      funnelData.push({
        step: step.name,
        count,
        percentage: funnelData.length === 0 ? 100 : (count / funnelData[0].count * 100).toFixed(2)
      });
    }
    
    res.json({
      period,
      funnel: funnelData,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating funnel analysis', error: error.message });
  }
};

// Track A/B test participation
export const trackABTest = async (req, res) => {
  try {
    const { testName, variant, conversion, conversionType, metadata } = req.body;
    
    const abTest = new ABTest({
      user: req.user?.id,
      sessionId: req.sessionID || req.headers['x-session-id'],
      testName,
      variant,
      conversion,
      conversionType,
      metadata
    });
    
    await abTest.save();
    res.status(201).json({ message: 'A/B test data tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking A/B test', error: error.message });
  }
};

// Get A/B test results
export const getABTestResults = async (req, res) => {
  try {
    const { testName } = req.params;
    
    const results = await ABTest.aggregate([
      { $match: { testName } },
      {
        $group: {
          _id: '$variant',
          participants: { $sum: 1 },
          conversions: { $sum: { $cond: ['$conversion', 1, 0] } }
        }
      },
      {
        $project: {
          variant: '$_id',
          participants: 1,
          conversions: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$conversions', '$participants'] },
              100
            ]
          }
        }
      }
    ]);
    
    res.json({
      testName,
      results,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching A/B test results', error: error.message });
  }
};
