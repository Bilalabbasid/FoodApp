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
- **Store Settings**: Complete store configuration with operating hours, payment settings, and general information
- **Role-Based Access**: Admin, manager, staff, kitchen, and rider role management
- **Real-time API Integration**: Seamless communication between frontend and backend

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
   cd server
   npm run seed  # Populate with demo data including users and menu
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Start Backend (from server directory)
   cd server
   npm run dev

   # Terminal 2 - Start Frontend (from root directory)  
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5175 (auto-detects available port)
   - Backend API: http://localhost:3001 (auto-switches to 3002 if busy)
   - Health Check: http://localhost:3001/health
   - Admin Panel: http://localhost:5175/admin
   - Kitchen Display: http://localhost:5175/kds

## 🔧 Configuration

### Environment Variables

```env
# Application
NODE_ENV=development
PORT=3001
PREFERRED_BACKEND_PORT=3001
PREFERRED_FRONTEND_PORT=5173
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/restaurant-orders
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe (Test Keys)
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef
STRIPE_SECRET_KEY=sk_test_51234567890abcdef
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Brand Configuration
BRAND_NAME=TastyCrave
BRAND_CITY=New York
BRAND_COUNTRY=USA
BRAND_TIMEZONE=America/New_York
BRAND_CURRENCY=USD
BRAND_LOCALE=en-US
BRAND_EMAIL=orders@tastycrave.com
BRAND_PHONE=+1-555-123-4567

# Vite Environment Variables (Auto-generated)
VITE_API_URL=http://localhost:3001/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef
```

## 🎯 Demo Accounts

After running the seed script, you can login with these accounts:

### Admin Access
- **Email**: admin@tastycrave.com
- **Password**: Admin123!
- **Access**: Full admin panel, settings, menu management, customer management

### Kitchen Staff
- **Email**: kitchen@tastycrave.com  
- **Password**: Kitchen123!
- **Access**: Kitchen Display System, order management

### Customer Accounts
- **Email**: customer@example.com
- **Password**: Customer123!
- **Email**: jane@example.com  
- **Password**: Jane123!
- **Access**: Customer ordering, account management, order history

### Delivery Rider
- **Email**: rider@tastycrave.com
- **Password**: Rider123!
- **Access**: Order delivery management

### Store & Coupons
- **Store Slug**: downtown (for API calls)
- **Available Coupons**: WELCOME10 (10% off), FREESHIP (free delivery)

### Application URLs
- **Frontend**: http://localhost:5175 (auto-detects available port)
- **Admin Panel**: http://localhost:5175/admin (login required)
- **Kitchen Display**: http://localhost:5175/kds (kitchen staff access)

## 📱 Usage

### Customer Flow
1. Browse menu by categories or search
2. Customize items with variants and add-ons
3. Add items to cart with real-time pricing
4. Choose delivery/pickup and apply coupons
5. Checkout with Stripe (guest or registered user)
6. Track order status in real-time

### Admin Flow
1. Login to admin dashboard at `/admin`
2. **Dashboard**: View analytics and performance metrics
3. **Menu Management**: Add/edit categories and menu items with variants
4. **Orders**: Process orders through real-time order management
5. **Customers**: Manage user accounts and view order history  
6. **Settings**: Configure store hours, payment options, and general information
7. **Kitchen Display**: Monitor kitchen workflow and order status

### Kitchen Staff Flow
1. Access Kitchen Display System (KDS) at `/kds`
2. View incoming orders by priority and preparation time
3. Update order status as items are prepared
4. Mark orders ready for pickup/delivery
5. Real-time synchronization with admin panel

