import RFQ from '../models/RFQ.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import analyticsService from '../services/analyticsService.js';
import { uploadToCloudinary } from '../utils/fileUpload.js';

// Create new RFQ
export const createRFQ = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const {
      title,
      description,
      category,
      subcategory,
      quantity,
      unit,
      budgetRange,
      deliveryLocation,
      expectedDelivery,
      specifications,
      additionalRequirements,
      visibility,
      invitedSuppliers,
      maxQuotes
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !quantity || !budgetRange || !deliveryLocation || !expectedDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: title, description, category, quantity, budgetRange, deliveryLocation, expectedDelivery'
      });
    }
    
    // Validate budget range
    if (budgetRange.min >= budgetRange.max) {
      return res.status(400).json({
        success: false,
        message: 'Maximum budget must be greater than minimum budget'
      });
    }
    
    // Validate delivery date
    const deliveryDate = new Date(expectedDelivery);
    if (deliveryDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expected delivery date must be in the future'
      });
    }
    
    // Create RFQ
    const rfqData = {
      buyer: userId,
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory?.trim(),
      quantity,
      unit: unit || 'pieces',
      budgetRange: {
        min: parseFloat(budgetRange.min),
        max: parseFloat(budgetRange.max),
        currency: budgetRange.currency || 'INR'
      },
      deliveryLocation,
      expectedDelivery: deliveryDate,
      specifications: specifications || {},
      additionalRequirements: additionalRequirements || {},
      visibility: visibility || 'public',
      invitedSuppliers: invitedSuppliers || [],
      maxQuotes: maxQuotes || 10,
      status: 'draft'
    };
    
    const rfq = new RFQ(rfqData);
    await rfq.save();
    
    // Track analytics
    await analyticsService.trackEvent({
      userId,
      event: 'rfq_created',
      properties: {
        rfqId: rfq._id,
        category,
        quantity,
        budgetRange: budgetRange.max - budgetRange.min
      }
    });
    
    const populatedRFQ = await RFQ.findById(rfq._id)
      .populate('buyer', 'name email')
      .populate('invitedSuppliers', 'companyName');
    
    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      rfq: populatedRFQ
    });
    
  } catch (error) {
    console.error('Create RFQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create RFQ',
      error: error.message
    });
  }
};

// Get RFQ by ID (public view)
export const getRFQ = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerUserId = req.user?.id;
    
    const rfq = await RFQ.findById(id)
      .populate('buyer', 'name email trustScore badges')
      .populate('invitedSuppliers', 'companyName verificationStatus')
      .populate({
        path: 'quotes.supplier',
        select: 'companyName verificationStatus metrics.rating user',
        populate: {
          path: 'user',
          select: 'name trustScore'
        }
      });
    
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }
    
    // Check if RFQ is accessible
    if (!rfq.isActive) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not available'
      });
    }
    
    // For private RFQs, check access
    if (rfq.visibility === 'private' && viewerUserId !== rfq.buyer.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private RFQ'
      });
    }
    
    // For invited-only RFQs, check if user is invited
    if (rfq.visibility === 'invited_only' && viewerUserId !== rfq.buyer.toString()) {
      const userCompany = await Company.findOne({ user: viewerUserId });
      const isInvited = userCompany && rfq.invitedSuppliers.some(
        supplierId => supplierId.toString() === userCompany._id.toString()
      );
      
      if (!isInvited) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - invitation required'
        });
      }
    }
    
    // Increment view count (if not the buyer viewing)
    if (viewerUserId && viewerUserId !== rfq.buyer._id.toString()) {
      rfq.incrementViews(true);
      
      // Track analytics
      await analyticsService.trackEvent({
        userId: viewerUserId,
        event: 'rfq_viewed',
        properties: {
          rfqId: id,
          category: rfq.category,
          budgetRange: rfq.budgetRange
        }
      });
    }
    
    // Hide quote details for non-buyers (suppliers can only see their own quotes)
    let responseData = rfq.toObject();
    if (viewerUserId !== rfq.buyer._id.toString()) {
      const userCompany = await Company.findOne({ user: viewerUserId });
      responseData.quotes = rfq.quotes.filter(quote => 
        userCompany && quote.supplier.toString() === userCompany._id.toString()
      );
    }
    
    res.json({
      success: true,
      rfq: responseData
    });
    
  } catch (error) {
    console.error('Get RFQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQ',
      error: error.message
    });
  }
};

