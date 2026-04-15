# User Dashboard Features - Testing Checklist

## ✅ Feature 1: Change Password
- [ ] Login as admin user
- [ ] Go to `/admin/profile`
- [ ] Scroll to "Password" section on the right
- [ ] Enter current password
- [ ] Enter new password (minimum 8 characters)
- [ ] Confirm new password
- [ ] Click "Update password"
- [ ] Verify success message appears
- [ ] Logout and login with new password to confirm it works

## ✅ Feature 2: Upload Profile Photo
- [ ] Login as admin user
- [ ] Go to `/admin/profile`
- [ ] See large avatar at the top with camera icon
- [ ] Click on the photo area/camera icon
- [ ] Select an image (JPG, PNG, or WebP, max 5MB)
- [ ] Verify photo uploads immediately
- [ ] Verify success message appears
- [ ] Refresh page and confirm photo persists
- [ ] Test with different image format (PNG, WebP)
- [ ] Test error: Try uploading file larger than 5MB (should fail)
- [ ] Test error: Try uploading non-image file (should fail)

## ✅ Feature 3: Update Profile Information
- [ ] Login as admin user
- [ ] Go to `/admin/profile`
- [ ] Scroll to "Account details" section on the left
- [ ] Update full name, phone, department, designation
- [ ] Click "Save profile"
- [ ] Verify success message appears
- [ ] Refresh page and confirm changes persist
- [ ] Try entering invalid phone format (should show error)

## ✅ Feature 4: Forgot Password
- [ ] Logout (go to `/login`)
- [ ] Click "Forgot password?" link
- [ ] You'll be on `/forgot-password` page
- [ ] Enter email address of an existing user
- [ ] Click "Send reset link"
- [ ] Verify success message: "Check your email"
- [ ] Check email inbox for reset link (or check spam folder)
- [ ] If RESEND_API_KEY is configured, email should arrive
- [ ] If not configured, message shows "This is an automated email from OnePWS Policy Hub"

## ✅ Feature 5: Reset Password
- [ ] Click the reset link from email (or manually go to `/reset-password?token=XXXX&email=user@example.com`)
- [ ] You'll see "Create new password" form
- [ ] Enter new password (minimum 8 characters)
- [ ] Confirm password
- [ ] Click "Reset password"
- [ ] Verify success message: "Password reset successful"
- [ ] You'll be redirected to login after 2 seconds
- [ ] Login with new password to confirm it works
- [ ] Test error: Try expired link or invalid token (should show error)

## Environment Variables Needed
```
JWT_SECRET=your_secret_key
RESEND_API_KEY=your_resend_api_key (optional, will skip email if not set)
EMAIL_FROM=your_email@example.com (optional, defaults to marketing@onepws.com)
ADMIN_NOTIFICATION_EMAIL=admin@example.com (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000 (or your domain)
```

## Files Modified/Created
- ✅ `src/models/User.ts` - Added passwordResetToken and passwordResetExpiresAt
- ✅ `src/app/api/auth/me/route.ts` - Already complete (no changes needed)
- ✅ `src/app/api/auth/forgot-password/route.ts` - NEW
- ✅ `src/app/api/auth/reset-password/route.ts` - NEW
- ✅ `src/app/forgot-password/page.tsx` - NEW
- ✅ `src/app/reset-password/page.tsx` - NEW
- ✅ `src/app/login/page.tsx` - Updated forgot password link
- ✅ `src/lib/email.ts` - Added sendForgotPasswordEmail()
- ✅ `src/middleware.ts` - Added public routes for forgot-password and reset-password

## How to Test Locally Without Email
If you don't have RESEND_API_KEY configured:
1. The API will return success but skip email sending
2. You can manually construct the reset URL with token
3. The system will still validate and reset the password

If you want to test the complete flow:
1. Set up Resend account (https://resend.com)
2. Get your API key
3. Add to `.env.local`: `RESEND_API_KEY=re_xxxxx`
4. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`
5. Run the app and test the full forgot password flow

## Troubleshooting
- If "Forgot password?" link not showing on login page → Restart dev server
- If reset page shows "Invalid or missing reset link" → Check URL parameters are correct
- If "Password updated successfully" but old password still works → Check database connection
- If email not received → Check RESEND_API_KEY is set, or check spam folder