### Store Management
1. **General Settings**: Store name, contact info, address, preparation times
2. **Operating Hours**: Day-by-day schedule with open/closed configuration  
3. **Payment Configuration**: Enable/disable Stripe and cash payments
4. **Delivery Zones**: Configure delivery areas, fees, and minimum orders

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── AdminLayout.tsx     # Admin panel layout wrapper
│   ├── Header.tsx          # Main navigation header
│   ├── CartDrawer.tsx      # Shopping cart sidebar
│   └── ...
├── pages/              # Route components
│   ├── admin/              # Admin panel pages
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminMenu.tsx
│   │   ├── AdminOrders.tsx
│   │   ├── AdminCustomers.tsx
│   │   └── AdminSettings.tsx
│   ├── HomePage.tsx
│   ├── MenuPage.tsx
│   ├── LoginPage.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useCart.ts          # Shopping cart hook
│   └── ...
├── store/              # Zustand state management
│   ├── authStore.ts        # Authentication state
│   ├── cartStore.ts        # Cart state
│   └── ...
├── utils/              # Utility functions and API client
│   └── api.ts              # Centralized API client
└── types/              # TypeScript type definitions
```

### Backend Structure
```
server/src/
├── models/             # Mongoose schemas
│   ├── User.ts             # User accounts and roles
│   ├── Store.ts            # Store configuration
│   ├── Category.ts         # Menu categories
│   ├── Item.ts             # Menu items
│   ├── Order.ts            # Order management
│   └── Coupon.ts           # Discount coupons
├── routes/             # Express route handlers
│   ├── auth.ts             # Authentication endpoints
│   ├── stores.ts           # Store and menu endpoints
│   ├── orders.ts           # Order management
│   ├── admin.ts            # Admin-only endpoints
│   └── ...
├── middleware/         # Custom middleware
│   ├── auth.ts             # JWT authentication
│   ├── rateLimiter.ts      # API rate limiting
│   └── validation.ts       # Request validation
├── scripts/            # Database utilities
│   ├── seed.ts             # Database seeding
│   └── port-check.js       # Port management
└── config/             # Configuration files
    └── database.ts         # MongoDB connection
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

## ✨ Recent Updates

### Version 2.0 Features
- **✅ Complete API Integration**: Fixed all authentication and menu loading issues
- **✅ Enhanced Admin Panel**: Full CRUD operations for menu, customers, and settings
- **✅ Store Settings Management**: Comprehensive configuration for hours, payments, and general info
- **✅ Improved Error Handling**: Better user feedback and system reliability
- **✅ Role-Based Access Control**: Proper permissions for admin, kitchen, customer, and rider roles
- **✅ Real-time Synchronization**: Seamless frontend-backend communication
- **✅ Auto Port Management**: Intelligent port detection and switching
- **✅ Comprehensive Documentation**: Updated README with all new features

### Admin Panel Enhancements
- **Menu Management**: Add/edit categories and items with full variant support
- **Customer Management**: View profiles, order history, and manage accounts
- **Settings Panel**: Configure store hours, payment methods, and contact information
- **Order Processing**: Real-time order management with status updates
- **Dashboard Analytics**: Performance metrics and business insights

---

## 📊 API Documentation

The API follows RESTful conventions with the following endpoints:

### Authentication & Users
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login  
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/users` - List users (admin only)

### Stores & Menu
- `GET /api/v1/stores` - List all stores
- `GET /api/v1/stores/:slug` - Get store by slug
- `GET /api/v1/stores/:id` - Get store by ID
- `PUT /api/v1/stores/:id` - Update store settings (admin only)
- `GET /api/v1/stores/:slug/menu` - Get store menu with items

### Categories & Items  
- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category (admin only)
- `PUT /api/v1/categories/:id` - Update category (admin only)
- `DELETE /api/v1/categories/:id` - Delete category (admin only)
- `GET /api/v1/items` - List menu items
- `GET /api/v1/items/:slug` - Get item details
- `POST /api/v1/items` - Create item (admin only)
- `PUT /api/v1/items/:id` - Update item (admin only)
- `DELETE /api/v1/items/:id` - Delete item (admin only)

### Orders & Cart
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders/:orderNo` - Get order details
- `GET /api/v1/orders/user/history` - Get user order history
- `PUT /api/v1/orders/:id/status` - Update order status (staff only)
- `POST /api/v1/cart/price` - Calculate cart pricing

### Admin Endpoints
- `GET /api/v1/admin/stats` - Dashboard statistics
- `GET /api/v1/admin/orders` - Admin order management
- `PUT /api/v1/admin/items/:id` - Admin item updates
- `GET /api/v1/admin/users` - User management

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