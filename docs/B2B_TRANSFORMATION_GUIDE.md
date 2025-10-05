# SecondMarket B2B Transformation Guide

## Overview

This document provides comprehensive technical documentation for the SecondMarket platform's transformation from a C2C marketplace to a hybrid B2B+C2C Electronics & Electrical marketplace, following the IndiaM art model.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Documentation](#api-documentation)
4. [Frontend Components](#frontend-components)
5. [Business Logic](#business-logic)
6. [Setup & Deployment](#setup--deployment)
7. [Future Development](#future-development)

---

## Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Business Reg  │    │ • Company API   │    │ • Company       │
│ •Company Profile│    │ • User API      │    │ • User          │
│ • Search/Filter │    │ • Auth          │    │ • ProductListing│
│ • Analytics     │    │ • File Upload   │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Design Decisions

1. **Hybrid Approach**: Maintains existing C2C functionality while adding B2B features
2. **Backward Compatibility**: Existing users and data remain unaffected
3. **Modular Design**: B2B features are separate modules that can be independently developed
4. **Industry Focus**: Specialized for Electronics & Electrical products
5. **Revenue Model**: Lead-based + subscription-based pricing

---

## Database Schema

### Company Model

```javascript
// File: server/src/models/Company.js
const companySchema = {
  // Core Company Information
  user: ObjectId,              // References User._id
  companyName: String,         // Required, unique business name
  description: String,         // Company description
  businessType: String,        // manufacturer|wholesaler|distributor|retailer|service_provider
  
  // Product Categories
  categories: [String],        // Electronics categories (required, min 1)
  subcategories: [String],     // Subcategories for better targeting
  
  // Business Details
  yearEstablished: Number,     // Year company was founded
  employeeCount: String,       // Employee range (1-10, 11-50, etc.)
  annualTurnover: String,      // Revenue range (Under 25 Lakh, etc.)
  
  // Address & Location
  businessAddress: {
    address: String,           // Full address (required)
    city: String,             // City (required)
    state: String,            // State (required)
    pincode: String,          // 6-digit pincode (required)
    country: String,          // Default: "India"
    coordinates: [Number]     // [longitude, latitude] for geospatial queries
  },
  
  // Contact Information
  contactInfo: {
    phone: String,            // Primary phone (required)
    alternatePhone: String,   // Secondary phone
    email: String,            // Business email
    website: String,          // Company website
    socialMedia: {            // Social media handles
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String
    }
  },
  
  // Legal & Compliance
  gstNumber: String,          // 15-digit GST number (unique, optional)
  documents: [{
    type: String,             // gst|pan|trade_license|incorporation_certificate|msme|iso_certificate
    url: String,              // Cloudinary URL
    documentNumber: String,   // Document identifier
    verified: Boolean,        // Verification status
    verifiedAt: Date,         // Verification timestamp
    verifiedBy: ObjectId,     // Admin who verified
    uploadedAt: Date          // Upload timestamp
  }],
  
  // Verification & Status
  verificationStatus: String, // pending|in_review|verified|rejected|suspended
  verificationNote: String,   // Admin notes
  verifiedAt: Date,          // Verification completion date
  
  // Performance Metrics
  metrics: {
    profileViews: Number,     // Total profile views
    productViews: Number,     // Total product views
    catalogViews: Number,     // Total catalog views
    totalInquiries: Number,   // Total RFQ inquiries received
    responseRate: Number,     // Response rate percentage (0-100)
    averageResponseTime: Number, // Average response time in hours
    successfulDeals: Number,  // Completed transactions
    rating: Number,           // Average rating (0-5)
    reviewCount: Number       // Total reviews received
  },
  
  // Lead Management
  leadCredits: Number,        // Available lead credits
  subscriptionTier: String,   // free|starter|growth|enterprise
  subscriptionExpiry: Date,   // Subscription end date
  
  // Status Flags
  isActive: Boolean,          // Account active status
  isFeatured: Boolean,        // Featured listing status
  isPremium: Boolean,         // Premium account status
  
  // Analytics & Tracking
  lastActiveAt: Date,         // Last login/activity
  onboardingCompleted: Boolean, // Registration completion status
  onboardingStep: Number,     // Current onboarding step (1-4)
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
};
```

### Enhanced User Model

```javascript
// File: server/src/models/User.js
// Added field to existing schema:
{
  accountType: {
    type: String,
    enum: ['individual', 'business'],
    default: 'individual'
  }
  // ... existing fields remain unchanged
}
```

### Database Indexes

```javascript
// Performance optimization indexes
companySchema.index({ user: 1 });                           // User lookup
companySchema.index({ companyName: 'text', description: 'text' }); // Text search
companySchema.index({ categories: 1 });                     // Category filtering
companySchema.index({ verificationStatus: 1 });            // Status filtering
companySchema.index({ 'businessAddress.city': 1 });        // City filtering
companySchema.index({ 'businessAddress.state': 1 });       // State filtering
companySchema.index({ businessType: 1 });                  // Business type filtering
companySchema.index({ subscriptionTier: 1 });              // Subscription filtering
companySchema.index({ isActive: 1, verificationStatus: 1 }); // Active verified companies
companySchema.index({ 'businessAddress.coordinates': '2dsphere' }); // Geospatial queries
```

---

## API Documentation

### Company Endpoints

#### Public Endpoints

```http
# Search companies
GET /api/companies/search?q=electronics&category=Consumer%20Electronics&city=Mumbai
Query Parameters:
  - q: Search query string
  - category: Electronics category filter
  - businessType: Business type filter
  - city: City filter
  - state: State filter
  - verificationStatus: Verification status (default: verified)
  - sortBy: rating|newest|popular|verified
  - page: Page number (default: 1)
  - limit: Results per page (default: 20)

Response:
{
  "success": true,
  "companies": [Company],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

```http
# Get companies by category
GET /api/companies/category/Consumer%20Electronics?limit=10&featured=true
Query Parameters:
  - limit: Number of results (default: 10)
  - featured: Show only featured companies (default: false)

Response:
{
  "success": true,
  "companies": [Company],
  "category": "Consumer Electronics"
}
```

```http
# Get company profile
GET /api/companies/:id
Parameters:
  - id: Company ID

Response:
{
  "success": true,
  "company": {
    "_id": "company_id",
    "companyName": "TechCorp Electronics",
    "businessType": "manufacturer",
    "categories": ["Consumer Electronics"],
    "metrics": {
      "profileViews": 1250,
      "rating": 4.5,
      "reviewCount": 23
    },
    "user": {
      "name": "John Doe",
      "trustScore": 85
    }
    // ... full company data
  }
}
```

#### Protected Endpoints (Require Authentication)

```http
# Create company profile
POST /api/companies
Headers: Authorization: Bearer <token>
Body:
{
  "companyName": "TechCorp Electronics",
  "businessType": "manufacturer",
  "categories": ["Consumer Electronics"],
  "businessAddress": {
    "address": "123 Tech Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "contactInfo": {
    "phone": "+91 9876543210",
    "email": "contact@techcorp.com"
  },
  "gstNumber": "27AAAAA0000A1Z5"
}

Response:
{
  "success": true,
  "message": "Company profile created successfully",
  "company": Company
}
```

```http
# Get my company profile
GET /api/companies/me/profile
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "company": Company
}
```

```http
# Update company profile
PUT /api/companies/me/profile
Headers: Authorization: Bearer <token>
Body: Partial company data

Response:
{
  "success": true,
  "message": "Company profile updated successfully",
  "company": Company
}
```

```http
# Upload company logo/banner
POST /api/companies/me/upload/:type
Headers: Authorization: Bearer <token>
Parameters:
  - type: logo|banner
Body: FormData with 'image' field

Response:
{
  "success": true,
  "message": "Company logo uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/..."
}
```

```http
# Upload company documents
POST /api/companies/me/documents
Headers: Authorization: Bearer <token>
Body: FormData
  - document: File
  - type: gst|pan|trade_license|incorporation_certificate|msme|iso_certificate
  - documentNumber: Document identifier (optional)

Response:
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "type": "gst",
    "url": "https://res.cloudinary.com/...",
    "verified": false,
    "uploadedAt": "2023-10-05T12:00:00.000Z"
  }
}
```

```http
# Add lead credits
POST /api/companies/me/credits
Headers: Authorization: Bearer <token>
Body:
{
  "credits": 50,
  "packageType": "starter"
}

Response:
{
  "success": true,
  "message": "Lead credits added successfully",
  "leadCredits": 75
}
```

```http
# Get company analytics
GET /api/companies/me/analytics?timeframe=30d
Headers: Authorization: Bearer <token>
Query Parameters:
  - timeframe: 1d|7d|30d|90d|1y

Response:
{
  "success": true,
  "analytics": {
    "profileViews": 1250,
    "inquiries": 45,
    "conversionRate": 12.5,
    "currentMetrics": Company.metrics,
    "leadCredits": 25,
    "subscriptionTier": "growth"
  }
}
```

### Error Responses

```javascript
// Standard error response format
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message", // Optional
  "code": "ERROR_CODE" // Optional
}

