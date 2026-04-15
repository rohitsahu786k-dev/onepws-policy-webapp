import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getErrorMessage } from '@/lib/errors';
import { sendActivationEmail, sendNewSignupEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanName || !cleanEmail || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // First user becomes admin automatically, others are pending users
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';
    const status = userCount === 0 ? 'approved' : 'pending';

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = new User({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role,
      status,
      activationToken,
      activationTokenExpiresAt,
    });

    await newUser.save();
  
    // App URL for activation link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onepws-policies.vercel.app';
    const activationLink = `${appUrl}/api/auth/activate/${activationToken}`;

    // Send emails
    await Promise.allSettled([
      // Send activation email to approvers (this contains the activation button)
      sendActivationEmail({ name: newUser.name, email: newUser.email, activationLink }),
    ]);

    return NextResponse.json({ 
      message: 'Signup successful. An administrator will review and activate your account.', 
      status: newUser.status 
    }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to register user') }, { status: 500 });
  }
}
