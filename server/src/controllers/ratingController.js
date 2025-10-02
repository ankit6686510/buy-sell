import Rating from '../models/Rating.js';
import User from '../models/User.js';
import EarbudListing from '../models/EarbudListing.js';

// Create a new rating/review
export const createRating = async (req, res) => {
  try {
    const {
      rateeId,
      listingId,
      rating,
      review,
      categories,
      metadata
    } = req.body;
    
    const raterId = req.user.id;
    
    // Validation
    if (raterId === rateeId) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }
    
    // Check if listing exists
    const listing = await EarbudListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if ratee exists
    const ratee = await User.findById(rateeId);
    if (!ratee) {
      return res.status(404).json({ message: 'User to rate not found' });
    }
    
    // Check if rating already exists
    const existingRating = await Rating.findOne({
      rater: raterId,
      ratee: rateeId,
      listing: listingId
    });
    
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this user for this listing' });
    }
    
    // Create new rating
    const newRating = new Rating({
      rater: raterId,
      ratee: rateeId,
      listing: listingId,
      rating,
      review,
      categories,
      metadata
    });
    
    await newRating.save();
    
    // Update user's rating statistics
    const userRatingStats = await Rating.calculateUserRating(rateeId);
    await User.findByIdAndUpdate(rateeId, {
      rating: userRatingStats.averageRating,
      totalRatings: userRatingStats.totalRatings
    });
    
    // Recalculate trust score
    const updatedRatee = await User.findById(rateeId);
    updatedRatee.calculateTrustScore();
    await updatedRatee.save();
    
    // Populate the created rating
    await newRating.populate([
      { path: 'rater', select: 'name avatar' },
      { path: 'ratee', select: 'name avatar' },
      { path: 'listing', select: 'brand model side' }
    ]);
    
    res.status(201).json({
      message: 'Rating created successfully',
      rating: newRating,
      updatedStats: userRatingStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating rating', error: error.message });
  }
};

// Get ratings for a specific user
export const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort criteria
    let sortCriteria = {};
    switch (sort) {
      case 'recent':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'highest':
        sortCriteria = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortCriteria = { rating: 1, createdAt: -1 };
        break;
      case 'helpful':
        // This would require aggregation, keeping it simple for now
        sortCriteria = { createdAt: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }
    
    const ratings = await Rating.find({
      ratee: userId,
      status: 'active'
    })
    .populate('rater', 'name avatar')
    .populate('listing', 'brand model side images')
    .sort(sortCriteria)
    .skip(skip)
    .limit(parseInt(limit));
    
    const totalRatings = await Rating.countDocuments({
      ratee: userId,
      status: 'active'
    });
    
    // Get rating statistics
    const ratingStats = await Rating.calculateUserRating(userId);
    const ratingDistribution = await Rating.getRatingDistribution(userId);
    
    res.json({
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRatings / parseInt(limit)),
        totalRatings,
        hasMore: skip + ratings.length < totalRatings
      },
      statistics: {
        ...ratingStats,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ratings', error: error.message });
  }
};

// Get ratings given by a user
export const getRatingsGiven = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const ratings = await Rating.find({
      rater: userId,
      status: 'active'
    })
    .populate('ratee', 'name avatar')
    .populate('listing', 'brand model side images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    const totalRatings = await Rating.countDocuments({
      rater: userId,
      status: 'active'
    });
    
    res.json({
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRatings / parseInt(limit)),
        totalRatings,
        hasMore: skip + ratings.length < totalRatings
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching given ratings', error: error.message });
  }
};

// Update a rating (only by the original rater)
export const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review, categories, metadata } = req.body;
    
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if user owns this rating
    if (existingRating.rater.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this rating' });
    }
    
    // Check if rating is too old to edit (e.g., 30 days)
    const daysSinceCreated = (Date.now() - existingRating.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated > 30) {
      return res.status(400).json({ message: 'Cannot edit ratings older than 30 days' });
    }
    
    // Update fields
    if (rating !== undefined) existingRating.rating = rating;
    if (review !== undefined) existingRating.review = review;
    if (categories) existingRating.categories = { ...existingRating.categories, ...categories };
    if (metadata) existingRating.metadata = { ...existingRating.metadata, ...metadata };
    
    await existingRating.save();
    
    // Recalculate user's rating statistics
    const userRatingStats = await Rating.calculateUserRating(existingRating.ratee);
    await User.findByIdAndUpdate(existingRating.ratee, {
      rating: userRatingStats.averageRating,
      totalRatings: userRatingStats.totalRatings
    });
    
    await existingRating.populate([
      { path: 'rater', select: 'name avatar' },
      { path: 'ratee', select: 'name avatar' },
      { path: 'listing', select: 'brand model side' }
    ]);
    
    res.json({
      message: 'Rating updated successfully',
      rating: existingRating,
      updatedStats: userRatingStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating rating', error: error.message });
  }
};

