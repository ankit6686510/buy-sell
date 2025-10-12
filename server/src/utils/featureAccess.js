/**
 * Feature Access Control System
 * Manages what features are available to different user types and subscription tiers
 */

// Feature definitions
export const FEATURES = {
  // Basic features available to all users
  BUY_PRODUCTS: 'buy_products',
  SELL_PRODUCTS: 'sell_products',
  BASIC_MESSAGING: 'basic_messaging',
  BASIC_SEARCH: 'basic_search',
  
  // Business features (require company profile)
  CREATE_COMPANY_PROFILE: 'create_company_profile',
  SUBMIT_RFQS: 'submit_rfqs',
  RECEIVE_RFQS: 'receive_rfqs',
  LEAD_CREDITS: 'lead_credits',
  BASIC_ANALYTICS: 'basic_analytics',
  DOCUMENT_VERIFICATION: 'document_verification',
  BULK_OPERATIONS: 'bulk_operations',
  
  // Pro business features
  ADVANCED_ANALYTICS: 'advanced_analytics',
  PRIORITY_SUPPORT: 'priority_support',
  ENHANCED_LEAD_CREDITS: 'enhanced_lead_credits',
  CUSTOM_BRANDING: 'custom_branding',
  
  // Enterprise features
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',
  DEDICATED_MANAGER: 'dedicated_manager',
  UNLIMITED_CREDITS: 'unlimited_credits'
};

// Feature access matrix
const FEATURE_MATRIX = {
  individual: {
    basic: [
      FEATURES.BUY_PRODUCTS,
      FEATURES.SELL_PRODUCTS,
      FEATURES.BASIC_MESSAGING,
      FEATURES.BASIC_SEARCH,
      FEATURES.CREATE_COMPANY_PROFILE,
      FEATURES.SUBMIT_RFQS
    ]
  },
  business: {
    basic: [
      FEATURES.BUY_PRODUCTS,
      FEATURES.SELL_PRODUCTS,
      FEATURES.BASIC_MESSAGING,
      FEATURES.BASIC_SEARCH,
      FEATURES.CREATE_COMPANY_PROFILE,
      FEATURES.SUBMIT_RFQS,
      FEATURES.RECEIVE_RFQS,
      FEATURES.LEAD_CREDITS,
      FEATURES.BASIC_ANALYTICS,
      FEATURES.DOCUMENT_VERIFICATION,
      FEATURES.BULK_OPERATIONS
    ],
    pro: [
      FEATURES.BUY_PRODUCTS,
      FEATURES.SELL_PRODUCTS,
      FEATURES.BASIC_MESSAGING,
      FEATURES.BASIC_SEARCH,
      FEATURES.CREATE_COMPANY_PROFILE,
      FEATURES.SUBMIT_RFQS,
      FEATURES.RECEIVE_RFQS,
      FEATURES.LEAD_CREDITS,
      FEATURES.BASIC_ANALYTICS,
      FEATURES.DOCUMENT_VERIFICATION,
      FEATURES.BULK_OPERATIONS,
      FEATURES.ADVANCED_ANALYTICS,
      FEATURES.PRIORITY_SUPPORT,
      FEATURES.ENHANCED_LEAD_CREDITS,
      FEATURES.CUSTOM_BRANDING
    ],
    business: [ // This is the enterprise tier
      FEATURES.BUY_PRODUCTS,
      FEATURES.SELL_PRODUCTS,
      FEATURES.BASIC_MESSAGING,
      FEATURES.BASIC_SEARCH,
      FEATURES.CREATE_COMPANY_PROFILE,
      FEATURES.SUBMIT_RFQS,
      FEATURES.RECEIVE_RFQS,
      FEATURES.LEAD_CREDITS,
      FEATURES.BASIC_ANALYTICS,
      FEATURES.DOCUMENT_VERIFICATION,
      FEATURES.BULK_OPERATIONS,
      FEATURES.ADVANCED_ANALYTICS,
      FEATURES.PRIORITY_SUPPORT,
      FEATURES.ENHANCED_LEAD_CREDITS,
      FEATURES.CUSTOM_BRANDING,
      FEATURES.API_ACCESS,
      FEATURES.WHITE_LABEL,
      FEATURES.DEDICATED_MANAGER,
      FEATURES.UNLIMITED_CREDITS
    ]
  }
};

// Lead credit limits by tier
export const LEAD_CREDIT_LIMITS = {
  individual: { basic: 0 },
  business: {
    basic: 10,    // 10 credits per month
    pro: 50,      // 50 credits per month
    business: -1  // Unlimited
  }
};

// Pricing information
export const SUBSCRIPTION_PRICING = {
  business: {
    basic: { price: 0, currency: 'INR', period: 'month' },
    pro: { price: 999, currency: 'INR', period: 'month' },
    business: { price: 2999, currency: 'INR', period: 'month' }
  }
};

/**
 * Check if a user has access to a specific feature
 * @param {Object} user - User object with accountType and subscriptionTier
 * @param {string} feature - Feature to check access for
 * @param {Object} company - Optional company object for business features
 * @returns {boolean} - Whether user has access to the feature
 */
export const hasFeatureAccess = (user, feature, company = null) => {
  if (!user || !user.accountType || !user.subscriptionTier) {
    return false;
  }
  
  const { accountType, subscriptionTier } = user;
  
  // Get allowed features for user's account type and subscription tier
  const allowedFeatures = FEATURE_MATRIX[accountType]?.[subscriptionTier] || [];
  
  // For business features that require a company profile
  const businessFeatures = [
    FEATURES.RECEIVE_RFQS,
    FEATURES.LEAD_CREDITS,
    FEATURES.BASIC_ANALYTICS,
    FEATURES.DOCUMENT_VERIFICATION,
    FEATURES.BULK_OPERATIONS,
    FEATURES.ADVANCED_ANALYTICS,
    FEATURES.CUSTOM_BRANDING
  ];
  
  if (businessFeatures.includes(feature) && !company) {
    return false;
  }
  
  return allowedFeatures.includes(feature);
};

