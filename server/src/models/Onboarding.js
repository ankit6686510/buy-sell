import mongoose from 'mongoose';

// Onboarding Progress Tracking
const onboardingProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  completedSteps: [{
    step: {
      type: String,
      required: true,
      enum: [
        'profile_setup', 'email_verification', 'phone_verification', 
        'first_listing_created', 'tutorial_completed', 'first_search',
        'first_message_sent', 'first_rating_given', 'preferences_set',
        'onboarding_completed'
      ]
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  preferences: {
    skipTutorials: {
      type: Boolean,
      default: false
    },
    showTips: {
      type: Boolean,
      default: true
    },
    notificationPreferences: {
      email: {
        tips: { type: Boolean, default: true },
        matches: { type: Boolean, default: true },
        messages: { type: Boolean, default: true }
      },
      push: {
        tips: { type: Boolean, default: true },
        matches: { type: Boolean, default: true },
        messages: { type: Boolean, default: true }
      }
    }
  },
  tutorialProgress: {
    createListing: {
      completed: { type: Boolean, default: false },
      currentStep: { type: Number, default: 1 },
      completedAt: Date
    },
    searchAndFilter: {
      completed: { type: Boolean, default: false },
      currentStep: { type: Number, default: 1 },
      completedAt: Date
    },
    messaging: {
      completed: { type: Boolean, default: false },
      currentStep: { type: Number, default: 1 },
      completedAt: Date
    },
    safetyAndTrust: {
      completed: { type: Boolean, default: false },
      currentStep: { type: Number, default: 1 },
      completedAt: Date
    }
  },
  personalizedTips: [{
    tipId: String,
    tipType: {
      type: String,
      enum: ['feature_tip', 'best_practice', 'safety_tip', 'success_story']
    },
    title: String,
    content: String,
    actionUrl: String,
    shown: {
      type: Boolean,
      default: false
    },
    dismissed: {
      type: Boolean,
      default: false
    },
    shownAt: Date,
    dismissedAt: Date
  }],
  achievements: [{
    achievementId: String,
    title: String,
    description: String,
    icon: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    seen: {
      type: Boolean,
      default: false
    }
  }],
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  lastActiveStep: Date
}, {
  timestamps: true
});

// Tutorial Content Schema
const tutorialContentSchema = new mongoose.Schema({
  tutorialId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: ['getting_started', 'creating_listings', 'finding_matches', 'messaging', 'safety', 'advanced']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: Number, // in minutes
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    title: String,
    content: String,
    type: {
      type: String,
      enum: ['text', 'video', 'interactive', 'checklist'],
      default: 'text'
    },
    media: {
      type: String, // URL to image/video
    },
    action: {
      type: String, // Button text or action to take
    },
    actionUrl: String,
    tips: [String]
  }],
  prerequisites: [String], // Other tutorial IDs that should be completed first
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'experienced_users', 'power_users'],
    default: 'all'
  },
  completionReward: {
    type: String,
    enum: ['badge', 'points', 'feature_unlock'],
  },
  rewardDetails: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Feature Tour Schema
