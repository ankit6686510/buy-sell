import ProductListing from '../models/ProductListing.js';

export const createListing = async (req, res) => {
  try {
    console.log('Create listing request body:', req.body);
    
    const {
      title,
      category,
      subcategory,
      brand,
      model,
      color,
      size,
      condition,
      price,
      originalPrice,
      description,
      images,
      location,
      preferences,
      specifications,
      tags
    } = req.body;

    // Format location object for the schema
    const locationData = typeof location === 'string' ? {
      address: location,
      coordinates: [], // Can be populated later with geocoding
      city: location.split(',')[0]?.trim() || '',
      state: location.split(',')[1]?.trim() || '',
      country: location.split(',')[2]?.trim() || 'India'
    } : {
      address: location.address || '',
      coordinates: location.coordinates || [],
      city: location.city || '',
      state: location.state || '',
      country: location.country || 'India',
      pincode: location.pincode || ''
    };

    // Set default images if none provided (for testing)
    const listingImages = images && images.length > 0 ? images : ['https://via.placeholder.com/300x200?text=Product'];

    console.log('Creating listing with data:', {
      user: req.user.id,
      title,
      category,
      subcategory,
      brand,
      model,
      condition,
      price,
      description,
      images: listingImages,
      location: locationData
    });

    const listing = new ProductListing({
      user: req.user.id,
      title,
      category,
      subcategory,
      brand,
      model,
      color,
      size,
      condition,
      price,
      originalPrice,
      description,
      images: listingImages,
      location: locationData,
      preferences: preferences || {
        negotiable: true,
        homeDelivery: false,
        exchange: false
      },
      specifications: specifications || {},
      tags: tags || []
    });

    console.log('Attempting to save listing...');
    await listing.save();
    console.log('Listing saved successfully');

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    if (error.name === 'ValidationError') {
      console.log('Mongoose validation error:', error.errors);
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating listing', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getListings = async (req, res) => {
  try {
    const {
      category,
      categories,
      subcategory,
      brand,
      model,
      condition,
      color,
      size,
      minPrice,
      maxPrice,
      location,
      status,
      search,
      lat,
      lng,
      radius = 50,
      sortBy = 'newest',
      page = 1,
      limit = 20,
      user,
      featured,
      negotiable,
      startDate,
      endDate
    } = req.query;

    const query = {};
    
    // Set status filter - if status is provided and not empty, use it; otherwise default to 'available'
    // Exception: if user is specified, don't default to 'available' to show all user's listings
    if (status) {
      query.status = status;
    } else if (!user) {
      query.status = 'available';
    }
    
    // Only show active listings
    query.isActive = true;
    
    // Filter by user if specified
    if (user) {
      query.user = user;
    }
    
    // Category-based filters - support both single category and multiple categories
    if (categories) {
      const categoryList = Array.isArray(categories) ? categories : categories.split(',');
      if (categoryList.length > 0) {
        query.category = { $in: categoryList };
      }
    } else if (category) {
      query.category = category;
    }
    
    if (subcategory) query.subcategory = subcategory;
    
    // Product-specific filters
    if (brand) query.brand = { $regex: new RegExp(brand, 'i') };
    if (model) query.model = { $regex: new RegExp(model, 'i') };
    if (color) query.color = { $regex: new RegExp(color, 'i') };
    if (size) query.size = { $regex: new RegExp(size, 'i') };
    
    if (condition) {
      if (Array.isArray(condition)) {
        query.condition = { $in: condition };
      } else {
        query.condition = condition;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Negotiable filter
    if (negotiable === 'true') {
      query['preferences.negotiable'] = true;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to endDate to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        query.createdAt.$lt = endDateTime;
      }
    }

    // Location-based search
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: Number(radius) * 1000 // Convert km to meters
        }
      };
    } else if (location) {
      query.$or = [
        { 'location.address': { $regex: new RegExp(location, 'i') } },
        { 'location.city': { $regex: new RegExp(location, 'i') } },
        { 'location.state': { $regex: new RegExp(location, 'i') } },
        { 'location.country': { $regex: new RegExp(location, 'i') } }
      ];
    }

    // Text search across multiple fields
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting options
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'price_low':
        sortOptions = { price: 1 };
        break;
      case 'price_high':
        sortOptions = { price: -1 };
        break;
      case 'popular':
        sortOptions = { views: -1, favoritesCount: -1 };
        break;
      case 'distance':
        // Distance sorting is handled by $near in location query
        sortOptions = { createdAt: -1 };
        break;
      case 'featured':
        sortOptions = { featured: -1, boost: -1, priority: -1, createdAt: -1 };
        break;
      case 'relevance':
        if (search) {
          sortOptions = { score: { $meta: 'textScore' } };
        } else {
          sortOptions = { createdAt: -1 };
        }
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    let aggregationPipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                name: 1,
                avatar: 1,
                rating: 1,
                totalRatings: 1,
                verification: 1,
                trustScore: 1,
                badges: 1
              }
            }
          ]
        }
      },
      { $unwind: '$user' },
      {
        $addFields: {
          favoritesCount: { $size: '$favorites' }
        }
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: Number(limit) }
    ];

    const listings = await ProductListing.aggregate(aggregationPipeline);

    // Get total count for pagination
    const totalCount = await ProductListing.countDocuments(query);

    // Calculate distances if location provided
    let listingsWithDistance = listings;
    if (lat && lng) {
      listingsWithDistance = listings.map(listing => {
        if (listing.location?.coordinates) {
          const distance = calculateDistance(
            [Number(lng), Number(lat)],
            listing.location.coordinates
          );
          listing.distance = Math.round(distance * 10) / 10;
        }
        return listing;
      });
    }

    res.json({
      listings: listingsWithDistance,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalItems: totalCount,
        itemsPerPage: Number(limit),
        hasMore: skip + listings.length < totalCount
      },
      filters: {
        appliedFilters: {
          category, categories, subcategory, brand, model, condition, color, size,
          minPrice, maxPrice, location, search, radius, featured, negotiable,
          startDate, endDate
        },
        availableFilters: await getAvailableFilters(categories || category)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
};

// Helper function to get available filter options
async function getAvailableFilters(categories = null) {
  try {
    const baseQuery = { status: 'available', isActive: true };
    if (categories) {
      if (Array.isArray(categories)) {
        baseQuery.category = { $in: categories };
      } else if (typeof categories === 'string') {
        const categoryList = categories.includes(',') ? categories.split(',') : [categories];
        baseQuery.category = categoryList.length > 1 ? { $in: categoryList } : categoryList[0];
      } else {
        baseQuery.category = categories;
      }
    }

    const [categories, subcategories, brands, models, colors, conditions] = await Promise.all([
      ProductListing.distinct('category', { status: 'available', isActive: true }),
      ProductListing.distinct('subcategory', baseQuery),
      ProductListing.distinct('brand', { ...baseQuery, brand: { $ne: null } }),
      ProductListing.distinct('model', { ...baseQuery, model: { $ne: null } }),
      ProductListing.distinct('color', { ...baseQuery, color: { $ne: null } }),
      ProductListing.distinct('condition', baseQuery)
    ]);

    // Get price range
    const priceRange = await ProductListing.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    return {
      categories: categories.sort(),
      subcategories: subcategories.filter(Boolean).sort(),
      brands: brands.filter(Boolean).sort(),
      models: models.filter(Boolean).sort(),
      colors: colors.filter(Boolean).sort(),
      conditions: conditions.sort(),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 100000 }
    };
  } catch (error) {
    return {
      categories: ['electronics', 'fashion', 'home_garden', 'sports', 'vehicles', 'books_media', 'toys_games', 'health_beauty', 'others'],
      subcategories: [],
      brands: [],
      models: [],
      colors: [],
      conditions: ['new', 'like_new', 'good', 'fair', 'poor'],
      priceRange: { minPrice: 0, maxPrice: 100000 }
    };
  }
}

