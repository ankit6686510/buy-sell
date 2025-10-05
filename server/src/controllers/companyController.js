import Company from '../models/Company.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/fileUpload.js';
import analyticsService from '../services/analyticsService.js';

// Create company profile
export const createCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user account type is business
    const user = await User.findById(userId);
    if (user.accountType !== 'business') {
      return res.status(400).json({
        success: false,
        message: 'Only business accounts can create company profiles'
      });
    }
    
    // Check if company profile already exists
    const existingCompany = await Company.findOne({ user: userId });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company profile already exists'
      });
    }
    
    const {
      companyName,
      description,
      businessType,
      categories,
      subcategories,
      yearEstablished,
      employeeCount,
      annualTurnover,
      businessAddress,
      contactInfo,
      gstNumber,
      certifications
    } = req.body;
    
    // Validate required fields
    if (!companyName || !businessType || !categories || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Company name, business type, and at least one category are required'
      });
    }
    
    // Check if GST number already exists
    if (gstNumber) {
      const existingGST = await Company.findByGST(gstNumber);
      if (existingGST) {
        return res.status(400).json({
          success: false,
          message: 'GST number already registered'
        });
      }
    }
    
    // Create company profile
    const companyData = {
      user: userId,
      companyName: companyName.trim(),
      description: description?.trim() || '',
      businessType,
      categories: Array.isArray(categories) ? categories : [categories],
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      businessAddress,
      contactInfo: {
        ...contactInfo,
        email: contactInfo?.email || user.email,
        phone: contactInfo?.phone || user.phoneNumber
      }
    };
    
    // Add optional fields if provided
    if (yearEstablished) companyData.yearEstablished = yearEstablished;
    if (employeeCount) companyData.employeeCount = employeeCount;
    if (annualTurnover) companyData.annualTurnover = annualTurnover;
    if (gstNumber) companyData.gstNumber = gstNumber.toUpperCase();
    if (certifications) companyData.certifications = certifications;
    
    const company = new Company(companyData);
    await company.save();
    
    // Update user's onboarding status
    user.subscriptionTier = 'basic'; // Upgrade from individual
    await user.save();
    
    // Track analytics
    await analyticsService.trackEvent({
      userId,
      event: 'company_profile_created',
      properties: {
        businessType,
        categories,
        hasGST: !!gstNumber
      }
    });
    
    const populatedCompany = await Company.findById(company._id)
      .populate('user', 'name email phoneNumber')
      .populate('productCount')
      .populate('catalogCount');
    
    res.status(201).json({
      success: true,
      message: 'Company profile created successfully',
      company: populatedCompany
    });
    
  } catch (error) {
    console.error('Create company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company profile',
      error: error.message
    });
  }
};

// Get company profile
export const getCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerUserId = req.user?.id;
    
    const company = await Company.findById(id)
      .populate('user', 'name email phoneNumber rating totalRatings badges trustScore')
      .populate('productCount')
      .populate('catalogCount');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    // Update profile view count (if not viewing own profile)
    if (viewerUserId && company.user._id.toString() !== viewerUserId) {
      company.updateMetrics('profileViews');
      
      // Track analytics
      await analyticsService.trackEvent({
        userId: viewerUserId,
        event: 'company_profile_viewed',
        properties: {
          companyId: id,
          companyName: company.companyName,
          businessType: company.businessType
        }
      });
    }
    
    res.json({
      success: true,
      company
    });
    
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company profile',
      error: error.message
    });
  }
};

// Update company profile
export const updateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    // Find company by user ID
    const company = await Company.findOne({ user: userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }
    
    // Check if GST number is being updated and if it already exists
    if (updateData.gstNumber && updateData.gstNumber !== company.gstNumber) {
      const existingGST = await Company.findByGST(updateData.gstNumber);
      if (existingGST && existingGST._id.toString() !== company._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'GST number already registered by another company'
        });
      }
      updateData.gstNumber = updateData.gstNumber.toUpperCase();
    }
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.user;
    delete updateData.verificationStatus;
    delete updateData.verifiedAt;
    delete updateData.leadCredits;
    delete updateData.metrics;
    
    // Update company
    Object.assign(company, updateData);
    await company.save();
    
    // Track analytics
    await analyticsService.trackEvent({
      userId,
      event: 'company_profile_updated',
      properties: {
        companyId: company._id,
        fieldsUpdated: Object.keys(updateData)
      }
    });
    
    const updatedCompany = await Company.findById(company._id)
      .populate('user', 'name email phoneNumber')
      .populate('productCount')
      .populate('catalogCount');
    
    res.json({
      success: true,
      message: 'Company profile updated successfully',
      company: updatedCompany
    });
    
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company profile',
      error: error.message
    });
  }
};

// Upload company logo or banner
export const uploadCompanyImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params; // 'logo' or 'banner'
    
    if (!['logo', 'banner'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type. Must be logo or banner'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    // Find company
    const company = await Company.findOne({ user: userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }
    
    // Upload to cloudinary
    const uploadOptions = {
      folder: `companies/${company._id}`,
      transformation: type === 'logo' 
        ? { width: 200, height: 200, crop: 'fill' }
        : { width: 800, height: 300, crop: 'fill' }
    };
    
    const result = await uploadToCloudinary(req.file.buffer, uploadOptions);
    
    // Update company with new image URL
    company[type] = result.secure_url;
    await company.save();
    
    res.json({
      success: true,
      message: `Company ${type} uploaded successfully`,
      imageUrl: result.secure_url
    });
    
  } catch (error) {
    console.error('Upload company image error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to upload company ${req.params.type}`,
      error: error.message
    });
  }
};