// Common error codes:
// 400 - Bad Request (validation errors)
// 401 - Unauthorized (authentication required)
// 403 - Forbidden (insufficient permissions)
// 404 - Not Found (resource doesn't exist)
// 409 - Conflict (duplicate data)
// 500 - Internal Server Error
```

---

## Frontend Components

### BusinessRegistrationForm Component

```javascript
// File: client/src/components/business/BusinessRegistrationForm.jsx

// Props interface
interface BusinessRegistrationFormProps {
  onSubmit: (formData: CompanyFormData) => void;
  loading?: boolean;
  error?: string | null;
}

// Form data structure
interface CompanyFormData {
  companyName: string;
  description: string;
  businessType: 'manufacturer' | 'wholesaler' | 'distributor' | 'retailer' | 'service_provider';
  categories: string[];
  subcategories: string[];
  yearEstablished: string;
  employeeCount: string;
  annualTurnover: string;
  gstNumber: string;
  businessAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    alternatePhone: string;
    email: string;
    website: string;
  };
}
```

#### Component Features

1. **Multi-step Wizard**: 4-step registration process with progress tracking
2. **Form Validation**: Real-time validation with error messages
3. **Indian Context**: GST validation, Indian states, business formats
4. **Electronics Focus**: Pre-defined electronics categories
5. **Responsive Design**: Mobile and desktop optimized
6. **Error Handling**: Comprehensive error display and recovery

#### Step Breakdown

```javascript
// Step 1: Basic Information
- Company name (required)
- Business type selection (required)
- Electronics categories multi-select (required)
- Company description (optional)

