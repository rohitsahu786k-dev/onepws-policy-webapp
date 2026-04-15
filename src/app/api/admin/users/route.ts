import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';
import { sendApprovalStatusEmail, sendPasswordResetEmail, sendUserCreatedEmail, sendUserRemovedEmail } from '@/lib/email';

export async function GET(req: Request) {
  try {
    const { error } = requireAdmin(req);
    if (error) return NextResponse.json({ message: error.message }, { status: error.status });

    await connectDB();
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to load users') }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { error } = requireAdmin(req);
    if (error) return NextResponse.json({ message: error.message }, { status: error.status });

    await connectDB();
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const status = typeof body.status === 'string' ? body.status : 'approved';

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (!['pending', 'approved', 'rejected', 'blocked'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return NextResponse.json({ message: 'User already exists' }, { status: 400 });

    const role = typeof body.role === 'string' && ['admin', 'user'].includes(body.role) ? body.role : 'user';

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      status,
    });

    await Promise.allSettled([
      sendUserCreatedEmail({ name, email, password, status }),
      sendApprovalStatusEmail({ name, email, status }),
    ]);

    const publicUser = await User.findById(user._id).select('-password');
    return NextResponse.json(publicUser, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to create user') }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { error } = requireAdmin(req);
    if (error) return NextResponse.json({ message: error.message }, { status: error.status });

    await connectDB();
    const body = await req.json();
    const userId = typeof body.userId === 'string' ? body.userId : '';
    const action = typeof body.action === 'string' ? body.action : 'status';

    if (!userId) {
      return NextResponse.json({ message: 'User id is required' }, { status: 400 });
    }

    if (action === 'reset-password') {
      const password = typeof body.password === 'string' ? body.password : '';
      if (password.length < 8) {
        return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
      }

      const user = await User.findOneAndUpdate(
        { _id: userId, role: 'user' },
        { password: await bcrypt.hash(password, 10) },
        { new: true }
      ).select('-password');

      if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

      await Promise.allSettled([
        sendPasswordResetEmail({ name: user.name, email: user.email, password }),
      ]);

      return NextResponse.json(user);
    }

    const status = typeof body.status === 'string' ? body.status : '';
    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    if (!['approved', 'rejected', 'pending', 'blocked'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, role: 'user' },
      { status },
      { new: true }
    ).select('-password');
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    await Promise.allSettled([
      sendApprovalStatusEmail({ name: user.name, email: user.email, status: user.status }),
    ]);

    return NextResponse.json(user);
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to update user') }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { error } = requireAdmin(req);
    if (error) return NextResponse.json({ message: error.message }, { status: error.status });

    await connectDB();
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ message: 'User id is required' }, { status: 400 });

    const user = await User.findOneAndDelete({ _id: userId, role: 'user' }).select('-password');
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    await Promise.allSettled([
      sendUserRemovedEmail({ name: user.name, email: user.email }),
    ]);

    return NextResponse.json({ message: 'User removed successfully', userId });
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to remove user') }, { status: 500 });
  }
}