// Upload company documents
export const uploadCompanyDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, documentNumber } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided'
      });
    }
    
    const allowedTypes = ['gst', 'pan', 'trade_license', 'incorporation_certificate', 'msme', 'iso_certificate'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }
    
    // Find company
    const company = await Company.findOne({ user: userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }
    
    // Upload document to cloudinary
    const uploadOptions = {
      folder: `companies/${company._id}/documents`,
      resource_type: 'auto'
    };
    
    const result = await uploadToCloudinary(req.file.buffer, uploadOptions);
    
    // Check if document type already exists
    const existingDocIndex = company.documents.findIndex(doc => doc.type === type);
    
    const documentData = {
      type,
      url: result.secure_url,
      documentNumber: documentNumber || '',
      verified: false,
      uploadedAt: new Date()
    };
    
    if (existingDocIndex >= 0) {
      // Update existing document
      company.documents[existingDocIndex] = documentData;
    } else {
      // Add new document
      company.documents.push(documentData);
    }
    
    await company.save();
    
    // Track analytics
    await analyticsService.trackEvent({
      userId,
      event: 'company_document_uploaded',
      properties: {
        companyId: company._id,
        documentType: type
      }
    });
    
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: documentData
    });
    
  } catch (error) {
    console.error('Upload company document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Get my company profile
export const getMyCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const company = await Company.findOne({ user: userId })
      .populate('user', 'name email phoneNumber')
      .populate('productCount')
      .populate('catalogCount');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }
    
    res.json({
      success: true,
      company
    });
    
  } catch (error) {
    console.error('Get my company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company profile',
      error: error.message
    });
  }
};

// Search companies
export const searchCompanies = async (req, res) => {
  try {
    const {
      q = '',
      category,
      businessType,
      city,
      state,
      verificationStatus = 'verified',
      sortBy = 'rating',
      page = 1,
      limit = 20
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery = {
      isActive: true,
      verificationStatus
    };
    
    if (q) {
      searchQuery.$text = { $search: q };
    }
    
    if (category) {
      searchQuery.categories = { $in: [category] };
    }
    
    if (businessType) {
      searchQuery.businessType = businessType;
    }
    
    if (city) {
      searchQuery['businessAddress.city'] = new RegExp(city, 'i');
    }
    
    if (state) {
      searchQuery['businessAddress.state'] = new RegExp(state, 'i');
    }
    
    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { 'metrics.rating': -1, 'metrics.reviewCount': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { 'metrics.profileViews': -1 };
        break;
      case 'verified':
        sortOptions = { verificationStatus: -1, 'metrics.rating': -1 };
        break;
      default:
        sortOptions = { 'metrics.rating': -1 };
    }
    
    const companies = await Company.find(searchQuery)
      .populate('user', 'name rating totalRatings badges')
      .populate('productCount')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalCompanies = await Company.countDocuments(searchQuery);
    
    res.json({
      success: true,
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCompanies,
        pages: Math.ceil(totalCompanies / limit),
        hasNext: page * limit < totalCompanies,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Search companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search companies',
      error: error.message
    });
  }
};

// Get companies by category
export const getCompaniesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10, featured = false } = req.query;
    
    const query = {
      categories: { $in: [category] },
      isActive: true,
      verificationStatus: 'verified'
    };
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    const companies = await Company.find(query)
      .populate('user', 'name rating totalRatings')
      .populate('productCount')
      .sort({ 'metrics.rating': -1, 'metrics.profileViews': -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      companies,
      category
    });
    
  } catch (error) {
    console.error('Get companies by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
};

// Add lead credits
export const addLeadCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { credits, packageType } = req.body;
    
    if (!credits || credits <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credit amount'
      });
    }
    
    const company = await Company.findOne({ user: userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }
    
    // Add credits
    await company.addLeadCredits(credits);
    
    // Track analytics
    await analyticsService.trackEvent({
      userId,
      event: 'lead_credits_purchased',
      properties: {
        companyId: company._id,
        credits,
        packageType
      }
    });
    
    res.json({
      success: true,
      message: 'Lead credits added successfully',
      leadCredits: company.leadCredits
    });
    
  } catch (error) {
    console.error('Add lead credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add lead credits',
      error: error.message
    });
  }
};

// Get company analytics
export const getCompanyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30d' } = req.query;
    
    const company = await Company.findOne({ user: userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }
    
    // Get analytics from analytics service
    const analytics = await analyticsService.getCompanyAnalytics(company._id, timeframe);
    
    res.json({
      success: true,
      analytics: {
        ...analytics,
        currentMetrics: company.metrics,
        leadCredits: company.leadCredits,
        subscriptionTier: company.subscriptionTier
      }
    });
    
  } catch (error) {
    console.error('Get company analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};
