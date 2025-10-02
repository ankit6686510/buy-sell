import EarbudListing from '../models/EarbudListing.js';

export const createListing = async (req, res) => {
  try {
    console.log('Create listing request body:', req.body);
    
    const {
      brand,
      model,
      side,
      condition,
      price,
      description,
      images,
      location
    } = req.body;

    // Format location object for the schema
    const locationData = typeof location === 'string' ? {
      address: location,
      coordinates: [], // Can be populated later with geocoding
      city: location.split(',')[0]?.trim() || '',
      country: location.split(',')[1]?.trim() || ''
    } : location;

    // Set default images if none provided (for testing)
    const listingImages = images && images.length > 0 ? images : ['https://via.placeholder.com/300x200?text=Earbud'];

    console.log('Creating listing with data:', {
      user: req.user.id,
      brand,
      model,
      side,
      condition,
      price,
      description,
      images: listingImages,
      location: locationData
    });

    const listing = new EarbudListing({
      user: req.user.id,
      brand,
      model,
      side,
      condition,
      price,
      description,
      images: listingImages,
      location: locationData
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
      brand,
      model,
      side,
      condition,
      color,
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
      user
    } = req.query;

    const query = {};
    
    // Set status filter - if status is provided and not empty, use it; otherwise default to 'available'
    // Exception: if user is specified, don't default to 'available' to show all user's listings
    if (status) {
      query.status = status;
    } else if (!user) {
      query.status = 'available';
    }
    
    // Filter by user if specified
    if (user) {
      query.user = user;
    }
    
    // Text-based filters
    if (brand) query.brand = { $regex: new RegExp(brand, 'i') };
    if (model) query.model = { $regex: new RegExp(model, 'i') };
    if (side) query.side = side;
    if (condition) {
      if (Array.isArray(condition)) {
        query.condition = { $in: condition };
      } else {
        query.condition = condition;
      }
    }
    if (color) query.color = { $regex: new RegExp(color, 'i') };

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
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
        { 'location.country': { $regex: new RegExp(location, 'i') } }
      ];
    }

    // Text search across multiple fields
    if (search) {
      query.$or = [
        { brand: { $regex: new RegExp(search, 'i') } },
        { model: { $regex: new RegExp(search, 'i') } },
        { color: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } }
      ];
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
      case 'distance':
        // Distance sorting is handled by $near in location query
        sortOptions = { createdAt: -1 };
        break;
      case 'featured':
        sortOptions = { featured: -1, priority: -1, createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const listings = await EarbudListing.find(query)
      .populate('user', 'name avatar rating totalRatings verification trustScore badges')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalCount = await EarbudListing.countDocuments(query);

    // Calculate distances if location provided
    let listingsWithDistance = listings;
    if (lat && lng) {
      listingsWithDistance = listings.map(listing => {
        const listingObj = listing.toObject();
        if (listing.location?.coordinates) {
          const distance = calculateDistance(
            [Number(lng), Number(lat)],
            listing.location.coordinates
          );
          listingObj.distance = Math.round(distance * 10) / 10;
        }
        return listingObj;
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
          brand, model, side, condition, color, minPrice, maxPrice, 
          location, search, radius
        },
        availableFilters: await getAvailableFilters()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
};

// Helper function to get available filter options
async function getAvailableFilters() {
  try {
    const [brands, models, colors, conditions] = await Promise.all([
      EarbudListing.distinct('brand', { status: 'available' }),
      EarbudListing.distinct('model', { status: 'available' }),
      EarbudListing.distinct('color', { status: 'available', color: { $ne: null } }),
      EarbudListing.distinct('condition', { status: 'available' })
    ]);

    return {
      brands: brands.sort(),
      models: models.sort(),
      colors: colors.filter(Boolean).sort(),
      conditions: conditions.sort(),
      sides: ['left', 'right']
    };
  } catch (error) {
    return {
      brands: [],
      models: [],
      colors: [],
      conditions: ['new', 'like_new', 'good', 'fair', 'poor'],
      sides: ['left', 'right']
    };
  }
}

export const getListing = async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id)
      .populate('user', 'name location rating')
      .populate('matchedWith');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listing', error: error.message });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const updatedFields = req.body;
    Object.keys(updatedFields).forEach(key => {
      listing[key] = updatedFields[key];
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
    const listing = await EarbudListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await listing.remove();

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting listing', error: error.message });
  }
};

export const findMatches = async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id)
      .populate('user', 'name location rating');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Increment view count
    listing.views += 1;
    await listing.save();

    const maxDistance = listing.preferences?.maxDistance || 50;
    
    // Build location-based query
    let locationQuery = {};
    if (listing.location?.coordinates) {
      locationQuery = {
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: listing.location.coordinates
            },
            $maxDistance: maxDistance * 1000 // Convert km to meters
          }
        }
      };
    } else if (listing.location?.city) {
      // Fallback to city-based matching if no coordinates
      locationQuery = {
        'location.city': { $regex: new RegExp(listing.location.city, 'i') }
      };
    }

    // Find potential matches
    const potentialMatches = await EarbudListing.find({
      brand: { $regex: new RegExp(`^${listing.brand}$`, 'i') },
      model: { $regex: new RegExp(`^${listing.model}$`, 'i') },
      side: listing.side === 'left' ? 'right' : 'left',
      status: 'available',
      _id: { $ne: listing._id },
      expiresAt: { $gt: new Date() },
      ...locationQuery
    })
    .populate('user', 'name location rating avatar')
    .limit(50); // Limit to prevent performance issues

    // Calculate match scores and distances
    const matchesWithScores = await Promise.all(
      potentialMatches.map(async (match) => {
        let distance = 0;
        
        // Calculate distance if both have coordinates
        if (listing.location?.coordinates && match.location?.coordinates) {
          distance = calculateDistance(
            listing.location.coordinates,
            match.location.coordinates
          );
        }
        
        const matchScore = listing.calculateMatchScore(match, distance);
        
        return {
          ...match.toObject(),
          matchScore,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          compatibilityReasons: generateCompatibilityReasons(listing, match, distance)
        };
      })
    );

    // Filter matches with score > 0 and sort by score
    const validMatches = matchesWithScores
      .filter(match => match.matchScore > 0)
      .sort((a, b) => {
        // Sort by featured status first, then by match score, then by recency
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    res.json({
      matches: validMatches,
      totalFound: validMatches.length,
      searchCriteria: {
        brand: listing.brand,
        model: listing.model,
        oppositeSide: listing.side === 'left' ? 'right' : 'left',
        maxDistance,
        location: listing.location
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error finding matches', error: error.message });
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

// Helper function to generate compatibility reasons
function generateCompatibilityReasons(listing1, listing2, distance) {
  const reasons = [];
  
  if (listing1.brand.toLowerCase() === listing2.brand.toLowerCase() && 
      listing1.model.toLowerCase() === listing2.model.toLowerCase()) {
    reasons.push('Perfect brand and model match');
  }
  
  if (distance <= 5) reasons.push('Very close location (within 5km)');
  else if (distance <= 15) reasons.push('Close location (within 15km)');
  else if (distance <= 30) reasons.push('Nearby location (within 30km)');
  
  const priceDiff = Math.abs(listing1.price - listing2.price);
  const avgPrice = (listing1.price + listing2.price) / 2;
  const priceFlexibility = Math.max(listing1.preferences?.priceFlexibility || 20, 
                                   listing2.preferences?.priceFlexibility || 20);
  
  if (priceDiff <= (avgPrice * priceFlexibility / 100)) {
    reasons.push('Compatible price range');
  }
  
  if (listing1.condition === listing2.condition) {
    reasons.push('Same condition');
  }
  
  if (listing2.user?.rating >= 4.5) {
    reasons.push('Highly rated seller');
  }
  
  const daysSinceCreated = (Date.now() - new Date(listing2.createdAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 7) {
    reasons.push('Recently posted');
  }
  
  return reasons;
}

export const markAsMatched = async (req, res) => {
  try {
    const { listingId, matchedListingId } = req.body;

    const listing = await EarbudListing.findById(listingId);
    const matchedListing = await EarbudListing.findById(matchedListingId);

    if (!listing || !matchedListing) {
      return res.status(404).json({ message: 'One or both listings not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to match this listing' });
    }

    // Update both listings
    listing.status = 'matched';
    listing.matchedWith = matchedListingId;
    matchedListing.status = 'matched';
    matchedListing.matchedWith = listingId;

    await Promise.all([listing.save(), matchedListing.save()]);

    res.json({
      message: 'Listings matched successfully',
      listing,
      matchedListing
    });
  } catch (error) {
    res.status(500).json({ message: 'Error matching listings', error: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get user's active listings to understand preferences
    const userListings = await EarbudListing.find({
      user: userId,
      status: 'available'
    });

    if (userListings.length === 0) {
      // If user has no listings, return popular/recent listings
      const recommendations = await EarbudListing.find({
        status: 'available',
        expiresAt: { $gt: new Date() }
      })
      .populate('user', 'name rating avatar')
      .sort({ featured: -1, priority: -1, createdAt: -1 })
      .limit(parseInt(limit));

      return res.json({
        recommendations,
        type: 'popular',
        message: 'Popular listings'
      });
    }

    // Find recommendations based on user's listing patterns
    const brands = [...new Set(userListings.map(l => l.brand))];
    const models = [...new Set(userListings.map(l => l.model))];
    
    // Get location preferences from user's most recent listing
    const recentListing = userListings.sort((a, b) => b.createdAt - a.createdAt)[0];
    const maxDistance = recentListing.preferences?.maxDistance || 50;

    let locationQuery = {};
    if (recentListing.location?.coordinates) {
      locationQuery = {
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: recentListing.location.coordinates
            },
            $maxDistance: maxDistance * 1000
          }
        }
      };
    }

    // Find potential matches for user's listings
    const recommendations = await EarbudListing.find({
      $and: [
        {
          $or: [
            { brand: { $in: brands } },
            { model: { $in: models } }
          ]
        },
        {
          user: { $ne: userId },
          status: 'available',
          expiresAt: { $gt: new Date() }
        },
        locationQuery
      ]
    })
    .populate('user', 'name rating avatar')
    .sort({ featured: -1, priority: -1, createdAt: -1 })
    .limit(parseInt(limit) * 2); // Get more to filter

    // Calculate match scores for each recommendation
    const scoredRecommendations = [];
    
    for (const rec of recommendations) {
      let bestScore = 0;
      let bestMatchingListing = null;
      
      // Find the best matching user listing for this recommendation
      for (const userListing of userListings) {
        if (userListing.brand.toLowerCase() === rec.brand.toLowerCase() &&
            userListing.model.toLowerCase() === rec.model.toLowerCase() &&
            userListing.side !== rec.side) {
          
          let distance = 0;
          if (userListing.location?.coordinates && rec.location?.coordinates) {
            distance = calculateDistance(
              userListing.location.coordinates,
              rec.location.coordinates
            );
          }
          
          const score = userListing.calculateMatchScore(rec, distance);
          if (score > bestScore) {
            bestScore = score;
            bestMatchingListing = userListing;
          }
        }
      }
      
      if (bestScore > 0) {
        scoredRecommendations.push({
          ...rec.toObject(),
          matchScore: bestScore,
          matchingUserListing: bestMatchingListing?._id,
          compatibilityReasons: generateCompatibilityReasons(bestMatchingListing, rec, 0)
        });
      }
    }

    // Sort by match score and limit results
    const finalRecommendations = scoredRecommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    res.json({
      recommendations: finalRecommendations,
      type: 'personalized',
      message: 'Personalized recommendations based on your listings'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations', error: error.message });
  }
};

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
