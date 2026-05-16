# 🔐 AuthMaster Backend API

Complete authentication system backend with JWT, refresh tokens, email verification, 2FA, and admin features.

## 🚀 Live API
- **Base URL:** `https://auth-backend.onrender.com`
- **Health Check:** `https://auth-backend.onrender.com/health`

## 📋 Features
- ✅ User Registration with Email Verification
- ✅ JWT Authentication with Refresh Tokens
- ✅ Two-Factor Authentication (2FA)
- ✅ Role-Based Access Control (Admin/User)
- ✅ Forgot/Reset Password
- ✅ Profile Management
- ✅ Activity Logging
- ✅ Admin User Management

## 🛠️ Tech Stack
- Node.js + Express
- TypeScript
- MySQL (Aiven)
- JWT authentication
- Nodemailer with Ethereal

## 📦 Installation

```bash
git clone https://github.com/YOUR_USERNAME/auth-backend.git
cd auth-backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev