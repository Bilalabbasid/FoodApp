# 🎭 User Roles & Login Credentials

## 🔐 Demo User Accounts

### 👑 Administrator
- **Email**: `admin@tastycrave.com`
- **Password**: `Admin123!`
- **Roles**: `admin`, `manager`
- **Permissions**: Full system access, user management, store configuration

### 👨‍🍳 Kitchen Staff
- **Email**: `kitchen@tastycrave.com`
- **Password**: `Kitchen123!`
- **Roles**: `kitchen`
- **Permissions**: Order management, kitchen display, inventory updates

### 👤 Customer #1
- **Email**: `customer@example.com`
- **Password**: `Customer123!`
- **Roles**: `customer`
- **Features**: Order placement, loyalty points (150), address management

### 👤 Customer #2
- **Email**: `jane@example.com`
- **Password**: `Jane123!`
- **Roles**: `customer`
- **Features**: Order placement, loyalty points (75), work address

### 🏍️ Delivery Rider
- **Email**: `rider@tastycrave.com`
- **Password**: `Rider123!`
- **Roles**: `rider`
- **Permissions**: Order delivery, route management, status updates

## 🚀 Real User Registration

### For New Customers
Real users can register through the frontend or API with:

```json
{
  "name": "Full Name",
  "email": "unique@email.com",
  "password": "MinimumLength8!",
  "phone": "+1-555-123-4567" // Optional
}
```

### Registration Endpoint
```
POST /api/v1/auth/register
Content-Type: application/json
```

### Automatic Role Assignment
- New registrations → `customer` role automatically
- Email verification required for production
- All demo accounts pre-verified for testing

## 🏪 Store Information

### TastyCrave Downtown
- **Slug**: `downtown`
- **Hours**: 11:00 AM - 11:00 PM (Sun-Thu), 11:00 AM - 12:00 AM (Fri-Sat)
- **Delivery Zones**: Downtown ($2.99), Midtown ($3.99)
- **Prep Time**: 25 minutes average

## 🎫 Available Coupons

### WELCOME10
- **Type**: 10% discount
- **Min Order**: $25
- **Max Discount**: $5
- **Usage**: 1 per user

### FREESHIP
- **Type**: Free delivery
- **Value**: $2.99
- **Min Order**: $30
- **Usage**: Multiple times

## 🔗 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api/v1
- **Health Check**: http://localhost:3001/health

## 📝 Usage Examples

### Login Test
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"Customer123!"}'
```

### Register New User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Smith","email":"john@example.com","password":"Password123!"}'
```

## 🛡️ Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Rate limiting on auth endpoints
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ HTTP-only cookies for tokens
- ✅ Role-based access control

## 🎯 Role Permissions

| Role | Orders | Menu | Users | Kitchen | Delivery | Admin |
|------|--------|------|-------|---------|----------|-------|
| Customer | Place | View | Profile | - | Track | - |
| Kitchen | View/Update | Update Stock | - | Full | - | - |
| Rider | Delivery | View | Profile | - | Full | - |
| Manager | Full | Full | Store Staff | Full | Full | Store |
| Admin | Full | Full | Full | Full | Full | Full |

---

🚀 **All systems are ready for testing and development!**