// Search and filter RFQs
export const searchRFQs = async (req, res) => {
  try {
    const {
      q = '',
      category,
      subcategory,
      city,
      state,
      minBudget,
      maxBudget,
      sortBy = 'newest',
      page = 1,
      limit = 20
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build search query for active RFQs
    const searchQuery = {
      status: 'active',
      visibility: 'public',
      isActive: true,
      expiresAt: { $gte: new Date() }
    };
    
    // Text search
    if (q) {
      searchQuery.$text = { $search: q };
    }
    
    // Category filters
    if (category) {
      searchQuery.category = category;
    }
    if (subcategory) {
      searchQuery.subcategory = subcategory;
    }
    
    // Location filters
    if (city) {
      searchQuery['deliveryLocation.city'] = new RegExp(city, 'i');
    }
    if (state) {
      searchQuery['deliveryLocation.state'] = new RegExp(state, 'i');
    }
    
    // Budget filters
    if (minBudget || maxBudget) {
      searchQuery['budgetRange.min'] = {};
      searchQuery['budgetRange.max'] = {};
      
      if (minBudget) {
        searchQuery['budgetRange.max'] = { $gte: parseFloat(minBudget) };
      }
      if (maxBudget) {
        searchQuery['budgetRange.min'] = { $lte: parseFloat(maxBudget) };
      }
    }
    
    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { publishedAt: -1 };
        break;
      case 'budget_high':
        sortOptions = { 'budgetRange.max': -1 };
        break;
      case 'budget_low':
        sortOptions = { 'budgetRange.min': 1 };
        break;
      case 'quantity_high':
        sortOptions = { quantity: -1 };
        break;
      case 'expiring_soon':
        sortOptions = { expiresAt: 1 };
        break;
      case 'most_viewed':
        sortOptions = { 'metrics.views': -1 };
        break;
      case 'featured':
        sortOptions = { featured: -1, urgent: -1, publishedAt: -1 };
        break;
      default:
        sortOptions = { featured: -1, urgent: -1, publishedAt: -1 };
    }
    
    const rfqs = await RFQ.find(searchQuery)
      .populate('buyer', 'name trustScore')
      .select('-quotes') // Don't include quotes in search results
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalRFQs = await RFQ.countDocuments(searchQuery);
    
    res.json({
      success: true,
      rfqs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRFQs,
        pages: Math.ceil(totalRFQs / limit),
        hasNext: page * limit < totalRFQs,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Search RFQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search RFQs',
      error: error.message
    });
  }
};

// Submit quote for RFQ
export const submitQuote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rfqId } = req.params;
    
    const {
      pricePerUnit,
      totalPrice,
      deliveryTime,
      deliveryTerms,
      paymentTerms,
      validityPeriod,
      message,
      variants
    } = req.body;
    
    // Validate required fields
    if (!pricePerUnit || !totalPrice || !deliveryTime) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: pricePerUnit, totalPrice, deliveryTime'
      });
    }
    
    // Get user's company
    const company = await Company.findOne({ user: userId });
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company profile required to submit quotes'
      });
    }
    
    // Check if company is verified
    if (company.verificationStatus !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Company must be verified to submit quotes'
      });
    }
    
    // Get RFQ
    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }
    
    // Check if RFQ is active
    if (rfq.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'RFQ is not accepting quotes'
      });
    }
    
    // Check if RFQ has expired
    if (rfq.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'RFQ has expired'
      });
    }
    
    // Check if supplier already quoted
    const existingQuote = rfq.quotes.find(quote => 
      quote.supplier.toString() === company._id.toString()
    );
    
    if (existingQuote) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a quote for this RFQ'
      });
    }
    
    // Check lead credits for quote submission
    const quoteCreditsRequired = 1;
    if (company.leadCredits < quoteCreditsRequired) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient lead credits. Please purchase credits to submit quotes.',
        leadCredits: company.leadCredits,
        required: quoteCreditsRequired
      });
    }
    
    // Prepare quote data
    const quoteData = {
      supplier: company._id,
      user: userId,
      pricePerUnit: parseFloat(pricePerUnit),
      totalPrice: parseFloat(totalPrice),
      deliveryTime: deliveryTime.trim(),
      deliveryTerms: deliveryTerms?.trim(),
      paymentTerms: paymentTerms?.trim(),
      validityPeriod: validityPeriod || '30 days',
      message: message?.trim(),
      variants: variants || [],
      paymentStatus: 'paid', // Deduct credits immediately
      paymentAmount: quoteCreditsRequired
    };
    
    // Add quote to RFQ
    try {
      await rfq.addQuote(quoteData);
      
      // Deduct lead credits
      await company.deductLeadCredits(quoteCreditsRequired);
      
      // Update RFQ revenue
      rfq.revenue.quoteFees += quoteCreditsRequired;
      rfq.revenue.totalEarned += quoteCreditsRequired;
      await rfq.save();
      
      // Track analytics
      await analyticsService.trackEvent({
        userId,
        event: 'quote_submitted',
        properties: {
          rfqId,
          companyId: company._id,
          totalPrice,
          creditsUsed: quoteCreditsRequired
        }
      });
      
      // Update company metrics
      await company.updateMetrics('totalInquiries');
      
      const updatedRFQ = await RFQ.findById(rfqId)
        .populate('buyer', 'name email')
        .populate({
          path: 'quotes.supplier',
          select: 'companyName verificationStatus'
        });
      
      res.json({
        success: true,
        message: 'Quote submitted successfully',
        rfq: updatedRFQ,
        creditsRemaining: company.leadCredits - quoteCreditsRequired
      });
      
    } catch (quoteError) {
      return res.status(400).json({
        success: false,
        message: quoteError.message
      });
    }
    
  } catch (error) {
    console.error('Submit quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quote',
      error: error.message
    });
  }
};