export const getListing = async (req, res) => {
  try {
    const listing = await ProductListing.findById(req.params.id)
      .populate('user', 'name location rating avatar verification trustScore badges totalRatings');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Increment view count if the viewer is not the owner
    if (!req.user || listing.user._id.toString() !== req.user.id) {
      await listing.incrementViews();
    }

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listing', error: error.message });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const updatedFields = req.body;
    Object.keys(updatedFields).forEach(key => {
      if (key === 'location' && typeof updatedFields[key] === 'object') {
        listing.location = { ...listing.location.toObject(), ...updatedFields[key] };
      } else if (key === 'preferences' && typeof updatedFields[key] === 'object') {
        listing.preferences = { ...listing.preferences.toObject(), ...updatedFields[key] };
      } else if (key === 'specifications' && typeof updatedFields[key] === 'object') {
        listing.specifications = new Map(Object.entries(updatedFields[key]));
      } else {
        listing[key] = updatedFields[key];
      }
    });

    await listing.save();

    res.json({
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing', error: error.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await ProductListing.findByIdAndDelete(req.params.id);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting listing', error: error.message });
  }
};

export const getSimilarListings = async (req, res) => {
  try {
    const listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const { limit = 10 } = req.query;

    // Find similar listings based on category, subcategory, brand
    const similarListings = await ProductListing.find({
      _id: { $ne: listing._id },
      status: 'available',
      isActive: true,
      $or: [
        { 
          category: listing.category,
          subcategory: listing.subcategory 
        },
        {
          category: listing.category,
          brand: listing.brand
        },
        {
          brand: listing.brand,
          model: listing.model
        }
      ]
    })
    .populate('user', 'name avatar rating')
    .sort({ featured: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.json({
      similarListings,
      totalFound: similarListings.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error finding similar listings', error: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const userId = req.user.id;
    const isFavorited = listing.favorites.includes(userId);

    if (isFavorited) {
      await listing.removeFromFavorites(userId);
    } else {
      await listing.addToFavorites(userId);
    }

    res.json({
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited,
      favoritesCount: listing.favorites.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling favorite', error: error.message });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const favorites = await ProductListing.find({
      favorites: userId,
      status: 'available',
      isActive: true
    })
    .populate('user', 'name avatar rating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    const totalCount = await ProductListing.countDocuments({
      favorites: userId,
      status: 'available',
      isActive: true
    });

    res.json({
      favorites,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalItems: totalCount,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get user's preferences based on their listings and favorites
    const [userListings, userFavorites] = await Promise.all([
      ProductListing.find({ user: userId }).limit(10),
      ProductListing.find({ favorites: userId }).limit(10)
    ]);

    const allUserInteractions = [...userListings, ...userFavorites];
    
    if (allUserInteractions.length === 0) {
      // If user has no history, return popular/recent listings
      const recommendations = await ProductListing.find({
        status: 'available',
        isActive: true
      })
      .populate('user', 'name rating avatar')
      .sort({ featured: -1, views: -1, createdAt: -1 })
      .limit(parseInt(limit));

      return res.json({
        recommendations,
        type: 'popular',
        message: 'Popular listings'
      });
    }

    // Extract user preferences
    const preferredCategories = [...new Set(allUserInteractions.map(l => l.category))];
    const preferredBrands = [...new Set(allUserInteractions.map(l => l.brand).filter(Boolean))];
    
    // Get location preference from user's most recent listing
    const recentListing = userListings.sort((a, b) => b.createdAt - a.createdAt)[0];
    
    let locationQuery = {};
    if (recentListing?.location?.coordinates) {
      locationQuery = {
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: recentListing.location.coordinates
            },
            $maxDistance: 50000 // 50km
          }
        }
      };
    }

    // Find recommendations
    const recommendations = await ProductListing.find({
      $and: [
        {
          $or: [
            { category: { $in: preferredCategories } },
            { brand: { $in: preferredBrands } }
          ]
        },
        {
          user: { $ne: userId },
          status: 'available',
          isActive: true,
          _id: { $nin: allUserInteractions.map(l => l._id) }
        },
        locationQuery
      ]
    })
    .populate('user', 'name rating avatar')
    .sort({ featured: -1, createdAt: -1 })
    .limit(parseInt(limit) * 2);

    // Calculate relevance scores
    const scoredRecommendations = recommendations.map(rec => {
      let score = rec.calculateRelevanceScore({
        category: preferredCategories.includes(rec.category) ? rec.category : null,
        brand: preferredBrands.includes(rec.brand) ? rec.brand : null
      });
      
      return {
        ...rec.toObject(),
        relevanceScore: score
      };
    });

    // Sort by relevance and limit
    const finalRecommendations = scoredRecommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, parseInt(limit));

    res.json({
      recommendations: finalRecommendations,
      type: 'personalized',
      message: 'Personalized recommendations based on your activity'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations', error: error.message });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(coords1, coords2) {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Image upload endpoint
export const uploadImages = async (req, res) => {
  try {
    console.log('Upload images request received');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    console.log('Files uploaded:', req.files.length);

    // For Cloudinary, the file URLs and metadata are available in req.files
    const images = req.files.map(file => ({
      url: file.path, // Cloudinary URL
      publicId: file.filename, // Cloudinary public ID
      originalName: file.originalname,
      size: file.size,
      width: file.width,
      height: file.height
    }));

    console.log('Processed images:', images);

    res.json({
      message: 'Images uploaded successfully',
      images
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ 
      message: 'Error uploading images', 
      error: error.message 
    });
  }
};

export const markAsSold = async (req, res) => {
  try {
    const listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    listing.status = 'sold';
    await listing.save();

    res.json({
      message: 'Listing marked as sold',
      listing
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing', error: error.message });
  }
};

export const reportListing = async (req, res) => {
  try {
    const listing = await ProductListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    listing.reportCount += 1;
    
    // Auto-deactivate if too many reports
    if (listing.reportCount >= 5) {
      listing.isActive = false;
    }
    
    await listing.save();

    res.json({
      message: 'Listing reported successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reporting listing', error: error.message });
  }
};