const featureTourSchema = new mongoose.Schema({
  tourId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  triggerCondition: {
    type: String,
    enum: ['page_visit', 'feature_use', 'manual', 'time_based'],
    default: 'manual'
  },
  triggerValue: String, // URL, feature name, etc.
  steps: [{
    stepNumber: Number,
    target: String, // CSS selector or element ID
    title: String,
    content: String,
    placement: {
      type: String,
      enum: ['top', 'bottom', 'left', 'right', 'center'],
      default: 'bottom'
    },
    showArrow: {
      type: Boolean,
      default: true
    },
    action: {
      type: String,
      enum: ['highlight', 'tooltip', 'modal', 'overlay']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  targetUsers: {
    type: String,
    enum: ['new_users', 'returning_users', 'all'],
    default: 'new_users'
  }
});

// Indexes
onboardingProgressSchema.index({ user: 1 });
onboardingProgressSchema.index({ completionPercentage: -1 });
tutorialContentSchema.index({ category: 1, difficulty: 1 });
tutorialContentSchema.index({ isActive: 1, targetAudience: 1 });
featureTourSchema.index({ isActive: 1, targetUsers: 1 });

// Methods for OnboardingProgress
onboardingProgressSchema.methods.markStepComplete = function(step, metadata = {}) {
  // Check if step already completed
  const existingStep = this.completedSteps.find(s => s.step === step);
  if (existingStep) {
    return false;
  }
  
  this.completedSteps.push({
    step,
    metadata
  });
  
  // Update completion percentage
  this.calculateCompletionPercentage();
  
  // Move to next step if applicable
  this.updateCurrentStep();
  
  return true;
};

onboardingProgressSchema.methods.calculateCompletionPercentage = function() {
  const totalSteps = 10; // Total onboarding steps
  const completedCount = this.completedSteps.length;
  this.completionPercentage = Math.round((completedCount / totalSteps) * 100);
  
  if (this.completionPercentage >= 100 && !this.completedAt) {
    this.completedAt = new Date();
    this.markStepComplete('onboarding_completed');
  }
};

onboardingProgressSchema.methods.updateCurrentStep = function() {
  const stepOrder = [
    'profile_setup', 'email_verification', 'phone_verification',
    'first_listing_created', 'tutorial_completed', 'first_search',
    'first_message_sent', 'first_rating_given', 'preferences_set',
    'onboarding_completed'
  ];
  
  for (let i = 0; i < stepOrder.length; i++) {
    const stepExists = this.completedSteps.find(s => s.step === stepOrder[i]);
    if (!stepExists) {
      this.currentStep = i + 1;
      break;
    }
  }
};

onboardingProgressSchema.methods.addPersonalizedTip = function(tip) {
  // Remove existing tip of same type if exists
  this.personalizedTips = this.personalizedTips.filter(
    t => t.tipId !== tip.tipId
  );
  
  this.personalizedTips.push(tip);
};

onboardingProgressSchema.methods.unlockAchievement = function(achievement) {
  const existingAchievement = this.achievements.find(
    a => a.achievementId === achievement.achievementId
  );
  
  if (!existingAchievement) {
    this.achievements.push(achievement);
    return true;
  }
  
  return false;
};

// Static methods
onboardingProgressSchema.statics.getOnboardingStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        completedUsers: {
          $sum: { $cond: [{ $gte: ['$completionPercentage', 100] }, 1, 0] }
        },
        avgCompletionPercentage: { $avg: '$completionPercentage' },
        avgTimeToComplete: {
          $avg: {
            $cond: [
              { $ne: ['$completedAt', null] },
              { $subtract: ['$completedAt', '$startedAt'] },
              null
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    completedUsers: 0,
    avgCompletionPercentage: 0,
    avgTimeToComplete: 0
  };
};

export const OnboardingProgress = mongoose.model('OnboardingProgress', onboardingProgressSchema);
export const TutorialContent = mongoose.model('TutorialContent', tutorialContentSchema);
export const FeatureTour = mongoose.model('FeatureTour', featureTourSchema);

// Helper function to create default tutorials
export const createDefaultTutorials = async () => {
  const defaultTutorials = [
    {
      tutorialId: 'getting-started',
      title: 'Welcome to SecondMarket!',
      description: 'Learn the basics of finding and matching lost earbuds',
      category: 'getting_started',
      difficulty: 'beginner',
      estimatedDuration: 5,
      steps: [
        {
          stepNumber: 1,
          title: 'Welcome to SecondMarket',
          content: 'SecondMarket helps you find the missing earbud to complete your pair. Whether you\'ve lost one or found one, we connect you with the right people.',
          type: 'text'
        },
        {
          stepNumber: 2,
          title: 'How It Works',
          content: 'Simply create a listing for your lost or found earbud, and our smart matching system will find potential matches nearby.',
          type: 'text'
        },
        {
          stepNumber: 3,
          title: 'Safety First',
          content: 'Always meet in public places and verify the earbud details before completing any exchange.',
          type: 'text'
        }
      ],
      targetAudience: 'new_users',
      completionReward: 'badge',
      rewardDetails: { badgeId: 'newcomer', points: 10 }
    },
    {
      tutorialId: 'create-listing',
      title: 'Creating Your First Listing',
      description: 'Step-by-step guide to creating an effective listing',
      category: 'creating_listings',
      difficulty: 'beginner',
      estimatedDuration: 10,
      steps: [
        {
          stepNumber: 1,
          title: 'Choose Listing Type',
          content: 'Decide whether you\'re posting a "Lost" or "Found" earbud listing.',
          type: 'interactive',
          action: 'Try it now',
          actionUrl: '/listings/create'
        },
        {
          stepNumber: 2,
          title: 'Add Details',
          content: 'Include brand, model, side (left/right), condition, and location for better matches.',
          type: 'text'
        },
        {
          stepNumber: 3,
          title: 'Upload Photos',
          content: 'Clear photos help others identify the earbud and build trust.',
          type: 'text'
        }
      ],
      prerequisites: ['getting-started'],
      targetAudience: 'new_users'
    }
  ];
  
  for (const tutorial of defaultTutorials) {
    await TutorialContent.findOneAndUpdate(
      { tutorialId: tutorial.tutorialId },
      tutorial,
      { upsert: true, new: true }
    );
  }
};
