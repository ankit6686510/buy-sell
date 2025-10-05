import api from './api';

// Create company profile
export const createCompanyProfile = async (companyData) => {
  try {
    const response = await api.post('/api/companies', companyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create company profile' };
  }
};

// Get company profile by ID
export const getCompanyProfile = async (id) => {
  try {
    const response = await api.get(`/api/companies/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch company profile' };
  }
};

// Get my company profile
export const getMyCompanyProfile = async () => {
  try {
    const response = await api.get('/api/companies/me/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch company profile' };
  }
};

// Update company profile
export const updateCompanyProfile = async (updateData) => {
  try {
    const response = await api.put('/api/companies/me/profile', updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update company profile' };
  }
};

// Upload company logo or banner
export const uploadCompanyImage = async (file, type) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(`/api/companies/me/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: `Failed to upload ${type}` };
  }
};

// Upload company document
export const uploadCompanyDocument = async (file, type, documentNumber = '') => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    if (documentNumber) {
      formData.append('documentNumber', documentNumber);
    }
    
    const response = await api.post('/api/companies/me/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload document' };
  }
};

// Search companies
export const searchCompanies = async (filters = {}) => {
  try {
    const response = await api.get('/api/companies/search', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search companies' };
  }
};

// Get companies by category
export const getCompaniesByCategory = async (category, options = {}) => {
  try {
    const response = await api.get(`/api/companies/category/${category}`, { params: options });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch companies' };
  }
};

// Add lead credits
export const addLeadCredits = async (credits, packageType) => {
  try {
    const response = await api.post('/api/companies/me/credits', {
      credits,
      packageType
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add lead credits' };
  }
};

// Get company analytics
export const getCompanyAnalytics = async (timeframe = '30d') => {
  try {
    const response = await api.get('/api/companies/me/analytics', {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch analytics' };
  }
};

// Lead packages (static data for now)
export const getLeadPackages = () => {
  return [
    {
      id: 'starter',
      name: 'Starter Package',
      credits: 50,
      price: 999,
      validity: 30,
      pricePerLead: 19.98,
      features: [
        'Basic leads',
        'Email support',
        'Lead tracking',
        'Basic analytics'
      ],
      popular: false
    },
    {
      id: 'growth',
      name: 'Growth Package',
      credits: 200,
      price: 2999,
      validity: 30,
      pricePerLead: 14.99,
      features: [
        'Verified leads',
        'Priority support',
        'Advanced analytics',
        'Lead scoring',
        'Response tracking'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Package',
      credits: 1000,
      price: 9999,
      validity: 30,
      pricePerLead: 9.99,
      features: [
        'Premium leads',
        '24/7 support',
        'Dedicated manager',
        'API access',
        'Custom integration',
        'Advanced reporting'
      ],
      popular: false
    }
  ];
};

// Electronics categories for B2B
export const getElectronicsCategories = () => {
  return {
    'Consumer Electronics': [
      'Mobile & Accessories',
      'Laptops & Computers',
      'Audio & Video',
      'Cameras & Photography',
      'Gaming Accessories',
      'Wearable Technology'
    ],
    'Home Appliances': [
      'Kitchen Appliances',
      'Cooling & Heating',
      'Cleaning Appliances',
      'Personal Care',
      'Small Appliances',
      'Built-in Appliances'
    ],
    'Electrical Components': [
      'Wires & Cables',
      'Switches & Sockets',
      'Circuit Breakers',
      'Transformers',
      'Capacitors',
      'Resistors',
      'Semiconductors'
    ],
    'Lighting': [
      'LED Lights',
      'Industrial Lighting',
      'Decorative Lighting',
      'Emergency Lighting',
      'Street Lighting',
      'Smart Lighting'
    ],
    'Industrial Equipment': [
      'Motors & Drives',
      'Control Panels',
      'Power Supplies',
      'Testing Equipment',
      'Automation Equipment',
      'Safety Equipment'
    ]
  };
};

// Business types
export const getBusinessTypes = () => {
  return [
    {
      value: 'manufacturer',
      label: 'Manufacturer',
      description: 'Companies that produce electronics and electrical products'
    },
    {
      value: 'wholesaler',
      label: 'Wholesaler',
      description: 'Bulk traders and distributors'
    },
    {
      value: 'distributor',
      label: 'Distributor',
      description: 'Regional and national distributors'
    },
    {
      value: 'retailer',
      label: 'Retailer',
      description: 'Retail stores and online sellers'
    },
    {
      value: 'service_provider',
      label: 'Service Provider',
      description: 'Installation, repair, and maintenance services'
    }
  ];
};

// Company verification status helpers
export const getVerificationStatusInfo = (status) => {
  const statusMap = {
    pending: {
      color: 'warning',
      label: 'Verification Pending',
      description: 'Your documents are being reviewed'
    },
    in_review: {
      color: 'info',
      label: 'Under Review',
      description: 'Our team is verifying your documents'
    },
    verified: {
      color: 'success',
      label: 'Verified',
      description: 'Your business is verified'
    },
    rejected: {
      color: 'error',
      label: 'Verification Rejected',
      description: 'Please re-submit correct documents'
    },
    suspended: {
      color: 'error',
      label: 'Account Suspended',
      description: 'Contact support for assistance'
    }
  };
  
  return statusMap[status] || statusMap.pending;
};

// Subscription tier helpers
export const getSubscriptionTierInfo = (tier) => {
  const tierMap = {
    free: {
      name: 'Free',
      color: 'default',
      features: ['Basic listing', 'Manual verification', '5 inquiries/month'],
      limits: { products: 10, leads: 5 }
    },
    starter: {
      name: 'Starter',
      color: 'primary',
      features: ['Featured listing', 'Priority verification', '20 inquiries/month', 'Analytics'],
      limits: { products: 50, leads: 20 }
    },
    growth: {
      name: 'Growth',
      color: 'secondary',
      features: ['Top placement', 'Instant verification', '100 inquiries/month', 'Advanced analytics', 'API access'],
      limits: { products: 200, leads: 100 }
    },
    enterprise: {
      name: 'Enterprise',
      color: 'success',
      features: ['Premium placement', 'Dedicated support', 'Unlimited inquiries', 'Custom integration'],
      limits: { products: -1, leads: -1 } // -1 means unlimited
    }
  };
  
  return tierMap[tier] || tierMap.free;
};
