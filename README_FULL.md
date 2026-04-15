# OnePWS Policy WebApp

A comprehensive policy document management system with admin dashboard, user authentication, and role-based access control.

## ✨ Features

### User Management
- ✅ User registration with email verification
- ✅ Admin approval workflow (Pending → Approved/Rejected/Blocked)
- ✅ Password change functionality
- ✅ Forgot password with secure token-based reset
- ✅ Profile management with photo upload
- ✅ One-click admin auto-login

### Admin Dashboard
- ✅ Complete user management interface
- ✅ Create users with role assignment (Admin/Regular User)
- ✅ User status management (Approved/Pending/Blocked/Rejected)
- ✅ Password reset for users
- ✅ User deletion with notifications
- ✅ Real-time user statistics

### Document Management
- ✅ PDF and Office document upload (500MB limit)
- ✅ Document preview and download
- ✅ Category-based organization
- ✅ Document listing and filtering

### Security
- ✅ JWT-based authentication (1-day expiration)
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ Secure token generation for password reset
- ✅ Protected admin routes and APIs

### Email Notifications
- ✅ Gmail SMTP integration
- ✅ User signup notifications
- ✅ Approval status emails
- ✅ Password reset emails
- ✅ User account updates
- ✅ HTML email templates with fallback text

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account with App Password

### Installation

```bash
# Clone repository
git clone https://github.com/rohitsahu786k-dev/onepws-policy-webapp.git
cd onepws-policy-webapp

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Configure environment variables
nano .env.local
# Update with your MongoDB URI and Gmail SMTP settings

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Environment Setup

Create `.env.local` with:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/policy-webapp

# JWT
JWT_SECRET=your-secret-key-here

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
EMAIL_FROM=your-email@gmail.com
ADMIN_NOTIFICATION_EMAIL=admin@example.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Upload Limits
MAX_DOCUMENT_SIZE_MB=500
```

### Getting Gmail App Password
1. Enable 2-factor authentication on Gmail
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Paste into `SMTP_PASS` in `.env.local`

## 🔐 Default Admin Credentials

After first user signup becomes admin:

```
Email: marketing@onepws.com
Password: Rohit@11
Role: Admin
Status: Approved
```

Or use the **Quick Admin Login** button on the login page for instant access!

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── components/     # UI components
│   ├── lib/            # Utilities (auth, db, email)
│   └── models/         # Mongoose schemas
├── middleware/         # Next.js middleware
└── types/              # TypeScript definitions
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get profile
- `PATCH /api/auth/me` - Update profile
- `PUT /api/auth/me` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Complete password reset
- `GET /api/auth/auto-login` - Quick admin login

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users` - Update user status or reset password
- `DELETE /api/admin/users` - Delete user

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/[id]` - Get document
- `DELETE /api/documents/[id]` - Delete document

## 🏗️ Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📦 Tech Stack

- **Framework**: Next.js 16.2.3 with TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer + Gmail SMTP
- **Styling**: Tailwind CSS 4
- **UI Components**: Lucide React icons
- **HTTP Client**: Axios

## 🔄 User Lifecycle

1. **Registration** → User fills signup form
2. **Pending** → User account awaits admin approval (default state)
3. **Approved** → User can now login
4. **Blocked** → (Optional) Temporarily suspend access
5. **Rejected** → (Optional) Deny access permanently

## 🎯 Features Completed

✅ User authentication and registration  
✅ Password reset with email verification  
✅ Profile management (info, photo, password)  
✅ Admin dashboard with user management  
✅ Role-based access control (Admin/User)  
✅ Document upload and management  
✅ Email notifications for all actions  
✅ One-click admin auto-login  
✅ Production build optimization  

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 👨‍💼 Support

For issues or questions, contact: marketing@onepws.com

---

**Built with ❤️ by OnePWS Team**
