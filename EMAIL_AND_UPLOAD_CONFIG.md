# Email & Upload Configuration Guide

## 📧 Email Service Setup

Your app now supports **two email services**:
1. **Resend** (Primary) - Modern email service
2. **Nodemailer** (Fallback) - Traditional SMTP

### Option 1: Resend (Recommended)

**Setup:**
1. Sign up at https://resend.com
2. Get your API key
3. Add to `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=your-email@domain.com
ADMIN_NOTIFICATION_EMAIL=admin@domain.com
```

### Option 2: Nodemailer (SMTP Fallback)

**Install Nodemailer:**
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

**Add to `.env.local`:**
```
# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email settings
EMAIL_FROM=your-email@gmail.com
ADMIN_NOTIFICATION_EMAIL=admin@domain.com
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password as `SMTP_PASS`

**For Other Providers:**
- **Office 365/Outlook**: `smtp.office365.com:587`
- **SendGrid**: `smtp.sendgrid.net:587` (use `apikey` as username)
- **AWS SES**: `email-smtp.region.amazonaws.com:587`
- **Custom:** Check your email provider for SMTP details

### Test Email Configuration

Add this to a test API route to verify:
```typescript
import { sendEmail } from '@/lib/email';

// In your API route:
await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Email Test</h1><p>If you see this, emails are working!</p>'
});
```

---

## 📁 Document Upload Limits

### Document Upload (PDF, Word, Excel, PowerPoint)
- **Default Limit**: 500 MB
- **Configurable via env var**: `MAX_DOCUMENT_SIZE_MB`

**Change limit in `.env.local`:**
```
# For 1000 MB (1 GB)
MAX_DOCUMENT_SIZE_MB=1000

# For unlimited (use with caution)
MAX_DOCUMENT_SIZE_MB=999999
```

### Profile Photo Upload
- **Limit**: 10 MB
- **Formats**: JPG, PNG, WebP

---

## 🔍 Troubleshooting

### Emails Not Sending

**Check logs:**
```bash
# Look for email errors in your console when sending
npm run dev
```

**If using Nodemailer, test SMTP connection:**
```javascript
// Create a test script: test-smtp.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Error:', error);
  } else {
    console.log('SMTP Server is ready!');
  }
});
```

### Documents Won't Upload

1. **Check file size:**
   - File must be less than `MAX_DOCUMENT_SIZE_MB`
   - Check error message for your configured limit

2. **Check file format:**
   - Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
   - Disallowed: images, videos, executables

3. **Check disk space:**
   - Uploads stored in `public/uploads/Policies/`
   - Ensure sufficient disk space available

---

## 📋 Environment Variables Summary

### Email Variables
```
RESEND_API_KEY=        # Optional: Resend API key
SMTP_HOST=             # Optional: SMTP server address
SMTP_PORT=             # Optional: SMTP port (usually 587 or 465)
SMTP_SECURE=           # Optional: true for 465, false for 587
SMTP_USER=             # Optional: SMTP username/email
SMTP_PASS=             # Optional: SMTP password/app password
EMAIL_FROM=            # Required: Sender email address
ADMIN_NOTIFICATION_EMAIL=  # Optional: Admin email for notifications
```

### Upload Variables
```
MAX_DOCUMENT_SIZE_MB=500  # Document size limit (default: 500)
```

### Other Variables
```
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For password reset links
JWT_SECRET=your-secret-key                 # JWT token secret
MONGODB_URI=mongodb://...                  # MongoDB connection
```

---

## ✅ Verification Checklist

- [ ] Email service configured (Resend or SMTP)
- [ ] Emails are being sent and received
- [ ] Document uploads working with new limit
- [ ] Profile photos uploading without errors
- [ ] Password reset emails arriving
- [ ] Signup notification emails working
- [ ] Admin status change emails sent
