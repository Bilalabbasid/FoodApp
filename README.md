# Production-Grade Restaurant Ordering Platform

A modern, full-stack restaurant ordering platform built with React, Node.js, and MongoDB. Features real-time order tracking, comprehensive admin dashboard, and beautiful user experience.

## 🚀 Features

### Customer Experience
- **Modern Menu Browsing**: Category-based navigation with search and dietary filters
- **Interactive Product Customization**: Variants, add-ons, and real-time pricing
- **Smart Cart Management**: Delivery zones, fees, taxes, and tip calculations
- **Seamless Checkout**: Guest/user options with Stripe payment integration
- **Real-time Order Tracking**: Live status updates with Socket.IO
- **Account Management**: Profile, addresses, order history, and loyalty points

### Admin & Staff Tools
- **Comprehensive Dashboard**: Analytics, KPIs, and performance metrics
- **Catalog Management**: Categories, items, variants, pricing, and availability
- **Order Management**: Real-time order queue with status updates
- **Kitchen Display System**: Color-coded order workflow for kitchen staff
- **Customer Management**: User profiles, order history, and loyalty tracking

### Technical Excellence
- **Modern Stack**: React 18, TypeScript, Node.js, MongoDB, Redis
- **Real-time Updates**: Socket.IO for live order tracking and notifications
- **Secure Authentication**: JWT with HTTP-only cookies and role-based access
- **Payment Processing**: Stripe integration with test mode
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Production Ready**: Error handling, validation, rate limiting, and security

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Zustand** for state management
- **React Query** for server state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** with Zod validation
- **Stripe Elements** for payments

### Backend
- **Node.js 20** with TypeScript
- **Express.js** web framework
- **MongoDB** with Mongoose ODM
- **Redis** for caching and sessions
- **Socket.IO** for real-time communication
- **JWT** authentication with refresh tokens
- **Stripe** payment processing
- **Express Rate Limit** for API protection
- **Helmet** for security headers

## 📦 Installation

### Prerequisites
- Node.js 20+
- MongoDB (local or cloud)
- Redis (local or cloud)
- Stripe account (for payments)

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd restaurant-ordering-platform
   npm run setup
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB and Redis locally, or use cloud services
   npm run seed  # Populate with demo data
   ```

4. **Start Development**
   ```bash
   npm start  # Starts both frontend and backend
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 🔧 Configuration

### Environment Variables

```env
# Application
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/restaurant-orders
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe (Test Keys)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Brand Configuration
BRAND_NAME=TastyCrave
BRAND_CITY=New York
BRAND_COUNTRY=USA
BRAND_EMAIL=orders@tastycrave.com
BRAND_PHONE=+1-555-123-4567
```

## 🎯 Demo Accounts

After running the seed script:

- **Admin**: admin@tastycrave.com / Passw0rd!
- **Customer**: customer@example.com / password123
- **Store**: downtown (slug for API calls)
- **Coupons**: WELCOME10, FREESHIP

## 📱 Usage

### Customer Flow
1. Browse menu by categories or search
2. Customize items with variants and add-ons
3. Add items to cart with real-time pricing
4. Choose delivery/pickup and apply coupons
5. Checkout with Stripe (guest or registered user)
6. Track order status in real-time

### Admin Flow
1. Login to admin dashboard
2. View analytics and performance metrics
3. Manage menu items and categories
4. Process orders through kitchen display
5. Handle customer inquiries and refunds

### Kitchen Staff Flow
1. Access Kitchen Display System (KDS)
2. View incoming orders by priority
3. Update order status as items are prepared
4. Mark orders ready for pickup/delivery

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── utils/              # Utility functions and API client
└── types/              # TypeScript type definitions
```

### Backend Structure
```
server/src/
├── models/             # Mongoose schemas
├── routes/             # Express route handlers
├── middleware/         # Custom middleware
├── utils/              # Utility functions
├── config/             # Configuration files
└── scripts/            # Database seeding and utilities
```

## 🔒 Security Features

- **Authentication**: JWT with HTTP-only cookies
- **Authorization**: Role-based access control
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Zod schema validation
- **Security Headers**: Helmet.js implementation
- **CORS**: Configured for production
- **Password Hashing**: bcrypt with salt rounds
- **SQL Injection**: MongoDB parameterized queries

## 🚀 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Configure MongoDB Atlas
- [ ] Set up Redis Cloud
- [ ] Configure Stripe live keys
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📊 API Documentation

The API follows RESTful conventions with the following endpoints:

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Menu & Catalog
- `GET /api/v1/stores` - List all stores
- `GET /api/v1/stores/:slug` - Get store details
- `GET /api/v1/stores/:slug/menu` - Get store menu
- `GET /api/v1/stores/:slug/items/:slug` - Get item details

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders/:orderNo` - Get order details
- `GET /api/v1/orders/user/history` - Get user order history

### Cart & Pricing
- `POST /api/v1/cart/price` - Calculate cart pricing

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server && npm test

# Run E2E tests
npm run test:e2e
```

## 📈 Performance

- **Frontend**: Code splitting, lazy loading, image optimization
- **Backend**: Redis caching, database indexing, connection pooling
- **Real-time**: Efficient Socket.IO room management
- **API**: Response compression, rate limiting, pagination

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the demo data and examples

---

Built with ❤️ using modern web technologies for production-grade restaurant ordering.