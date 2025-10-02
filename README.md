# 🎧 SecondMarket - Smart Earbud Recovery Platform

**SecondMarket** is a sophisticated full-stack platform that uses intelligent algorithms to help users find and match lost earbuds. Built with modern technologies and enterprise-level features, it provides a comprehensive solution for earbud recovery with advanced matching, real-time communication, and trust & safety systems.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%3E%3D18.0.0-blue)](https://reactjs.org/)

---

## 🚀 **Features Overview**

### **🧠 Smart Matching System**
- **Intelligent Algorithm**: Location-based matching with geospatial queries
- **Compatibility Scoring**: Advanced scoring system considering distance, price, condition, and user ratings
- **Personalized Recommendations**: ML-driven suggestions based on user behavior
- **Brand & Model Matching**: Precise matching with opposite-side requirements

### **🔒 Trust & Safety**
- **Multi-Channel Verification**: Email, phone, and identity document verification
- **Trust Score System**: Dynamic scoring based on verifications and community feedback
- **Photo Verification**: AI-powered verification with challenge-based authentication
- **Safety Reports**: User reporting and blocking/unblocking capabilities

### **🎨 Modern UI/UX**
- **Glass Morphism Design**: Contemporary frosted glass effects with backdrop blur
- **Gradient System**: Multi-tone color palettes with smooth gradients
- **Smooth Animations**: GPU-accelerated transitions and micro-interactions
- **Dark/Light Themes**: Automatic theme switching with user preferences
- **Mobile-First**: Responsive design optimized for all devices

### **📊 Analytics & Insights**
- **User Activity Tracking**: Comprehensive behavior analytics
- **Conversion Funnel**: A/B testing framework and performance monitoring
- **Real-time Metrics**: Dashboard with live insights and statistics
- **Success Tracking**: Match success rates and user satisfaction metrics

### **💬 Communication**
- **Real-time Messaging**: Socket.io powered chat with read receipts
- **Push Notifications**: Multi-channel notifications (push, email, in-app)
- **Message History**: Persistent chat history with search capabilities
- **Typing Indicators**: Live typing status and presence detection

### **🎓 User Experience**
- **Guided Onboarding**: Progressive onboarding with achievement system
- **Interactive Tutorials**: Step-by-step guides with gamification
- **Smart Tips**: Context-aware tips based on user behavior
- **Achievement Badges**: Gamified experience with unlock rewards

---

## 🏗️ **Architecture & Technology Stack**

### **Frontend Stack**
```json
{
  "framework": "React 18.2.0",
  "bundler": "Vite 4.4.5",
  "ui_library": "Material-UI 5.14.5",
  "state_management": "Redux Toolkit 1.9.5",
  "routing": "React Router DOM 6.15.0",
  "forms": "Formik 2.4.3 + Yup 1.2.0",
  "http_client": "Axios 1.5.0",
  "realtime": "Socket.io Client 4.7.2",
  "styling": "Emotion + Custom Theme System"
}
```

### **Backend Stack**
```json
{
  "runtime": "Node.js",
  "framework": "Express.js 4.18.2",
  "database": "MongoDB + Mongoose 7.5.0",
  "authentication": "JWT + Passport.js",
  "file_storage": "Cloudinary 1.40.0",
  "realtime": "Socket.io 4.7.2",
  "security": "bcryptjs + Rate Limiting",
  "logging": "Winston 3.10.0",
  "validation": "Express Validator 7.0.1"
}
```

### **Database Schema**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      User       │    │ EarbudListing   │    │    Message      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ _id             │◄──┐│ _id             │    │ _id             │
│ name            │   ││ user (ref)      │◄──┐│ sender (ref)    │
│ email           │   ││ brand           │   ││ chat (ref)      │
│ verification    │   ││ model           │   ││ content         │
│ trustScore      │   ││ side            │   ││ readBy[]        │
│ rating          │   ││ condition       │   ││ type            │
│ badges[]        │   ││ price           │   ││ attachments[]   │
│ location        │   ││ location        │   │└─────────────────┘
└─────────────────┘   ││ coordinates     │   │
                      ││ status          │   │
                      ││ matchScore      │   │
                      └─────────────────┘   │
                                           │
┌─────────────────┐    ┌─────────────────┐   │
│    Analytics    │    │     Rating      │   │
├─────────────────┤    ├─────────────────┤   │
│ _id             │    │ _id             │   │
│ user (ref)      │◄───│ rater (ref)     │◄──┘
│ action          │    │ rated (ref)     │
│ metadata        │    │ categories      │
│ sessionId       │    │ comment         │
│ timestamp       │    │ helpfulVotes    │
└─────────────────┘    └─────────────────┘
```

---

## 🔧 **Setup & Installation**

### **Prerequisites**
- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn**
- **Git**

### **Environment Configuration**

#### **Backend Environment (server/.env)**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/SecondMarket

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_64_characters
SESSION_SECRET=your_session_secret_key

# External Services
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# OAuth
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Client Configuration
CLIENT_URL=http://localhost:5173

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

#### **Frontend Environment (client/.env)**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# External Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

# Analytics
VITE_ANALYTICS_ENABLED=true
```

### **Installation Steps**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/SecondMarket.git
cd SecondMarket

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install

# 4. Setup environment files
cp server/.env.sample server/.env
cp client/.env.example client/.env

# 5. Configure environment variables (edit the .env files)

# 6. Start MongoDB (if using local installation)
mongod

# 7. Start the backend server
cd server
npm run dev

# 8. Start the frontend (in new terminal)
cd client
npm run dev
```

### **Access Points**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs (if implemented)

---

## 📡 **API Documentation**

### **Authentication Endpoints**

#### **POST /api/users/register**
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "location": {
    "address": "123 Main St, City, State",
    "coordinates": [-122.4194, 37.7749]
  }
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "64f8b...",
    "name": "John Doe",
    "email": "john@example.com",
    "verification": {
      "email": false,
      "phone": false
    },
    "trustScore": 0,
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **POST /api/users/login**
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "64f8b...",
    "name": "John Doe",
    "email": "john@example.com",
    "trustScore": 85,
    "badges": ["verified_email", "trusted_seller"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Listing Endpoints**

#### **GET /api/listings**
Get listings with advanced filtering and search.

**Query Parameters:**
```
?brand=Apple
&model=AirPods Pro
&side=left
&condition=like_new,good
&minPrice=50
&maxPrice=200
&lat=37.7749
&lng=-122.4194
&radius=25
&search=wireless earbuds
&sortBy=distance
&page=1
&limit=20
```

**Response (200):**
```json
{
  "listings": [
    {
      "_id": "64f8c...",
      "brand": "Apple",
      "model": "AirPods Pro",
      "side": "left",
      "condition": "like_new",
      "price": 75,
      "color": "White",
      "images": ["https://res.cloudinary.com/..."],
      "location": {
        "address": "San Francisco, CA",
        "coordinates": [-122.4194, 37.7749]
      },
      "user": {
        "_id": "64f8b...",
        "name": "Jane Smith",
        "avatar": "https://res.cloudinary.com/...",
        "rating": 4.8,
        "verification": {
          "email": true,
          "phone": true
        },
        "trustScore": 92
      },
      "distance": 2.3,
      "matchScore": 95,
      "views": 45,
      "createdAt": "2025-01-15T08:20:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 94,
    "itemsPerPage": 20,
    "hasMore": true
  },
  "filters": {
    "appliedFilters": {
      "brand": "Apple",
      "condition": ["like_new", "good"],
      "radius": 25
    },
    "availableFilters": {
      "brands": ["Apple", "Sony", "Bose", "Samsung"],
      "models": ["AirPods Pro", "AirPods 3", "WF-1000XM4"],
      "colors": ["White", "Black", "Silver"],
      "conditions": ["new", "like_new", "good", "fair", "poor"]
    }
  }
}
```

#### **POST /api/listings**
Create a new earbud listing.

**Request Body:**
```json
{
  "brand": "Sony",
  "model": "WF-1000XM4",
  "side": "right",
  "condition": "good",
  "price": 120,
  "color": "Black",
  "description": "Lost my right Sony earbud at the park. Case included.",
  "images": ["base64_image_data_or_urls"],
  "location": {
    "address": "Central Park, New York, NY",
    "coordinates": [-73.9654, 40.7829]
  },
  "preferences": {
    "maxDistance": 30,
    "priceFlexibility": 15
  }
}
```

**Response (201):**
```json
{
  "message": "Listing created successfully",
  "listing": {
    "_id": "64f8d...",
    "brand": "Sony",
    "model": "WF-1000XM4",
    "side": "right",
    "status": "available",
    "views": 0,
    "createdAt": "2025-01-15T14:30:00.000Z"
  }
}
```

#### **GET /api/listings/:id/matches**
Find potential matches for a specific listing.

**Response (200):**
```json
{
  "matches": [
    {
      "_id": "64f8e...",
      "brand": "Sony",
      "model": "WF-1000XM4",
      "side": "left",
      "matchScore": 92,
      "distance": 1.2,
      "compatibilityReasons": [
        "Perfect brand and model match",
        "Very close location (within 5km)",
        "Compatible price range",
        "Recently posted"
      ],
      "user": {
        "name": "Mike Johnson",
        "rating": 4.6,
        "trustScore": 88
      }
    }
  ],
  "totalFound": 1,
  "searchCriteria": {
    "brand": "Sony",
    "model": "WF-1000XM4",
    "oppositeSide": "left",
    "maxDistance": 30
  }
}
```

### **Messaging Endpoints**

#### **POST /api/messages**
Send a new message in a chat.

**Request Body:**
```json
{
  "chatId": "64f8f...",
  "content": "Hi! Is this Sony earbud still available?",
  "type": "text",
  "replyTo": "64f8g..." // Optional: reply to specific message
}
```

**Response (201):**
```json
{
  "message": {
    "_id": "64f8h...",
    "sender": "64f8b...",
    "content": "Hi! Is this Sony earbud still available?",
    "type": "text",
    "readBy": [],
    "deliveredTo": [
      {
        "user": "64f8c...",
        "deliveredAt": "2025-01-15T15:45:00.000Z"
      }
    ],
    "createdAt": "2025-01-15T15:45:00.000Z"
  }
}
```

#### **PUT /api/messages/read/:chatId**
Mark all messages in a chat as read.

**Response (200):**
```json
{
  "message": "Messages marked as read",
  "updatedCount": 5
}
```

### **Analytics Endpoints**

#### **POST /api/analytics/track/activity**
Track user activity for analytics.

**Request Body:**
```json
{
  "action": "view_listing",
  "metadata": {
    "listingId": "64f8d...",
    "searchQuery": "Apple AirPods",
    "referrer": "home_page",
    "deviceType": "mobile"
  }
}
```

**Response (201):**
```json
{
  "message": "Activity tracked successfully",
  "activityId": "64f8i..."
}
```

### **Verification Endpoints**

#### **POST /api/users/verification/email**
Send email verification.

**Response (200):**
```json
{
  "message": "Verification email sent",
  "expiresAt": "2025-01-15T16:45:00.000Z"
}
```

#### **POST /api/users/verification/photo**
Submit photo verification.

**Request Body:**
```json
{
  "listingId": "64f8d...",
  "verificationPhoto": "base64_image_data",
  "userNote": "BudMatch verification for John Doe - 01/15/2025"
}
```

**Response (201):**
```json
{
  "message": "Photo verification submitted",
  "verification": {
    "_id": "64f8j...",
    "verificationCode": "BM-ABC123-DEF456",
    "status": "pending",
    "expiresAt": "2025-01-16T15:45:00.000Z"
  }
}
```

### **Rating & Review Endpoints**

#### **POST /api/ratings**
Create a rating and review.

**Request Body:**
```json
{
  "ratedUser": "64f8c...",
  "categories": {
    "communication": 5,
    "reliability": 4,
    "itemCondition": 5
  },
  "comment": "Great seller! Item exactly as described.",
  "transactionType": "earbud_exchange",
  "listingId": "64f8d..."
}
```

**Response (201):**
```json
{
  "message": "Rating submitted successfully",
  "rating": {
    "_id": "64f8k...",
    "overallRating": 4.7,
    "createdAt": "2025-01-15T16:00:00.000Z"
  }
}
```

---

## 🧪 **Testing**

### **API Testing with cURL**

```bash
# Register a new user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Login and get token
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Get listings (with authentication)
curl -X GET "http://localhost:5000/api/listings?brand=Apple&side=left" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a listing
curl -X POST http://localhost:5000/api/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Apple",
    "model": "AirPods Pro",
    "side": "left",
    "condition": "good",
    "price": 80,
    "description": "Lost my left AirPod Pro",
    "location": {
      "address": "San Francisco, CA",
      "coordinates": [-122.4194, 37.7749]
    }
  }'
```

### **Testing with Postman**

Import this collection for comprehensive API testing:

```json
{
  "info": {
    "name": "SecondMarket API",
    "description": "Complete API collection for testing SecondMarket platform"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": "{{auth_token}}"
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/users/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPassword123!\"\n}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🚀 **Deployment**

### **Production Environment Variables**

```env
NODE_ENV=production
PORT=443
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/SecondMarket
JWT_SECRET=super_secure_production_jwt_secret
CLIENT_URL=https://SecondMarket.com
```

### **Docker Deployment**

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### **Build Commands**

```bash
# Frontend build
cd client
npm run build

# Backend production start
cd server
npm start
```

---

## 🔧 **Development Guidelines**

### **Code Structure**
```
server/src/
├── controllers/          # Business logic
├── models/              # Database schemas
├── routes/              # API endpoints
├── middleware/          # Custom middleware
├── utils/               # Helper functions
└── services/            # External service integrations

client/src/
├── components/          # Reusable UI components
│   ├── modern/         # Glass morphism components
│   └── listings/       # Listing-specific components
├── pages/              # Route components
├── services/           # API service layers
├── store/              # Redux store and slices
└── theme.js            # Material-UI theme configuration
```

### **Coding Standards**
- **ESLint + Prettier** for code formatting
- **Conventional Commits** for git messages
- **JSDoc** comments for complex functions
- **TypeScript** migration recommended for large teams

### **Git Workflow**
```bash
# Feature development
git checkout -b feature/smart-matching-v2
git commit -m "feat: add advanced matching algorithm"
git push origin feature/smart-matching-v2

# Bug fixes
git checkout -b fix/authentication-issue
git commit -m "fix: resolve JWT token expiration handling"
```

---

## 🤝 **Contributing**

### **How to Contribute**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Setup**
```bash
# Install dependencies
npm run install:all

# Run development servers
npm run dev

# Run tests
npm run test

# Check code quality
npm run lint
```

### **Issue Reporting**
When reporting bugs, please include:
- **Environment** details (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected vs actual** behavior
- **Screenshots** if applicable
- **Console errors** and logs

---

## 📈 **Performance & Monitoring**

### **Key Metrics**
- **API Response Time**: < 200ms average
- **Database Query Performance**: Optimized with proper indexing
- **Frontend Bundle Size**: < 500KB gzipped
- **Mobile Performance**: Lighthouse score > 90

### **Monitoring Tools**
- **Winston** for server logging
- **MongoDB Compass** for database monitoring
- **Chrome DevTools** for frontend performance
- **Postman** for API testing

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Database Connection Errors**
```bash
# Check MongoDB status
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community

# Check connection string
mongo "mongodb://localhost:27017/SecondMarket"
```

#### **Authentication Issues**
```bash
# Verify JWT secret length (minimum 64 characters)
node -e "console.log(process.env.JWT_SECRET.length)"

# Test token validation
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/users/profile
```

#### **File Upload Problems**
```bash
# Verify Cloudinary credentials
curl -X POST \
  "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload" \
  -F "upload_preset=YOUR_PRESET" \
  -F "file=@test-image.jpg"
```

#### **Socket.io Connection Issues**
```javascript
// Client-side debugging
const socket = io('http://localhost:5000', {
  forceNew: true,
  transports: ['websocket']
});

socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
```

### **Performance Optimization**

#### **Database Optimization**
```javascript
// Add compound indexes for common queries
db.earbudlistings.createIndex({ 
  "brand": 1, 
  "model": 1, 
  "side": 1, 
  "status": 1 
});

// Geospatial index for location queries
db.earbudlistings.createIndex({ "location.coordinates": "2dsphere" });
```

#### **Frontend Optimization**
```javascript
// Lazy load components
const LazyListings = React.lazy(() => import('./pages/Listings'));

// Optimize images
<img 
  src={`${imageUrl}?w=400&h=300&c_fit`} 
  loading="lazy"
  alt="Earbud"
/>
```

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Material-UI** for the component library
- **MongoDB** for the database solution
- **Cloudinary** for image management
- **Socket.io** for real-time communication
- **React** community for continuous innovation

---

## 📞 **Support & Contact**

- **Issues**: [GitHub Issues](https://github.com/yourusername/SecondMarket/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/SecondMarket/discussions)
- **Email**: support@SecondMarket.com
- **Documentation**: [Wiki](https://github.com/yourusername/SecondMarket/wiki)

---

**Built with ❤️ for the community of earbud users worldwide**

*Last updated: January 2025*
