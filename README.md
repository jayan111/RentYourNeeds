# RentYourNeeds - Premium Rental Marketplace

A full-stack eCommerce rental platform with subscription-based rentals, built with Next.js, Node.js, and modern technologies.

## 🚀 Project Structure

```
RentYourNeeds/
├── rent-front/          # Customer-facing Next.js frontend
├── rent-admin/          # Admin dashboard Next.js application
├── rent-backend/        # Node.js + Express backend API
└── README.md
```

## 📦 Projects

### 1. **rent-backend** - Backend API Server
- **Tech Stack**: Node.js, Express, TypeScript, MySQL
- **Features**:
  - RESTful API with TypeScript
  - JWT authentication
  - Redis caching for performance
  - Bull queue for background jobs
  - Rate limiting with Redis
  - Product & inventory management
  - Subscription management
  - Admin analytics

### 2. **rent-front** - Customer Frontend
- **Tech Stack**: Next.js 14, React, TypeScript, Tailwind CSS
- **Features**:
  - Server-side rendering
  - Product browsing & search
  - Subscription tenure selector (3, 6, 12 months)
  - Shopping cart with Redux
  - User authentication
  - Responsive design

### 3. **rent-admin** - Admin Dashboard
- **Tech Stack**: Next.js 14, React, TypeScript, Tailwind CSS
- **Features**:
  - Product CRUD operations
  - Inventory management
  - Dashboard analytics
  - User management
  - Real-time statistics
  - Status tracking (available, rented, maintenance, retired)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Redis (optional, for caching)
- npm or yarn

### Backend Setup

```bash
cd rent-backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

**Environment Variables:**
```env
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rentyourneeds
JWT_SECRET=your_jwt_secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend Setup

```bash
cd rent-front
npm install
cp .env.example .env.local
# Update .env.local with API URL
npm run dev
```

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Admin Setup

```bash
cd rent-admin
npm install
npm run dev
```

## 🎯 Key Features

### Subscription System
- **Tenure Options**: 3, 6, or 12 months
- **Interactive Slider**: Easy tenure selection
- **Monthly Pricing**: Automatic calculation
- **Flexible Plans**: Multiple subscription tiers

### Admin Features
- **Product Management**: Add, edit, delete products
- **Inventory Tracking**: Real-time status updates
- **Analytics Dashboard**: Revenue, users, inventory metrics
- **Status Management**: Available, rented, maintenance, retired
- **Unified APIs**: Same endpoints as customer side

### Performance Optimization
- **Redis Caching**: Product, inventory, and dashboard caching
- **Queue Processing**: Background jobs with Bull
- **Rate Limiting**: Redis-backed rate limiting
- **Response Caching**: Automatic cache invalidation
- **Compression**: Gzip compression enabled

## 📊 API Endpoints

### Products
- `GET /api/products` - List all products (cached)
- `GET /api/products/:id` - Get product details (cached)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Inventory
- `GET /api/inventory` - List inventory (cached)
- `PATCH /api/inventory/:id` - Update inventory status

### Admin
- `GET /api/admin/stats` - Dashboard statistics (cached)
- `GET /api/admin/analytics/*` - Various analytics

## 🔐 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (Redis-backed)
- JWT authentication
- Input validation
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Backend (Railway/Render)
```bash
cd rent-backend
npm run build
npm start
```

### Frontend (Vercel)
```bash
cd rent-front
npm run build
vercel --prod
```

### Admin (Vercel)
```bash
cd rent-admin
npm run build
vercel --prod
```

## 📝 Product Status Types

- **Available**: Ready for rent
- **Rented**: Currently with customer
- **Maintenance**: Under repair/service
- **Retired**: No longer available

## 🎨 Tech Stack Summary

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Redux Toolkit
- Framer Motion

**Backend:**
- Node.js
- Express
- TypeScript
- MySQL
- Redis
- Bull Queue
- JWT

**DevOps:**
- Git
- Docker (optional)
- Vercel (frontend)
- Railway/Render (backend)

## 📄 License

MIT License

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For support, email support@rentyourneeds.com

---

**Built with ❤️ for the rental marketplace**