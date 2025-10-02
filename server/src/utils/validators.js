import { body, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
export const userValidationRules = {
  register: [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
    body('location').optional(),
    body('phoneNumber').optional()
  ],
  login: [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  updateProfile: [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('location').optional(),
    body('phoneNumber').optional()
  ]
};

// Earbud listing validation rules
export const listingValidationRules = {
  create: [
    body('brand').notEmpty().withMessage('Brand is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('side')
      .isIn(['left', 'right'])
      .withMessage('Side must be either left or right'),
    body('condition')
      .isIn(['new', 'like_new', 'good', 'fair', 'poor'])
      .withMessage('Invalid condition value'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('description').optional(),
    body('images')
      .isArray({ min: 1 })
      .withMessage('At least one image is required'),
    body('location').notEmpty().withMessage('Location is required')
  ],
  update: [
    body('brand').optional().notEmpty().withMessage('Brand cannot be empty'),
    body('model').optional().notEmpty().withMessage('Model cannot be empty'),
    body('side')
      .optional()
      .isIn(['left', 'right'])
      .withMessage('Side must be either left or right'),
    body('condition')
      .optional()
      .isIn(['new', 'like_new', 'good', 'fair', 'poor'])
      .withMessage('Invalid condition value'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('description').optional(),
    body('images')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one image is required'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty')
  ]
};

// Message validation rules
export const messageValidationRules = {
  send: [
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('listingId').notEmpty().withMessage('Listing ID is required'),
    body('content').notEmpty().withMessage('Message content is required')
  ]
}; 