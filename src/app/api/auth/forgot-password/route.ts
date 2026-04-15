import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getErrorMessage } from '@/lib/errors';
import { sendForgotPasswordEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json({ message: 'If an account exists with this email, a password reset link has been sent.' }, { status: 200 });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiration to 1 hour from now
    const resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour

    user.passwordResetToken = tokenHash;
    user.passwordResetExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Send email with reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onepws-policies.vercel.app';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    await sendForgotPasswordEmail({
      name: user.name,
      email: user.email,
      resetLink,
    });

    return NextResponse.json({ message: 'If an account exists with this email, a password reset link has been sent.' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to process password reset') }, { status: 500 });
  }
}
