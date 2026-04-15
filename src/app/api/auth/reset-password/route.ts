import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getErrorMessage } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, token, newPassword } = await req.json();

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanToken = typeof token === 'string' ? token.trim() : '';
    const cleanNewPassword = typeof newPassword === 'string' ? newPassword : '';

    if (!cleanEmail || !cleanToken || !cleanNewPassword) {
      return NextResponse.json({ message: 'Email, token, and password are required' }, { status: 400 });
    }

    if (cleanNewPassword.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json({ message: 'Invalid reset link or user not found' }, { status: 400 });
    }

    // Verify token
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');
    if (user.passwordResetToken !== tokenHash) {
      return NextResponse.json({ message: 'Invalid reset link' }, { status: 400 });
    }

    // Check if token has expired
    if (!user.passwordResetExpiresAt || new Date() > user.passwordResetExpiresAt) {
      return NextResponse.json({ message: 'Reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Update password and clear reset token
    user.password = await bcrypt.hash(cleanNewPassword, 10);
    user.passwordResetToken = '';
    user.passwordResetExpiresAt = null;
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully. You can now login with your new password.' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to reset password') }, { status: 500 });
  }
}
