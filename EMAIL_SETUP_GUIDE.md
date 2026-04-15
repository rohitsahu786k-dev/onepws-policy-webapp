# 📧 Email Configuration Quick Guide

Your `.env.local` file has been created. Now configure ONE email service:

## 🚀 Option 1: Gmail (Fastest - 5 minutes)

1. **Go to Gmail Account Settings:**
   - Visit: https://myaccount.google.com/apppasswords
   - Make sure 2-factor authentication is enabled

2. **Generate App Password:**
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy it

3. **Update `.env.local`:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=your-email@gmail.com
ADMIN_NOTIFICATION_EMAIL=admin@yourdomain.com
```

4. **Restart dev server:**
```bash
npm run dev
```

5. **Test:** Sign up a new user and check your inbox ✅

---

## 💎 Option 2: Resend (Modern Service)

1. **Sign up:** https://resend.com
2. **Get API Key:** https://resend.com/api-keys
3. **Update `.env.local`:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=your-email@resend.com
ADMIN_NOTIFICATION_EMAIL=admin@yourdomain.com
```
4. **Restart server and test**

---

## 🧪 Test Email Functionality

After setup, test with:

1. **New User Registration**
   - Go to `/signup`
   - Sign up with test account
   - Check both user inbox and admin inbox

2. **Forgot Password**
   - Go to `/forgot-password`
   - Enter email
   - Check inbox for reset link
   - Click and verify reset works

3. **Check Server Logs**
   - Look for: "Email sent successfully"
   - If error: Check credentials in `.env.local`

---

## ⚠️ Common Issues

**Issue: Emails still not sending**
- Q: Is `.env.local` updated?
  - A: Make sure all fields are set correctly

- Q: Did you restart `npm run dev`?
  - A: Restart is required after changing `.env.local`

- Q: Wrong password?
  - A: For Gmail, use App Password (16 chars), not regular password

- Q: Port 587 blocked?
  - A: Try `SMTP_PORT=465` with `SMTP_SECURE=true`

---

## 📝 Environment Variables Reference

```
# Email Service (CHOOSE ONE)
RESEND_API_KEY=              # Resend API key
SMTP_HOST=                   # SMTP server address
SMTP_PORT=                   # SMTP port (usually 587 or 465)
SMTP_SECURE=                 # true for 465, false for 587
SMTP_USER=                   # SMTP username
SMTP_PASS=                   # SMTP password or app password

# Email Settings (REQUIRED)
EMAIL_FROM=                  # Sender email address
ADMIN_NOTIFICATION_EMAIL=    # Admin email for notifications

# Other Settings
MONGODB_URI=                 # MongoDB connection string
JWT_SECRET=                  # JWT token secret
NEXT_PUBLIC_APP_URL=         # App URL for password reset links
MAX_DOCUMENT_SIZE_MB=500     # Document upload limit
```

---

## 🎯 Next Steps

1. Update `.env.local` with your email settings
2. Restart `npm run dev`
3. Test by signing up a new user
4. Check inbox and confirm emails arrive
5. Happy emailing! ✨
