# Complete Setup Guide - RentYourNeeds

## 🗄️ Database Setup

### 1. Create MySQL Database
```bash
mysql -u root -p
```

```sql
CREATE DATABASE rentyourneeds;
USE rentyourneeds;

-- Run the schema
SOURCE /path/to/rent-backend/src/database/schema.sql;
```

### 2. Create Orders Table
```sql
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  items JSON NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  subscription_type ENUM('one-time', 'recurring') NOT NULL,
  tenure_months INT,
  status ENUM('pending', 'confirmed', 'processing', 'delivered', 'active', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_intent_id VARCHAR(255),
  subscription_id VARCHAR(255),
  delivery_address JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

## 💳 Stripe Setup

### 1. Create Stripe Account
- Go to https://stripe.com
- Sign up for an account
- Get your API keys from Dashboard

### 2. Configure Webhook
- Go to Developers > Webhooks
- Add endpoint: `http://your-domain:8000/api/orders/webhook`
- Select events:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `customer.subscription.deleted`
- Copy webhook secret

### 3. Test Mode Keys
Use test mode keys for development:
- Publishable key: `pk_test_...`
- Secret key: `sk_test_...`

## 🔧 Backend Configuration

### 1. Install Dependencies
```bash
cd rent-backend
npm install
```

### 2. Create .env File
```bash
cp .env.example .env
```

### 3. Update .env
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rentyourneeds
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=8000
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_SUCCESS_URL=http://localhost:3000/checkout/success
STRIPE_CANCEL_URL=http://localhost:3000/checkout/cancel

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Start Backend
```bash
npm run dev
```

## 🎨 Frontend Configuration

### 1. Customer Portal (rent-front)
```bash
cd rent-front
npm install
cp .env.example .env.local
```

Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

Start:
```bash
npm run dev
```

### 2. Admin Portal (rent-admin)
```bash
cd rent-admin
npm install
cp .env.example .env.local
```

Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start:
```bash
npm run dev
```

## 🧪 Testing Payment Flow

### 1. Test Cards (Stripe Test Mode)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### 2. Test Flow
1. Add products to cart on customer portal
2. Go to checkout
3. Fill delivery address
4. Choose subscription type
5. Click "Proceed to Payment"
6. Use test card on Stripe page
7. Complete payment
8. Check order in admin portal

## 📊 Features

### Customer Portal
- ✅ Browse products with Indian Rupee (₹)
- ✅ Add to cart with tenure selection
- ✅ Checkout with Stripe
- ✅ One-time or recurring payments
- ✅ Order confirmation

### Admin Portal
- ✅ Real-time order updates (auto-refresh 10s)
- ✅ Order management
- ✅ Status updates
- ✅ Customer details
- ✅ Revenue tracking
- ✅ Payment status

### Payment Features
- ✅ Stripe integration
- ✅ Recurring subscriptions
- ✅ Auto-pay monthly
- ✅ Webhook handling
- ✅ Email notifications
- ✅ Indian currency (₹)
- ✅ 18% GST calculation

## 🔐 Admin Credentials
```
Email: admin@rentyourneeds.com
Password: admin123
```

## 🚀 Production Deployment

### Backend
1. Update Stripe webhook URL to production domain
2. Use live Stripe keys
3. Set NODE_ENV=production
4. Deploy to Railway/Render

### Frontend
1. Update NEXT_PUBLIC_API_URL to production
2. Use live Stripe publishable key
3. Deploy to Vercel

## 📝 API Endpoints

### Orders
- `POST /api/orders/checkout` - Create checkout session
- `POST /api/orders/webhook` - Stripe webhook
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update status (admin)
- `POST /api/orders/:id/cancel` - Cancel subscription
- `GET /api/orders/admin/stats` - Order statistics (admin)

## 🐛 Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify credentials in .env
- Ensure database exists

### Stripe Webhook Not Working
- Use ngrok for local testing: `ngrok http 8000`
- Update webhook URL in Stripe dashboard
- Verify webhook secret

### Orders Not Showing
- Check database connection
- Verify orders table exists
- Check browser console for errors

---

**Support**: For issues, check logs in terminal or browser console.