# Quick Start Guide - B2B Features

## 🚀 Get Started in 5 Minutes

This guide helps new developers quickly understand and run the B2B features.

## Prerequisites

- Node.js 16+ installed
- MongoDB running locally or connection to MongoDB Atlas
- Git installed

## 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd SecondMarket-main

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

## 2. Environment Setup

### Backend Environment (`server/.env`)
```bash
# Copy sample environment file
cp .env.sample .env

# Required variables:
MONGODB_URI=mongodb://localhost:27017/budmatching
JWT_SECRET=your-secret-key-here
PORT=5000

# Optional (for full functionality):
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Frontend Environment (`client/.env`)
```bash
# Copy sample environment file
cp .env.example .env

# Set API URL (usually default is fine)
VITE_API_URL=http://localhost:5000
```

## 3. Start Development Servers

```bash
# Terminal 1 - Start Backend (from /server)
cd server
npm run dev
# Backend runs on http://localhost:5000

# Terminal 2 - Start Frontend (from /client)
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

## 4. Test B2B Features

### Create a Business Account

1. **Register User**: Go to `http://localhost:5173/register`
   - Create a regular user account first

2. **Switch to Business**: After login, the user needs to be converted to business type
   - Currently manual process - will be added to UI later

3. **Create Company Profile**: Use the API or wait for UI integration

### API Testing with curl

```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "password123"
  }'

# 2. Login to get token
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# 3. Create company profile (use token from login)
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
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
      "phone": "+91 9876543210"
    }
  }'
```

## 5. Key Files to Understand

### Backend Structure
```
server/src/
├── models/Company.js           # Company data model
├── controllers/companyController.js  # Business logic
├── routes/companyRoutes.js     # API endpoints
└── services/                   # External services
    ├── analyticsService.js
    ├── emailService.js
    └── searchService.js
```

### Frontend Structure
```
client/src/
├── components/business/        # B2B UI components
│   └── BusinessRegistrationForm.jsx
├── services/companyService.js  # API calls
└── pages/                      # Main pages (to be enhanced)
```

## 6. Database Collections

After running, you'll see these new collections:

```javascript
// companies collection
{
  "_id": ObjectId,
  "user": ObjectId,              // References users._id
  "companyName": "TechCorp Electronics",
  "businessType": "manufacturer",
  "categories": ["Consumer Electronics"],
  "verificationStatus": "pending",
  "businessAddress": { /* ... */ },
  "contactInfo": { /* ... */ },
  "metrics": { /* performance data */ },
  "createdAt": Date,
  "updatedAt": Date
}

// users collection (enhanced)
{
  "_id": ObjectId,
  "accountType": "business",     // NEW FIELD
  "email": "john@example.com",
  // ... existing fields unchanged
}
```

## 7. Test the Features

### Company Registration Flow
1. User registers → Individual account created
2. User creates company profile → Business account activated
3. Upload documents → Verification process starts
4. Admin verifies → Company goes live

### Search & Discovery
```bash
# Search companies
curl "http://localhost:5000/api/companies/search?q=electronics&category=Consumer%20Electronics"

# Get companies by category
curl "http://localhost:5000/api/companies/category/Consumer%20Electronics"
```

## 8. What's Working Now

✅ **User Registration**: Individual → Business account conversion  
✅ **Company Profiles**: Complete business information management  
✅ **Document Upload**: GST, PAN, Trade License support  
✅ **Search & Filter**: Find companies by category, location, type  
✅ **Verification System**: Admin approval workflow  
✅ **Analytics Foundation**: Performance tracking setup  
✅ **Lead Credits System**: Credit-based inquiry system  

## 9. Common Issues & Solutions

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Compass/Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/budmatching
```

### Port Already in Use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in server/.env
PORT=5001
```

### Frontend Build Issues
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

## 10. Next Steps for Development

### Week 2: Product Catalogs
- Enhance ProductListing model with B2B fields (MOQ, bulk pricing)
- Create ProductCatalog model for multi-product management
- Add electronics-specific technical specifications

### Week 3: RFQ System  
- Request for Quote (RFQ) functionality
- Lead generation and routing
- Quote management dashboard

### Week 4: Polish
- Complete verification workflows
- Advanced analytics dashboards
- Mobile optimization

## 11. Useful Commands

```bash
# Reset database (careful!)
mongo budmatching --eval "db.dropDatabase()"

# View companies in database
mongo budmatching --eval "db.companies.find().pretty()"

# Check server logs
cd server && npm run dev

# Build for production
cd client && npm run build
```

## 12. Getting Help

- 📖 **Full Documentation**: See `docs/B2B_TRANSFORMATION_GUIDE.md`
- 🐛 **Issues**: Check console logs and network tab
- 💬 **Questions**: Review the API documentation section

---

**You're now ready to develop B2B features! 🎉**

The foundation is solid - company profiles, verification, search, and analytics are all working. Focus on building the RFQ system and product catalogs next.
