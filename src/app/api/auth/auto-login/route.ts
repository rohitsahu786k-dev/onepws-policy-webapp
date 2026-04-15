import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function GET(req: Request) {
  try {
    await connectDB();

    // Find admin user
    const adminUser = await User.findOne({ email: 'marketing@onepws.com' });
    if (!adminUser) {
      return NextResponse.json({ message: 'Admin user not found' }, { status: 404 });
    }

    // Check if admin is approved
    if (adminUser.status !== 'approved') {
      return NextResponse.json({ message: 'Admin account not active' }, { status: 403 });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: adminUser._id, role: adminUser.role, status: adminUser.status },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Create response with cookie
    const response = NextResponse.redirect(new URL('/admin', req.url));
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 day
    });

    return response;
  } catch (error) {
    console.error('Auto-login error:', error);
    return NextResponse.json({ message: 'Auto-login failed' }, { status: 500 });
  }
}
