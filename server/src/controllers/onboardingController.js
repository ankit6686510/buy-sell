import { 
  OnboardingProgress, 
  TutorialContent, 
  FeatureTour,
  createDefaultTutorials 
} from '../models/Onboarding.js';
import { UserActivity, Conversion } from '../models/Analytics.js';

// Initialize onboarding for a new user
export const initializeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if onboarding already exists
    let onboarding = await OnboardingProgress.findOne({ user: userId });
    
    if (!onboarding) {
      onboarding = new OnboardingProgress({
        user: userId,
        currentStep: 1,
        completionPercentage: 0
      });
      
      await onboarding.save();
      
      // Track analytics
      await new UserActivity({
        user: userId,
        sessionId: req.sessionID || req.headers['x-session-id'],
        action: 'register',
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        }
      }).save();
    }
    
    res.json({
      message: 'Onboarding initialized successfully',
      onboarding
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing onboarding', error: error.message });
  }
};

// Get user's onboarding progress
export const getOnboardingProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let onboarding = await OnboardingProgress.findOne({ user: userId });
    
    if (!onboarding) {
      // Initialize if doesn't exist
      onboarding = new OnboardingProgress({
        user: userId,
        currentStep: 1,
        completionPercentage: 0
      });
      await onboarding.save();
    }
    
    // Get next recommended tutorials
    const recommendedTutorials = await TutorialContent.find({
      isActive: true,
      targetAudience: { $in: ['all', 'new_users'] },
      category: { $ne: 'advanced' }
    }).limit(3);
    
    // Get pending tips
    const pendingTips = onboarding.personalizedTips.filter(
      tip => !tip.shown && !tip.dismissed
    );
    
    res.json({
      onboarding,
      recommendedTutorials,
      pendingTips,
      nextSteps: getNextSteps(onboarding)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching onboarding progress', error: error.message });
  }
};

// Mark onboarding step as complete
export const completeOnboardingStep = async (req, res) => {
  try {
    const { step, metadata = {} } = req.body;
    const userId = req.user.id;
    
    const onboarding = await OnboardingProgress.findOne({ user: userId });
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding progress not found' });
    }
    
    const wasCompleted = onboarding.markStepComplete(step, metadata);
    
    if (wasCompleted) {
      await onboarding.save();
      
      // Track conversion
      await new Conversion({
        user: userId,
        sessionId: req.sessionID || req.headers['x-session-id'],
        conversionType: step,
        metadata: {
          onboardingStep: onboarding.currentStep,
          completionPercentage: onboarding.completionPercentage
        }
      }).save();
      
      // Check for achievements
      await checkAndUnlockAchievements(onboarding, step);
      
      res.json({
        message: 'Step completed successfully',
        onboarding,
        achievements: getRecentAchievements(onboarding)
      });
    } else {
      res.json({
        message: 'Step already completed',
        onboarding
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error completing onboarding step', error: error.message });
  }
};

// Get tutorial content
export const getTutorial = async (req, res) => {
  try {
    const { tutorialId } = req.params;
    
    const tutorial = await TutorialContent.findOne({
      tutorialId,
      isActive: true
    });
    
    if (!tutorial) {
      return res.status(404).json({ message: 'Tutorial not found' });
    }
    
    // Track analytics
    if (req.user) {
      await new UserActivity({
        user: req.user.id,
        sessionId: req.sessionID || req.headers['x-session-id'],
        action: 'view_tutorial',
        metadata: {
          tutorialId,
          category: tutorial.category
        }
      }).save();
    }
    
    res.json({ tutorial });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tutorial', error: error.message });
  }
};

// Get all tutorials
export const getTutorials = async (req, res) => {
  try {
    const { category, difficulty, targetAudience } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (targetAudience) filter.targetAudience = { $in: [targetAudience, 'all'] };
    
    const tutorials = await TutorialContent.find(filter)
      .sort({ category: 1, difficulty: 1 });
    
    res.json({ tutorials });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tutorials', error: error.message });
  }
};

// Complete tutorial
export const completeTutorial = async (req, res) => {
  try {
    const { tutorialId } = req.params;
    const { timeSpent, rating } = req.body;
    const userId = req.user.id;
    
    const tutorial = await TutorialContent.findOne({ tutorialId });
    if (!tutorial) {
      return res.status(404).json({ message: 'Tutorial not found' });
    }
    
    const onboarding = await OnboardingProgress.findOne({ user: userId });
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding progress not found' });
    }
    
    // Update tutorial progress
    const tutorialType = mapTutorialIdToType(tutorialId);
    if (tutorialType && onboarding.tutorialProgress[tutorialType]) {
      onboarding.tutorialProgress[tutorialType].completed = true;
      onboarding.tutorialProgress[tutorialType].completedAt = new Date();
    }
    
    // Mark tutorial completion step
    if (!onboarding.completedSteps.find(s => s.step === 'tutorial_completed')) {
      onboarding.markStepComplete('tutorial_completed', {
        tutorialId,
        timeSpent,
        rating
      });
    }
    
    await onboarding.save();
    
    // Track analytics
    await new UserActivity({
      user: userId,
      sessionId: req.sessionID || req.headers['x-session-id'],
      action: 'complete_tutorial',
      metadata: {
        tutorialId,
        timeSpent,
        rating,
        category: tutorial.category
      }
    }).save();
    
    // Unlock achievement if applicable
    if (tutorial.completionReward) {
      await unlockReward(onboarding, tutorial.completionReward, tutorial.rewardDetails);
    }
    
    res.json({
      message: 'Tutorial completed successfully',
      onboarding,
      reward: tutorial.completionReward ? tutorial.rewardDetails : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error completing tutorial', error: error.message });
  }
};

// Get feature tour
export const getFeatureTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    const tour = await FeatureTour.findOne({
      tourId,
      isActive: true
    });
    
    if (!tour) {
      return res.status(404).json({ message: 'Feature tour not found' });
    }
    
    res.json({ tour });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feature tour', error: error.message });
  }
};

// Update onboarding preferences
export const updateOnboardingPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.id;
    
    const onboarding = await OnboardingProgress.findOne({ user: userId });
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding progress not found' });
    }
    
    // Update preferences
    onboarding.preferences = {
      ...onboarding.preferences,
      ...preferences
    };
    
    // Mark preferences step as complete
    onboarding.markStepComplete('preferences_set', { preferences });
    
    await onboarding.save();
    
    res.json({
      message: 'Preferences updated successfully',
      onboarding
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
};

// Dismiss tip
export const dismissTip = async (req, res) => {
  try {
    const { tipId } = req.params;
    const userId = req.user.id;
    
    const onboarding = await OnboardingProgress.findOne({ user: userId });
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding progress not found' });
    }
    
    const tip = onboarding.personalizedTips.find(t => t.tipId === tipId);
    if (tip) {
      tip.dismissed = true;
      tip.dismissedAt = new Date();
      await onboarding.save();
    }
    
    res.json({ message: 'Tip dismissed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error dismissing tip', error: error.message });
  }
};

