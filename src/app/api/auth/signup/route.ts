import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getErrorMessage } from '@/lib/errors';
import { sendApprovalStatusEmail, sendNewSignupEmail } from '@/lib/email';

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
    
    // First user becomes admin automatically for convenience, others are pending users
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';
    const status = userCount === 0 ? 'approved' : 'pending';

    const newUser = new User({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role,
      status,
    });

    await newUser.save();

    // Send emails to both admin and user
    await Promise.allSettled([
      // Always notify admin about new signup
      sendNewSignupEmail({ name: newUser.name, email: newUser.email, status: newUser.status }),
      // Always notify user about their account status
      sendApprovalStatusEmail({ name: newUser.name, email: newUser.email, status: newUser.status }),
    ]);

    return NextResponse.json({ message: 'User registered successfully', status: newUser.status }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to register user') }, { status: 500 });
  }
}
