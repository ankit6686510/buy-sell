import mongoose from 'mongoose';

const photoVerificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EarbudListing',
    required: true
  },
  originalPhoto: {
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      size: Number,
      format: String,
      dimensions: {
        width: Number,
        height: Number
      }
    }
  },
  verificationPhoto: {
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    requirements: {
      showSerialNumber: { type: Boolean, default: false },
      showTimestamp: { type: Boolean, default: true },
      showUserNote: { type: Boolean, default: true }
    },
    metadata: {
      size: Number,
      format: String,
      dimensions: {
        width: Number,
        height: Number
      },
      exifData: mongoose.Schema.Types.Mixed
    }
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true
  },
  userNote: {
    type: String,
    maxlength: 100,
    required: true // e.g., "BudMatch verification for John Doe - 2025"
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  aiAnalysis: {
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    detectedObjects: [{
      object: String,
      confidence: Number,
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }],
    textDetection: [{
      text: String,
      confidence: Number,
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }],
    similarityScore: Number, // Compared to original listing photo
    flags: [{
      type: {
        type: String,
        enum: ['low_quality', 'wrong_object', 'missing_note', 'duplicate_image', 'suspicious_editing']
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      description: String
    }]
  },
  humanReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Admin/moderator
    },
    reviewedAt: Date,
    decision: {
      type: String,
      enum: ['approved', 'rejected']
    },
    notes: String,
    confidence: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours to complete verification
    }
  },
  completedAt: Date,
  attempts: {
    type: Number,
    default: 1,
    max: 3
  }
}, {
  timestamps: true
});

// Photo Verification Challenge Schema (for generating verification requirements)
const verificationChallengeSchema = new mongoose.Schema({
  challengeId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['timestamp', 'user_note', 'serial_number', 'angle_change', 'environment_change'],
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  expectedElements: [String], // What should be visible in the photo
  validationRules: {
    minTextLength: Number,
    requiredPhrases: [String],
    forbiddenElements: [String]
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
photoVerificationSchema.index({ user: 1, listing: 1 });
photoVerificationSchema.index({ status: 1, submittedAt: -1 });
photoVerificationSchema.index({ verificationCode: 1 }, { unique: true });
photoVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

verificationChallengeSchema.index({ type: 1, isActive: 1 });

// Methods
photoVerificationSchema.methods.generateVerificationCode = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  this.verificationCode = `BM-${timestamp}-${random}`.toUpperCase();
  return this.verificationCode;
};

photoVerificationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

photoVerificationSchema.methods.canRetry = function() {
  return this.attempts < 3 && !this.isExpired();
};

photoVerificationSchema.methods.approve = function(reviewerId = null, notes = null) {
  this.status = 'approved';
  this.completedAt = new Date();
  if (reviewerId) {
    this.humanReview.reviewedBy = reviewerId;
    this.humanReview.reviewedAt = new Date();
    this.humanReview.decision = 'approved';
    this.humanReview.notes = notes;
  }
  return this.save();
};

photoVerificationSchema.methods.reject = function(reviewerId = null, notes = null) {
  this.status = 'rejected';
  if (reviewerId) {
    this.humanReview.reviewedBy = reviewerId;
    this.humanReview.reviewedAt = new Date();
    this.humanReview.decision = 'rejected';
    this.humanReview.notes = notes;
  }
  return this.save();
};

// Static methods
photoVerificationSchema.statics.createVerificationRequest = async function(userId, listingId, originalPhoto) {
  const verification = new this({
    user: userId,
    listing: listingId,
    originalPhoto
  });
  
  verification.generateVerificationCode();
  
  // Generate user note requirement
  const user = await mongoose.model('User').findById(userId);
  const currentDate = new Date().toLocaleDateString();
  verification.userNote = `BudMatch verification for ${user.name} - ${currentDate}`;
  
  await verification.save();
  return verification;
};

photoVerificationSchema.statics.getVerificationInstructions = function(verificationCode) {
  return {
    title: 'Photo Verification Required',
    instructions: [
      'Take a new photo of your earbud from a different angle than your original listing photo',
      'Include a handwritten note with the verification code in the photo',
      'Ensure good lighting and the earbud is clearly visible',
      'Do not use filters or edit the photo'
    ],
    verificationCode,
    requirements: {
      note: `Write "${verificationCode}" on a piece of paper and include it in the photo`,
      lighting: 'Good lighting with clear visibility of the earbud',
      angle: 'Different angle from your original listing photo',
      timeLimit: '24 hours to complete verification'
    },
    tips: [
      'Use natural lighting for best results',
      'Make sure the handwritten note is clearly readable',
      'The earbud should take up most of the photo frame',
      'Avoid shadows covering important details'
    ]
  };
};

// Challenge generation methods
verificationChallengeSchema.statics.generateChallenge = async function(difficulty = 'medium') {
  const challenges = await this.find({ 
    difficulty, 
    isActive: true 
  });
  
  if (challenges.length === 0) {
    // Return default challenge
    return {
      type: 'user_note',
      instructions: 'Include a handwritten note with the verification code',
      expectedElements: ['handwritten_note', 'verification_code'],
      validationRules: {
        minTextLength: 10,
        requiredPhrases: ['BudMatch', 'verification']
      }
    };
  }
  
  return challenges[Math.floor(Math.random() * challenges.length)];
};

// Virtual for verification status
photoVerificationSchema.virtual('isVerified').get(function() {
  return this.status === 'approved';
});

photoVerificationSchema.virtual('needsHumanReview').get(function() {
  return this.status === 'pending' && 
         this.aiAnalysis && 
         (this.aiAnalysis.confidence < 80 || this.aiAnalysis.flags.length > 0);
});

export const PhotoVerification = mongoose.model('PhotoVerification', photoVerificationSchema);
export const VerificationChallenge = mongoose.model('VerificationChallenge', verificationChallengeSchema);

// Default challenges to seed the database
export const defaultChallenges = [
  {
    challengeId: 'timestamp-easy',
    type: 'timestamp',
    instructions: 'Include current date and time written on paper in the photo',
    expectedElements: ['date', 'time', 'handwriting'],
    validationRules: {
      minTextLength: 15,
      requiredPhrases: ['2025']
    },
    difficulty: 'easy'
  },
  {
    challengeId: 'user-note-medium',
    type: 'user_note',
    instructions: 'Write "BudMatch verification for [Your Name]" on paper and include in photo',
    expectedElements: ['handwritten_note', 'user_name', 'budmatch'],
    validationRules: {
      minTextLength: 20,
      requiredPhrases: ['BudMatch', 'verification']
    },
    difficulty: 'medium'
  },
  {
    challengeId: 'angle-change-medium',
    type: 'angle_change',
    instructions: 'Take photo from completely different angle than original listing',
    expectedElements: ['earbud', 'different_perspective'],
    validationRules: {
      forbiddenElements: ['same_angle', 'identical_positioning']
    },
    difficulty: 'medium'
  }
];