// Step 2: Business Details
- Year established (optional)
- Employee count range (optional)
- Annual turnover range (optional)
- GST number with validation (optional)

// Step 3: Address & Contact
- Complete business address (required)
- City, state, pincode (required)
- Phone number (required)
- Alternate phone, email, website (optional)

// Step 4: Review & Submit
- Complete information review
- Error display
- Final submission
```

### Company Service

```javascript
// File: client/src/services/companyService.js

// Main API functions
export const createCompanyProfile = async (companyData) => { /* ... */ };
export const getCompanyProfile = async (id) => { /* ... */ };
export const getMyCompanyProfile = async () => { /* ... */ };
export const updateCompanyProfile = async (updateData) => { /* ... */ };
export const uploadCompanyImage = async (file, type) => { /* ... */ };
export const uploadCompanyDocument = async (file, type, documentNumber) => { /* ... */ };
export const searchCompanies = async (filters) => { /* ... */ };
export const getCompaniesByCategory = async (category, options) => { /* ... */ };
export const addLeadCredits = async (credits, packageType) => { /* ... */ };
export const getCompanyAnalytics = async (timeframe) => { /* ... */ };

// Helper functions
export const getLeadPackages = () => { /* Lead pricing packages */ };
export const getElectronicsCategories = () => { /* Category structure */ };
export const getBusinessTypes = () => { /* Business type definitions */ };
export const getVerificationStatusInfo = (status) => { /* Status mapping */ };
export const getSubscriptionTierInfo = (tier) => { /* Tier information */ };
```

---

## Business Logic

### Electronics Categories Structure

```javascript
const electronicsCategories = {
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
```

### Lead Credit System

```javascript
// Lead packages with pricing
const leadPackages = [
  {
    id: 'starter',
    name: 'Starter Package',
    credits: 50,
    price: 999,          // ₹999 for 50 credits
    validity: 30,        // 30 days validity
    pricePerLead: 19.98, // ₹19.98 per lead
    features: ['Basic leads', 'Email support', 'Lead tracking']
  },
  {
    id: 'growth',
    name: 'Growth Package',
    credits: 200,
    price: 2999,         // ₹2999 for 200 credits
    validity: 30,
    pricePerLead: 14.99, // ₹14.99 per lead
    features: ['Verified leads', 'Priority support', 'Advanced analytics'],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Package', 
    credits: 1000,
    price: 9999,         // ₹9999 for 1000 credits
    validity: 30,
    pricePerLead: 9.99,  // ₹9.99 per lead
    features: ['Premium leads', '24/7 support', 'API access']
  }
];
```

### Subscription Tiers

```javascript
const subscriptionTiers = {
  free: {
    name: 'Free',
    price: 0,
    limits: { products: 10, leads: 5 },
    features: ['Basic listing', 'Manual verification']
  },
  starter: {
    name: 'Starter',
    price: 499,         // ₹499/month
    limits: { products: 50, leads: 20 },
    features: ['Featured listing', 'Priority verification', 'Analytics']
  },
  growth: {
    name: 'Growth',
    price: 1999,        // ₹1999/month
    limits: { products: 200, leads: 100 },
    features: ['Top placement', 'Instant verification', 'Advanced analytics']
  },
  enterprise: {
    name: 'Enterprise',
    price: 4999,        // ₹4999/month
    limits: { products: -1, leads: -1 }, // Unlimited
    features: ['Premium placement', 'Dedicated support', 'Custom integration']
  }
};
```

### Verification Workflow

```javascript
// Verification status flow
const verificationFlow = {
  pending: {
    description: 'Documents uploaded, awaiting review',
    nextStates: ['in_review'],
    userActions: ['upload_documents', 'edit_profile']
  },
  in_review: {
    description: 'Admin team reviewing documents',
    nextStates: ['verified', 'rejected'],
    userActions: ['wait']
  },
  verified: {
    description: 'Business verified and active',
    nextStates: ['suspended'],
    userActions: ['full_access']
  },
  rejected: {
    description: 'Documents rejected, re-submission needed',
    nextStates: ['pending'],
    userActions: ['resubmit_documents']
  },
  suspended: {
    description: 'Account suspended, contact support',
    nextStates: ['verified'],
    userActions: ['contact_support']
  }
};
```

---

## Setup & Deployment

### Development Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd SecondMarket-main

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Environment configuration
# Server (.env)
cp server/.env.sample server/.env
# Configure MongoDB, Cloudinary, JWT secrets

# Client (.env)
cp client/.env.example client/.env
# Configure API URLs if needed

# 4. Start development servers
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

### Environment Variables

```bash
# Server environment variables
MONGODB_URI=mongodb://localhost:27017/budmatching
JWT_SECRET=your-jwt-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
SENDGRID_API_KEY=your-sendgrid-key
NODE_ENV=development
PORT=5000

# Client environment variables
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
```

### Database Setup

```javascript
// Required MongoDB collections and indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.companies.createIndex({ user: 1 }, { unique: true });
db.companies.createIndex({ gstNumber: 1 }, { unique: true, sparse: true });
db.companies.createIndex({ companyName: "text", description: "text" });
db.companies.createIndex({ categories: 1 });
db.companies.createIndex({ "businessAddress.coordinates": "2dsphere" });
```

### Production Deployment

```bash
# Build frontend
cd client && npm run build

# Deploy backend
cd server
npm install --production
npm start

# Deploy frontend (static files)
# Upload dist/ folder to CDN or static hosting
```

---

## Future Development

### Week 2: Product Catalogs & B2B Specifications
- Enhanced ProductListing model with B2B fields
- Product catalog management system
- Bulk pricing tiers and MOQ (Minimum Order Quantity)
- Electronics-specific technical specifications

### Week 3: RFQ & Lead Management
- Request for Quote (RFQ) system
- Lead generation and routing algorithms
- Quote management dashboard
- Lead payment processing

### Week 4: Analytics & Polish
- Advanced analytics dashboards
- Complete verification workflows
- Mobile app optimization
- Performance monitoring

### Scaling Considerations

1. **Database Sharding**: Plan for horizontal scaling of MongoDB
2. **Caching Layer**: Implement Redis for frequently accessed data
3. **CDN Integration**: Optimize image and asset delivery
4. **Microservices**: Break down into smaller, focused services
5. **Search Optimization**: Consider Elasticsearch for advanced search
6. **Real-time Features**: WebSocket integration for live updates

### Code Quality & Maintenance

1. **Testing**: Implement unit and integration tests
2. **Documentation**: Keep API documentation updated
3. **Code Reviews**: Establish review process for changes
4. **Monitoring**: Set up application and error monitoring
5. **Security**: Regular security audits and updates

---

## Contributing Guidelines

### Code Standards
- Use ESLint and Prettier for code formatting
- Follow RESTful API conventions
- Implement proper error handling
- Write clear commit messages
- Add comments for complex business logic

### Development Workflow
1. Create feature branches from main
2. Implement changes with tests
3. Submit pull requests with descriptions
4. Code review and approval process
5. Merge to main and deploy

---

*This documentation is maintained by the development team and should be updated with any architectural changes or new features.*
