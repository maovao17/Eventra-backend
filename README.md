# Eventra Backend

Eventra Backend is a scalable API built with NestJS that powers the Eventra platform, handling authentication, event management, vendor interactions, bookings, payments, and system security.

---

# Tech Stack

- NestJS
- MongoDB (Mongoose)
- Firebase Admin SDK (Authentication)
- Razorpay (Payments)
- WebSockets (Real-time updates)

---

# Features

- Firebase-based authentication (OTP + Google)
- Role-based access control (Customer / Vendor / Admin)
- Event creation and management
- Vendor request and booking lifecycle
- Razorpay payment integration (secure and verified)
- Idempotent payment handling (safe retries)
- Chat initialization support (Firestore integration)
- WebSocket event updates
- Secure API with guards and validation

---

# Architecture

- REST API using NestJS
- MongoDB as primary database
- Firebase Admin for auth verification
- Razorpay for payment processing
- Firestore used externally for chat storage

---

# Setup

## 1. Clone Repository

```bash
git clone https://github.com/your-username/eventra-backend.git
cd eventra-backend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Environment Variables

Create a `.env` file:

```env
PORT=3002
DB_URI=your_mongodb_connection_string

CORS_ORIGIN=http://localhost:3000

FIREBASE_SERVICE_ACCOUNT_PATH=path_to_service_account.json

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## 4. Run Server

```bash
npm run start:dev
```

---

# Authentication

- Firebase tokens are verified using Firebase Admin SDK
- All protected routes use `FirebaseAuthGuard`
- Role-based access is enforced using `RolesGuard`

---

# Payment Flow

1. Create Razorpay order on the backend
2. Frontend opens Razorpay checkout
3. Backend verifies payment signature
4. Webhook confirms payment status
5. Booking is updated accordingly

---

# Idempotency

- Multiple failed payments are allowed
- Only one successful payment is allowed per booking
- Duplicate webhook calls are ignored safely

---

# WebSockets

- Authenticated using Firebase token
- User-specific event broadcasting
- No global data leakage

---

# Testing

```bash
npm run build
npm test
```

---

# Notes

- MongoDB is used for core data
- Firebase Firestore is used for chat as a separate system
- All sensitive logic is handled on the backend