/**
 * Get all features available to a user
 * @param {Object} user - User object
 * @param {Object} company - Optional company object
 * @returns {Array} - Array of available features
 */
export const getUserFeatures = (user, company = null) => {
  if (!user || !user.accountType || !user.subscriptionTier) {
    return [];
  }
  
  const { accountType, subscriptionTier } = user;
  const allFeatures = FEATURE_MATRIX[accountType]?.[subscriptionTier] || [];
  
  // Filter out business features if no company profile
  if (!company) {
    const businessFeatures = [
      FEATURES.RECEIVE_RFQS,
      FEATURES.LEAD_CREDITS,
      FEATURES.BASIC_ANALYTICS,
      FEATURES.DOCUMENT_VERIFICATION,
      FEATURES.BULK_OPERATIONS,
      FEATURES.ADVANCED_ANALYTICS,
      FEATURES.CUSTOM_BRANDING
    ];
    
    return allFeatures.filter(feature => !businessFeatures.includes(feature));
  }
  
  return allFeatures;
};

/**
 * Get lead credit limit for user
 * @param {Object} user - User object
 * @returns {number} - Monthly lead credit limit (-1 for unlimited)
 */
export const getLeadCreditLimit = (user) => {
  if (!user || !user.accountType || !user.subscriptionTier) {
    return 0;
  }
  
  const { accountType, subscriptionTier } = user;
  return LEAD_CREDIT_LIMITS[accountType]?.[subscriptionTier] || 0;
};

/**
 * Check if user can upgrade to a higher tier
 * @param {Object} user - User object
 * @param {string} targetTier - Target subscription tier
 * @returns {boolean} - Whether upgrade is possible
 */
export const canUpgradeTo = (user, targetTier) => {
  if (!user || !user.accountType || !user.subscriptionTier) {
    return false;
  }
  
  const { accountType, subscriptionTier } = user;
  
  if (accountType === 'individual') {
    // Individual users can only upgrade to business basic first
    return targetTier === 'basic' && subscriptionTier === 'basic';
  }
  
  if (accountType === 'business') {
    const tierOrder = ['basic', 'pro', 'business'];
    const currentIndex = tierOrder.indexOf(subscriptionTier);
    const targetIndex = tierOrder.indexOf(targetTier);
    
    return targetIndex > currentIndex;
  }
  
  return false;
};

/**
 * Get subscription upgrade options for user
 * @param {Object} user - User object
 * @returns {Array} - Array of upgrade options
 */
export const getUpgradeOptions = (user) => {
  if (!user || !user.accountType || !user.subscriptionTier) {
    return [];
  }
  
  const { accountType, subscriptionTier } = user;
  const options = [];
  
  if (accountType === 'business') {
    if (subscriptionTier === 'basic') {
      options.push({
        tier: 'pro',
        name: 'Pro',
        price: SUBSCRIPTION_PRICING.business.pro.price,
        features: [
          'Advanced Analytics',
          'Priority Support',
          '50 Lead Credits/month',
          'Custom Branding'
        ]
      });
      
      options.push({
        tier: 'business',
        name: 'Enterprise',
        price: SUBSCRIPTION_PRICING.business.business.price,
        features: [
          'All Pro Features',
          'API Access',
          'White Label Solution',
          'Unlimited Lead Credits',
          'Dedicated Manager'
        ]
      });
    } else if (subscriptionTier === 'pro') {
      options.push({
        tier: 'business',
        name: 'Enterprise',
        price: SUBSCRIPTION_PRICING.business.business.price,
        features: [
          'All Pro Features',
          'API Access',
          'White Label Solution',
          'Unlimited Lead Credits',
          'Dedicated Manager'
        ]
      });
    }
  }
  
  return options;
};

/**
 * Middleware to check feature access
 * @param {string} requiredFeature - Feature required to access the route
 * @returns {Function} - Express middleware function
 */
export const requireFeature = (requiredFeature) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      // For business features, check if company profile exists
      let company = null;
      const businessFeatures = [
        FEATURES.RECEIVE_RFQS,
        FEATURES.LEAD_CREDITS,
        FEATURES.BASIC_ANALYTICS,
        FEATURES.DOCUMENT_VERIFICATION,
        FEATURES.BULK_OPERATIONS,
        FEATURES.ADVANCED_ANALYTICS,
        FEATURES.CUSTOM_BRANDING
      ];
      
      if (businessFeatures.includes(requiredFeature)) {
        const Company = (await import('../models/Company.js')).default;
        company = await Company.findOne({ user: user.id });
      }
      
      const hasAccess = hasFeatureAccess(user, requiredFeature, company);
      
      if (!hasAccess) {
        const upgrades = getUpgradeOptions(user);
        
        return res.status(403).json({
          success: false,
          message: 'Feature not available in your current subscription',
          feature: requiredFeature,
          currentTier: user.subscriptionTier,
          upgradeOptions: upgrades
        });
      }
      
      // Add feature info to request for controllers to use
      req.userFeatures = getUserFeatures(user, company);
      req.leadCreditLimit = getLeadCreditLimit(user);
      req.company = company;
      
      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking feature access'
      });
    }
  };
};

export default {
  FEATURES,
  hasFeatureAccess,
  getUserFeatures,
  getLeadCreditLimit,
  canUpgradeTo,
  getUpgradeOptions,
  requireFeature,
  SUBSCRIPTION_PRICING
};
