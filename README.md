# URL Shortener - MERN App with Advanced Features

A **full-stack URL shortening application** built with React, Express, Node.js, and MongoDB. Shorten long URLs, track detailed analytics, manage collections, and more!

## 🚀 Features

### Core Features
✅ **Shorten URLs** - Convert long URLs to short, memorable codes  
✅ **Custom Codes** - Create custom short codes for your URLs  
✅ **QR Codes** - Auto-generate and download QR codes for each shortened URL  

### Authentication & User System
✅ **User Accounts** - Sign up, login, personal dashboard  
✅ **Protected URLs** - Password-protect sensitive links  
✅ **User Statistics** - Track total URLs created and total clicks  

### Analytics & Tracking
✅ **Click Tracking** - Real-time click count updates  
✅ **Detailed Analytics** - Device, browser, OS, country/city, referrer tracking  
✅ **Analytics Dashboard** - View all your URLs with comprehensive stats  
✅ **Search & Filter** - Find URLs by code, tag, or collection  
✅ **Export to CSV** - Download analytics as spreadsheet  

### URL Management  
✅ **Tags/Categories** - Organize URLs with tags  
✅ **Collections** - Group related URLs together  
✅ **Descriptions** - Add notes to your shortened URLs  
✅ **URL Expiry** - Set expiration dates with auto-cleanup  
✅ **Rate Limiting** - Prevent abuse with rate limits  

### UI/UX
✅ **Dark Mode** - Toggle between light and dark themes  
✅ **Responsive Design** - Mobile-friendly interface  
✅ **Advanced Options** - Collapsible form for extra settings  
✅ **Real-time Updates** - Instant feedback on all actions  

## 📊 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React 18, Axios, React Router
- **Analytics**: UA Parser (device detection), Geoip-lite (geolocation)
- **QR Codes**: QRCode library
- **Rate Limiting**: express-rate-limit
- **Security**: bcryptjs, JWT

## 🏗️ Project Structure

```
URL shortener/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema with auth
│   │   ├── Url.js            # Enhanced URL schema
│   │   └── Click.js          # Click tracking schema
│   ├── controllers/
│   │   ├── authController.js # Auth logic
│   │   ├── urlController.js  # URL CRUD + export
│   │   └── redirectController.js # Click tracking
│   ├── routes/
│   │   ├── authRoutes.js     # Auth endpoints
│   │   ├── urlRoutes.js      # URL endpoints
│   │   └── redirectRoutes.js # Redirect endpoint
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   └── rateLimiter.js    # Rate limiting
│   ├── utils/
│   │   ├── qrCodeGenerator.js # QR generation
│   │   └── analytics.js      # Client info extraction
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── UrlShortener.js/css      # Main shortener
    │   │   ├── Analytics.js/css         # Analytics dashboard
    │   │   └── Settings.js/css          # User settings
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js              # Main user hub
    │   │   └── Auth.css
    │   ├── context/
    │   │   └── AuthContext.js            # Auth state management
    │   ├── App.js/css
    │   └── index.js/css
    └── package.json
```

## 🔧 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create `.env` file**:
```bash
cp .env.example .env
```

4. **Update `.env` with your settings**:
```
MONGODB_URI=mongodb://localhost:27017/url-shortener
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
JWT_SECRET=your_secret_key_here_change_this
JWT_EXPIRE=7d
MAX_REQUESTS_PER_HOUR=100
```

5. **Start the server**:
```bash
npm run dev
```
Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start React app**:
```bash
npm start
```
Frontend runs on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/update` - Update user settings (protected)

### URL Management
- `POST /api/urls/shorten` - Create shortened URL
- `POST /api/urls/analytics/:shortCode` - Get URL analytics
- `GET /api/urls/user/urls` - Get user's URLs (protected)
- `PUT /api/urls/:shortCode` - Update URL (protected)
- `DELETE /api/urls/:shortCode` - Delete URL (protected)
- `GET /api/urls/user/export` - Export URLs as CSV (protected)

### Redirect
- `GET /:shortCode` - Redirect to original URL & track click

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs for password security
- **URL Password Protection** - Optional password for sensitive links
- **Rate Limiting** - Prevent brute force and abuse
- **CORS Enabled** - Safe cross-origin requests
- **Input Validation** - All inputs validated on backend

## 📊 How Analytics Works

1. User visits shortened URL: `http://localhost:5000/abc123`
2. Backend extracts client info:
   - IP address → Country/City via Geoip
   - User Agent → Device/Browser/OS via UA Parser
   - Referrer from HTTP headers
3. Creates Click record in MongoDB with all details
4. Increments URL click count
5. Updates user total click stats
6. Redirects to original URL

## 🎯 Advanced Features Included

### Password Protection
Users can password-protect URLs. Password required to view analytics or redirect (POST request with password).

### URL Expiry
Set expiration date. MongoDB TTL index automatically deletes expired URLs after 24 hours.

### Tags & Collections
Organize URLs with tags and group them in collections. Filter by tag in analytics.

### Geolocation Tracking
Track which countries/cities your links are accessed from.

### Device Detection
See breakdown of device types (mobile/desktop), browsers, and operating systems.

### Export Functionality
Download all your URLs and analytics as CSV file for external analysis.

### Rate Limiting
- 100 requests/15 min - General rate limit
- 5 requests/15 min - Auth endpoints
- 50 URLs/hour - URL creation limit

## 🌙 Dark Mode

Settings page allows users to toggle between light and dark themes. Preference saved to localStorage.

## 📱 Responsive Design

Mobile-optimized interface works seamlessly on:
- Desktop browsers
- Tablets
- Mobile phones

## 🚀 Deployment

### Deploy Backend (Heroku/Railway)
```bash
npm install -g heroku
heroku create your-app-name
git push heroku main
```

Set environment variables on hosting platform.

### Deploy Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the build folder to Vercel/Netlify
```

Update API base URL in code for production.

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI          - MongoDB connection string
PORT                 - Server port (default: 5000)
NODE_ENV            - development/production
BASE_URL            - URL for QR codes and redirects
JWT_SECRET          - Secret key for JWT tokens
JWT_EXPIRE          - Token expiry duration
MAX_REQUESTS_PER_HOUR - Rate limit (default: 100)
```

## 🔄 Database Schemas

### User
```javascript
{
  email, password, username, fullName,
  theme, totalUrls, totalClicks,
  createdAt, updatedAt
}
```

### URL
```javascript
{
  user, originalUrl, shortCode, password, tags,
  collection, description, clicks, clickDetails[],
  expiresAt, isActive, isPublic, createdAt, updatedAt
}
```

### Click
```javascript
{
  url, timestamp, referrer, userAgent, ip,
  country, city, device, browser, os
}
```

## 🐛 Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas

**QR Code Not Generating**
- Check `qrcode` package is installed
- Verify `BASE_URL` in `.env` is correct

**CORS Errors**
- Verify `proxy` setting in frontend `package.json`
- Check backend CORS configuration

## 📚 Learning Resources

This project demonstrates:
- MERN stack architecture
- RESTful API design
- JWT authentication
- MongoDB indexing & aggregation
- Asynchronous operations
- Rate limiting & security
- Analytics tracking
- QR code generation

Perfect for **interview preparation** and **portfolio building**! 🎯

## 📜 License

MIT

## 💡 Future Enhancements

- [ ] Custom domain support
- [ ] QR code customization (colors, logo)
- [ ] Advanced analytics (trends, graphs)
- [ ] Browser extension
- [ ] Mobile app
- [ ] Webhook notifications
- [ ] API key management
- [ ] Team collaboration
- [ ] Advanced search filters
- [ ] URL preview functionality
