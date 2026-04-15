import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sendActivationConfirmationEmail } from '@/lib/email';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();
    const { token } = await params;

    const user = await User.findOne({
      activationToken: token,
      activationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return new NextResponse(
        `<html><body><h1>Invalid or Expired Link</h1><p>The activation link is invalid or has expired.</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    user.status = 'approved';
    user.activationToken = '';
    user.activationTokenExpiresAt = null;
    await user.save();

    // Send confirmation email to user
    await sendActivationConfirmationEmail({ name: user.name, email: user.email });

    // Redirect to login or show success message
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/login?activated=true`);
  } catch (error) {
    console.error('Activation error:', error);
    return new NextResponse(
      `<html><body><h1>Error</h1><p>Something went wrong during activation.</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
