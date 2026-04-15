import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getErrorMessage } from '@/lib/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status === 'pending') {
      return NextResponse.json({ message: 'Account pending approval' }, { status: 403 });
    }

    if (user.status === 'rejected') {
      return NextResponse.json({ message: 'Account access rejected' }, { status: 403 });
    }

    if (user.status === 'blocked') {
      return NextResponse.json({ message: 'Account access blocked' }, { status: 403 });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, status: user.status },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

    // Set cookie for middleware
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to log in') }, { status: 500 });
  }
}