// Get my RFQs (buyer's RFQs)
export const getMyRFQs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const query = { buyer: userId };
    if (status) {
      query.status = status;
    }
    
    const rfqs = await RFQ.find(query)
      .populate({
        path: 'quotes.supplier',
        select: 'companyName verificationStatus metrics.rating'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalRFQs = await RFQ.countDocuments(query);
    
    res.json({
      success: true,
      rfqs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRFQs,
        pages: Math.ceil(totalRFQs / limit)
      }
    });
    
  } catch (error) {
    console.error('Get my RFQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs',
      error: error.message
    });
  }
};

// Get my quotes (supplier's quotes)
export const getMyQuotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Get user's company
    const company = await Company.findOne({ user: userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }
    
    // Build aggregation pipeline to find RFQs with user's quotes
    const matchStage = {
      'quotes.supplier': company._id,
      isActive: true
    };
    
    if (status) {
      matchStage[`quotes.status`] = status;
    }
    
    const rfqsWithQuotes = await RFQ.aggregate([
      { $match: matchStage },
      { $unwind: '$quotes' },
      { $match: { 'quotes.supplier': company._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer'
        }
      },
      { $unwind: '$buyer' },
      {
        $project: {
          title: 1,
          category: 1,
          quantity: 1,
          unit: 1,
          budgetRange: 1,
          deliveryLocation: 1,
          expectedDelivery: 1,
          status: 1,
          expiresAt: 1,
          createdAt: 1,
          'buyer.name': 1,
          'buyer.trustScore': 1,
          quote: '$quotes'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
    
    const totalQuotes = await RFQ.countDocuments({
      'quotes.supplier': company._id,
      isActive: true
    });
    
    res.json({
      success: true,
      quotes: rfqsWithQuotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalQuotes,
        pages: Math.ceil(totalQuotes / limit)
      }
    });
    
  } catch (error) {
    console.error('Get my quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes',
      error: error.message
    });
  }
};

// Publish RFQ (make it active)
export const publishRFQ = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const rfq = await RFQ.findOne({ _id: id, buyer: userId });
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }
    
    if (rfq.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft RFQs can be published'
      });
    }
    
    await rfq.publish();
    
    // Track analytics
    await analyticsService.trackEvent({
      userId,
      event: 'rfq_published',
      properties: {
        rfqId: id,
        category: rfq.category
      }
    });
    
    res.json({
      success: true,
      message: 'RFQ published successfully',
      rfq
    });
    
  } catch (error) {
    console.error('Publish RFQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish RFQ',
      error: error.message
    });
  }
};

// Upload RFQ attachments
export const uploadRFQAttachment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rfqId } = req.params;
    const { type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }
    
    // Find RFQ
    const rfq = await RFQ.findOne({ _id: rfqId, buyer: userId });
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }
    
    // Upload to cloudinary
    const uploadOptions = {
      folder: `rfqs/${rfqId}/attachments`,
      resource_type: 'auto'
    };
    
    const result = await uploadToCloudinary(req.file.buffer, uploadOptions);
    
    // Add attachment to RFQ
    const attachment = {
      name: req.file.originalname,
      url: result.secure_url,
      type: type || 'other',
      size: req.file.size
    };
    
    rfq.attachments.push(attachment);
    await rfq.save();
    
    res.json({
      success: true,
      message: 'Attachment uploaded successfully',
      attachment
    });
    
  } catch (error) {
    console.error('Upload RFQ attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload attachment',
      error: error.message
    });
  }
};

// Award RFQ to supplier
export const awardRFQ = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rfqId, supplierId } = req.params;
    const { feedback } = req.body;
    
    const rfq = await RFQ.findOne({ _id: rfqId, buyer: userId });
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }
    
    await rfq.awardToSupplier(supplierId);
    
    // Add buyer feedback if provided
    if (feedback) {
      rfq.buyerFeedback = feedback;
      await rfq.save();
    }
    
    // Track analytics
    await analyticsService.trackEvent({
      userId,
      event: 'rfq_awarded',
      properties: {
        rfqId,
        supplierId,
        totalValue: rfq.bestQuote?.totalPrice
      }
    });
    
    res.json({
      success: true,
      message: 'RFQ awarded successfully',
      rfq
    });
    
  } catch (error) {
    console.error('Award RFQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award RFQ',
      error: error.message
    });
  }
};

// Get RFQ analytics
export const getRFQAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30d' } = req.query;
    
    // Check if user is a buyer or supplier
    const company = await Company.findOne({ user: userId });
    let analyticsData;
    
    if (company) {
      // Supplier analytics
      analyticsData = await analyticsService.getSupplierRFQAnalytics(company._id, timeframe);
    } else {
      // Buyer analytics
      analyticsData = await analyticsService.getBuyerRFQAnalytics(userId, timeframe);
    }
    
    res.json({
      success: true,
      analytics: analyticsData
    });
    
  } catch (error) {
    console.error('Get RFQ analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};