// Get onboarding statistics (admin)
export const getOnboardingStats = async (req, res) => {
  try {
    const stats = await OnboardingProgress.getOnboardingStats();
    
    // Get step completion rates
    const stepStats = await OnboardingProgress.aggregate([
      { $unwind: '$completedSteps' },
      {
        $group: {
          _id: '$completedSteps.step',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get completion funnel
    const funnelStats = await OnboardingProgress.aggregate([
      {
        $bucket: {
          groupBy: '$completionPercentage',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);
    
    res.json({
      overview: stats,
      stepCompletionRates: stepStats,
      completionFunnel: funnelStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching onboarding stats', error: error.message });
  }
};

// Helper functions
function getNextSteps(onboarding) {
  const allSteps = [
    { step: 'profile_setup', title: 'Complete your profile', description: 'Add your name, location, and contact info' },
    { step: 'email_verification', title: 'Verify your email', description: 'Confirm your email address for security' },
    { step: 'phone_verification', title: 'Verify your phone', description: 'Add your phone number for better trust' },
    { step: 'first_listing_created', title: 'Create your first listing', description: 'Post a lost or found earbud' },
    { step: 'tutorial_completed', title: 'Complete a tutorial', description: 'Learn how to use BudMatching effectively' },
    { step: 'first_search', title: 'Search for matches', description: 'Look for earbuds that match yours' },
    { step: 'first_message_sent', title: 'Send a message', description: 'Contact someone about a potential match' },
    { step: 'first_rating_given', title: 'Rate a user', description: 'Help build community trust' },
    { step: 'preferences_set', title: 'Set your preferences', description: 'Customize your experience' }
  ];
  
  const completedSteps = onboarding.completedSteps.map(s => s.step);
  return allSteps.filter(step => !completedSteps.includes(step.step)).slice(0, 3);
}

async function checkAndUnlockAchievements(onboarding, step) {
  const achievements = {
    'profile_setup': {
      achievementId: 'profile_complete',
      title: 'Profile Complete',
      description: 'You completed your profile setup',
      icon: '👤'
    },
    'email_verification': {
      achievementId: 'email_verified',
      title: 'Email Verified',
      description: 'You verified your email address',
      icon: '✉️'
    },
    'first_listing_created': {
      achievementId: 'first_listing',
      title: 'First Listing',
      description: 'You created your first listing',
      icon: '📝'
    }
  };
  
  if (achievements[step]) {
    onboarding.unlockAchievement(achievements[step]);
  }
  
  // Check completion percentage achievements
  if (onboarding.completionPercentage >= 50 && !onboarding.achievements.find(a => a.achievementId === 'halfway_there')) {
    onboarding.unlockAchievement({
      achievementId: 'halfway_there',
      title: 'Halfway There!',
      description: 'You completed 50% of onboarding',
      icon: '🚀'
    });
  }
  
  if (onboarding.completionPercentage >= 100 && !onboarding.achievements.find(a => a.achievementId === 'onboarding_master')) {
    onboarding.unlockAchievement({
      achievementId: 'onboarding_master',
      title: 'Onboarding Master',
      description: 'You completed the full onboarding process',
      icon: '🏆'
    });
  }
}

function getRecentAchievements(onboarding) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return onboarding.achievements.filter(
    a => a.unlockedAt > oneDayAgo && !a.seen
  );
}

function mapTutorialIdToType(tutorialId) {
  const mapping = {
    'create-listing': 'createListing',
    'search-and-filter': 'searchAndFilter',
    'messaging': 'messaging',
    'safety-and-trust': 'safetyAndTrust'
  };
  return mapping[tutorialId];
}

async function unlockReward(onboarding, rewardType, rewardDetails) {
  switch (rewardType) {
    case 'badge':
      if (rewardDetails.badgeId) {
        onboarding.unlockAchievement({
          achievementId: rewardDetails.badgeId,
          title: rewardDetails.title || 'Achievement Unlocked',
          description: rewardDetails.description || 'You earned a new badge',
          icon: rewardDetails.icon || '🏅'
        });
      }
      break;
    case 'points':
      // Could implement a points system here
      break;
    case 'feature_unlock':
      // Could unlock premium features here
      break;
  }
}

// Initialize default tutorials on server start
export const initializeDefaultTutorials = async (req, res) => {
  try {
    await createDefaultTutorials();
    res.json({ message: 'Default tutorials initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing tutorials', error: error.message });
  }
};