// Add response to a rating (only by the rated user)
export const addRatingResponse = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { response } = req.body;
    
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if user is the one being rated
    if (rating.ratee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the rated user can respond to reviews' });
    }
    
    // Check if response already exists
    if (rating.response.content) {
      return res.status(400).json({ message: 'Response already exists for this rating' });
    }
    
    rating.addResponse(response);
    await rating.save();
    
    await rating.populate([
      { path: 'rater', select: 'name avatar' },
      { path: 'ratee', select: 'name avatar' }
    ]);
    
    res.json({
      message: 'Response added successfully',
      rating
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding response', error: error.message });
  }
};

// Vote on rating helpfulness
export const voteOnRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful
    
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if user is trying to vote on their own rating
    if (rating.rater.toString() === req.user.id || rating.ratee.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot vote on your own rating or ratings about you' });
    }
    
    // Add or update vote
    rating.addHelpfulVote(req.user.id, helpful);
    await rating.save();
    
    res.json({
      message: 'Vote recorded successfully',
      helpfulCount: rating.helpfulCount,
      notHelpfulCount: rating.notHelpfulCount,
      totalVotes: rating.helpfulVotes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error voting on rating', error: error.message });
  }
};

// Remove vote from rating
export const removeVoteFromRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if user has voted
    if (!rating.hasUserVoted(req.user.id)) {
      return res.status(400).json({ message: 'You have not voted on this rating' });
    }
    
    rating.removeHelpfulVote(req.user.id);
    await rating.save();
    
    res.json({
      message: 'Vote removed successfully',
      helpfulCount: rating.helpfulCount,
      notHelpfulCount: rating.notHelpfulCount,
      totalVotes: rating.helpfulVotes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing vote', error: error.message });
  }
};

// Flag a rating
export const flagRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { reason, description } = req.body;
    
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if user has already flagged this rating
    const existingFlag = rating.flagReports.find(report => 
      report.reportedBy.toString() === req.user.id
    );
    
    if (existingFlag) {
      return res.status(400).json({ message: 'You have already flagged this rating' });
    }
    
    rating.flagReview(req.user.id, reason, description);
    await rating.save();
    
    res.json({
      message: 'Rating flagged successfully',
      flagCount: rating.flagReports.length,
      status: rating.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Error flagging rating', error: error.message });
  }
};

// Get summary statistics for ratings
export const getRatingSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const ratingStats = await Rating.calculateUserRating(userId);
    const ratingDistribution = await Rating.getRatingDistribution(userId);
    
    // Get recent ratings
    const recentRatings = await Rating.find({
      ratee: userId,
      status: 'active'
    })
    .populate('rater', 'name avatar')
    .populate('listing', 'brand model side')
    .sort({ createdAt: -1 })
    .limit(3);
    
    // Get category trends (last 30 days vs overall)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentStats = await Rating.aggregate([
      {
        $match: {
          ratee: new mongoose.Types.ObjectId(userId),
          status: 'active',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          communicationAvg: { $avg: '$categories.communication' },
          reliabilityAvg: { $avg: '$categories.reliability' },
          itemConditionAvg: { $avg: '$categories.itemCondition' }
        }
      }
    ]);
    
    res.json({
      overall: ratingStats,
      distribution: ratingDistribution,
      recent: recentStats.length > 0 ? recentStats[0] : null,
      recentRatings,
      trends: {
        improving: recentStats.length > 0 && recentStats[0].averageRating > ratingStats.averageRating,
        recentAverage: recentStats.length > 0 ? Math.round(recentStats[0].averageRating * 10) / 10 : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rating summary', error: error.message });
  }
};
