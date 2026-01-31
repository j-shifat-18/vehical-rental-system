# 🚗 Vehicle Rental System

A comprehensive backend API for managing vehicle rentals with role-based access control, built with Node.js, TypeScript, and PostgreSQL.

## 🌐 Live Demo

**API Base URL:** [https://vehical-rental-system-five.vercel.app](https://vehical-rental-system-five.vercel.app)

## 📋 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** - Secure token-based user authentication
- **Role-based Access Control** - Admin and Customer roles with different permissions
- **Password Security** - bcrypt hashing for secure password storage

### 👥 User Management
- User registration and login
- Profile management (customers can update own profile, admins can manage all users)
- User deletion with active booking constraints

### 🚙 Vehicle Management
- Complete vehicle inventory management
- Vehicle types: Car, Bike, Van, SUV
- Real-time availability tracking
- Admin-only vehicle operations (create, update, delete)

### 📅 Booking System
- **Smart Booking Creation** - Automatic price calculation based on rental duration
- **Availability Management** - Real-time vehicle status updates
- **Role-based Booking Access** - Admins see all bookings, customers see their own
- **Flexible Booking Updates** - Cancel or mark as returned with business rule validation
- **Constraint Validation** - Customers can only cancel before start date

### 💼 Business Logic
- **Dynamic Pricing** - `total_price = daily_rent_price × number_of_days`
- **Availability Tracking** - Automatic vehicle status updates on booking changes
- **Data Integrity** - Prevent deletion of users/vehicles with active bookings
- **Date Validation** - Comprehensive date range and business rule validation

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **TypeScript** - Type-safe JavaScript development
- **Express.js** - Fast, unopinionated web framework

### Database
- **PostgreSQL** - Robust relational database
- **pg** - PostgreSQL client for Node.js

### Security & Authentication
- **bcryptjs** - Password hashing library
- **jsonwebtoken** - JWT implementation for secure authentication

### Development Tools
- **tsx** - TypeScript execution engine
- **dotenv** - Environment variable management

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** database

### 1. Clone the Repository
```bash
git clone <repository-url>
cd vehicle-rental-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
CONNECTION_STRING=postgresql://username:password@host:port/database

# Server Configuration
PORT=3001

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key
```

### 4. Database Setup
The application will automatically create the required tables on first run. Ensure your PostgreSQL database is running and accessible.

### 5. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📖 API Usage

### Base URL
```
Local: http://localhost:3001/api/v1
Production: https://vehical-rental-system-five.vercel.app/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Quick Start Examples

#### 1. Register a New User
```bash
curl -X POST https://vehical-rental-system-five.vercel.app/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "phone": "01712345678",
    "role": "customer"
  }'
```

#### 2. Login
```bash
curl -X POST https://vehical-rental-system-five.vercel.app/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

#### 3. View Available Vehicles
```bash
curl -X GET https://vehical-rental-system-five.vercel.app/api/v1/vehicles
```

#### 4. Create a Booking (Authenticated)
```bash
curl -X POST https://vehical-rental-system-five.vercel.app/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "customer_id": 1,
    "vehicle_id": 1,
    "rent_start_date": "2024-02-01",
    "rent_end_date": "2024-02-05"
  }'
```

## 🔗 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - User login

### Vehicles
- `GET /vehicles` - View all vehicles (Public)
- `GET /vehicles/:vehicleId` - View specific vehicle (Public)
- `POST /vehicles` - Create vehicle (Admin only)
- `PUT /vehicles/:vehicleId` - Update vehicle (Admin only)
- `DELETE /vehicles/:vehicleId` - Delete vehicle (Admin only)

### Users
- `GET /users` - View all users (Admin only)
- `PUT /users/:userId` - Update user (Admin or own profile)
- `DELETE /users/:userId` - Delete user (Admin only)

### Bookings
- `GET /bookings` - View bookings (Role-based access)
- `POST /bookings` - Create booking (Authenticated users)
- `PUT /bookings/:bookingId` - Update booking status (Role-based)

## 🏗️ Project Structure

```
src/
├── config/
│   ├── db.ts              # Database configuration
│   └── index.ts           # Environment config
├── middlewares/
│   └── auth.ts            # JWT authentication middleware
├── modules/
│   ├── auth/              # Authentication module
│   ├── user/              # User management module
│   ├── vehicle/           # Vehicle management module
│   └── booking/           # Booking management module
├── types/
│   └── express/           # TypeScript type definitions
└── server.ts              # Application entry point
```

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Role-based Authorization** - Admin/Customer access control
- **Input Validation** - Comprehensive request validation
- **SQL Injection Prevention** - Parameterized queries
- **CORS Protection** - Cross-origin request handling

## 🚦 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Detailed error information"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using Node.js, TypeScript, and PostgreSQL**