# Company API Reference

## Base URL
```
Development: http://localhost:5000/api/companies
Production: https://your-domain.com/api/companies
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Create Company Profile
Create a new company profile for a business user.

**Endpoint:** `POST /api/companies`  
**Auth:** Required  
**Permission:** Business account only

#### Request Body
```json
{
  "companyName": "TechCorp Electronics",
  "description": "Leading manufacturer of consumer electronics",
  "businessType": "manufacturer",
  "categories": ["Consumer Electronics", "Home Appliances"],
  "subcategories": ["Mobile Accessories", "Kitchen Appliances"],
  "yearEstablished": 2010,
  "employeeCount": "51-200",
  "annualTurnover": "5-25 Crore",
  "businessAddress": {
    "address": "123 Tech Street, Electronic City",
    "city": "Mumbai",
    "state": "Maharashtra", 
    "pincode": "400001",
    "country": "India"
  },
  "contactInfo": {
    "phone": "+91 9876543210",
    "alternatePhone": "+91 9876543211",
    "email": "contact@techcorp.com",
    "website": "https://www.techcorp.com"
  },
  "gstNumber": "27AAAAA0000A1Z5",
  "certifications": [
    {
      "name": "ISO 9001:2015",
      "issuedBy": "Bureau Veritas",
      "certificateNumber": "IN-COC-000000",
      "validUntil": "2025-12-31"
    }
  ]
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Company profile created successfully",
  "company": {
    "_id": "64f7b1c2e4b0a1234567890",
    "user": "64f7b1c2e4b0a1234567889",
    "companyName": "TechCorp Electronics",
    "businessType": "manufacturer",
    "categories": ["Consumer Electronics"],
    "verificationStatus": "pending",
    "leadCredits": 0,
    "subscriptionTier": "free",
    "metrics": {
      "profileViews": 0,
      "totalInquiries": 0,
      "rating": 0
    },
    "createdAt": "2023-10-05T12:00:00.000Z",
    "updatedAt": "2023-10-05T12:00:00.000Z"
  }
}
```

#### Error Responses
- `400` - Validation errors or company already exists
- `401` - Authentication required
- `403` - Not a business account

---

### 2. Get Company Profile
Retrieve a company's public profile information.

**Endpoint:** `GET /api/companies/:id`  
**Auth:** Optional (public endpoint)

#### Response (200 OK)
```json
{
  "success": true,
  "company": {
    "_id": "64f7b1c2e4b0a1234567890",
    "companyName": "TechCorp Electronics",
    "description": "Leading manufacturer...",
    "businessType": "manufacturer",
    "categories": ["Consumer Electronics"],
    "yearEstablished": 2010,
    "businessAddress": {
      "city": "Mumbai",
      "state": "Maharashtra"
    },
    "contactInfo": {
      "phone": "+91 9876543210",
      "website": "https://www.techcorp.com"
    },
    "verificationStatus": "verified",
    "metrics": {
      "profileViews": 1250,
      "rating": 4.5,
      "reviewCount": 23
    },
    "user": {
      "name": "John Doe",
      "trustScore": 85
    },
    "productCount": 45,
    "catalogCount": 3
  }
}
```

---

### 3. Get My Company Profile
Get the authenticated user's company profile with private information.

**Endpoint:** `GET /api/companies/me/profile`  
**Auth:** Required

#### Response (200 OK)
```json
{
  "success": true,
  "company": {
    "_id": "64f7b1c2e4b0a1234567890",
    "companyName": "TechCorp Electronics",
    "leadCredits": 45,
    "subscriptionTier": "growth",
    "documents": [
      {
        "type": "gst",
        "verified": true,
        "uploadedAt": "2023-10-01T10:00:00.000Z"
      }
    ],
    "onboardingCompleted": true,
    "onboardingStep": 4
  }
}
```

---

### 4. Update Company Profile
Update company information.

**Endpoint:** `PUT /api/companies/me/profile`  
**Auth:** Required

#### Request Body (Partial Update)
```json
{
  "description": "Updated company description",
  "contactInfo": {
    "website": "https://www.newtechcorp.com"
  },
  "categories": ["Consumer Electronics", "Industrial Equipment"]
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Company profile updated successfully",
  "company": {
    // Updated company object
  }
}
```

---

### 5. Search Companies
Search and filter companies with various criteria.

**Endpoint:** `GET /api/companies/search`  
**Auth:** Optional

#### Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query | `electronics` |
| `category` | string | Filter by category | `Consumer Electronics` |
| `businessType` | string | Filter by business type | `manufacturer` |
| `city` | string | Filter by city | `Mumbai` |
| `state` | string | Filter by state | `Maharashtra` |
| `verificationStatus` | string | Filter by verification | `verified` |
| `sortBy` | string | Sort results | `rating`, `newest`, `popular` |
| `page` | number | Page number | `1` |
| `limit` | number | Results per page | `20` |

#### Example Request
```
GET /api/companies/search?q=electronics&category=Consumer%20Electronics&city=Mumbai&sortBy=rating&page=1&limit=10
```

#### Response (200 OK)
```json
{
  "success": true,
  "companies": [
    {
      "_id": "64f7b1c2e4b0a1234567890",
      "companyName": "TechCorp Electronics",
      "businessType": "manufacturer",
      "categories": ["Consumer Electronics"],
      "businessAddress": {
        "city": "Mumbai",
        "state": "Maharashtra"
      },
      "metrics": {
        "rating": 4.5,
        "reviewCount": 23
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 6. Get Companies by Category
Get companies in a specific category.

**Endpoint:** `GET /api/companies/category/:category`  
**Auth:** Optional

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `limit` | number | Number of results | `10` |
| `featured` | boolean | Show only featured | `false` |

#### Example Request
```
GET /api/companies/category/Consumer%20Electronics?limit=5&featured=true
```

#### Response (200 OK)
```json
{
  "success": true,
  "companies": [
    // Array of company objects
  ],
  "category": "Consumer Electronics"
}
```

---

### 7. Upload Company Image
Upload company logo or banner image.

**Endpoint:** `POST /api/companies/me/upload/:type`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

#### Parameters
- `type` - Image type: `logo` or `banner`

#### Request Body
```
FormData with 'image' field containing the file
```

#### File Requirements
- **Formats:** JPG, PNG, GIF, WebP
- **Size:** Maximum 5MB
- **Logo:** Recommended 200x200px
- **Banner:** Recommended 800x300px

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Company logo uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/company/image/upload/v123456789/companies/64f7b1c2e4b0a1234567890/logo.jpg"
}
```

---

### 8. Upload Company Document
Upload business verification documents.

**Endpoint:** `POST /api/companies/me/documents`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

#### Request Body
```
FormData:
- document: File
- type: Document type
- documentNumber: Document identifier (optional)
```

#### Document Types
- `gst` - GST Certificate
- `pan` - PAN Card
- `trade_license` - Trade License
- `incorporation_certificate` - Certificate of Incorporation
- `msme` - MSME Certificate
- `iso_certificate` - ISO Certification

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "type": "gst",
    "url": "https://res.cloudinary.com/...",
    "documentNumber": "27AAAAA0000A1Z5",
    "verified": false,
    "uploadedAt": "2023-10-05T12:00:00.000Z"
  }
}
```

---

### 9. Add Lead Credits
Purchase lead credits for inquiry access.

**Endpoint:** `POST /api/companies/me/credits`  
**Auth:** Required

#### Request Body
```json
{
  "credits": 50,
  "packageType": "starter"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Lead credits added successfully",
  "leadCredits": 75
}
```

---

### 10. Get Company Analytics
Retrieve company performance analytics.

**Endpoint:** `GET /api/companies/me/analytics`  
**Auth:** Required

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `timeframe` | string | Time period | `30d` |

#### Timeframe Options
- `1d` - Last 24 hours
- `7d` - Last 7 days
- `30d` - Last 30 days
- `90d` - Last 90 days
- `1y` - Last 365 days

#### Response (200 OK)
```json
{
  "success": true,
  "analytics": {
    "profileViews": 1250,
    "inquiries": 45,
    "conversionRate": 12.5,
    "timeline": [
      {
        "date": "2023-10-01",
        "views": 45,
        "inquiries": 3
      }
    ],
    "currentMetrics": {
      "profileViews": 1250,
      "totalInquiries": 45,
      "rating": 4.5,
      "responseRate": 85
    },
    "leadCredits": 25,
    "subscriptionTier": "growth"
  }
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "companyName",
      "message": "Company name is required"
    },
    {
      "field": "gstNumber",
      "message": "Invalid GST number format"
    }
  ]
}
```

---

## Rate Limiting

API requests are limited to prevent abuse:
- **Public endpoints:** 100 requests per hour per IP
- **Authenticated endpoints:** 1000 requests per hour per user
- **File uploads:** 10 uploads per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1601234567
```

---

## SDKs and Libraries

### JavaScript/Node.js
```javascript
import { CompanyService } from './services/companyService';

const companyService = new CompanyService({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

// Create company
const company = await companyService.createCompany({
  companyName: "TechCorp",
  businessType: "manufacturer"
});

// Search companies
const results = await companyService.search({
  q: "electronics",
  category: "Consumer Electronics"
});
```

### cURL Examples
```bash
# Search companies
curl "http://localhost:5000/api/companies/search?q=electronics&category=Consumer%20Electronics"

# Create company (with auth)
curl -X POST http://localhost:5000/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"TechCorp","businessType":"manufacturer"}'

# Upload logo
curl -X POST http://localhost:5000/api/companies/me/upload/logo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@logo.png"
```

---

## Webhooks (Future Feature)

Company events will support webhooks:
- `company.created` - New company registered
- `company.verified` - Company verification completed
- `company.document.uploaded` - New document uploaded

Webhook payload example:
```json
{
  "event": "company.verified",
  "data": {
    "companyId": "64f7b1c2e4b0a1234567890",
    "companyName": "TechCorp Electronics",
    "verifiedAt": "2023-10-05T12:00:00.000Z"
  },
  "timestamp": "2023-10-05T12:00:00.000Z"
}
```

---

*This API reference is maintained alongside the codebase. Report issues or suggest improvements through the development team.*
