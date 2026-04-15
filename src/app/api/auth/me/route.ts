import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';
import { uploadToCloudinary } from '@/lib/cloudinary';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

type PublicUserSource = {
  _id: { toString: () => string };
  name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  profileImageUrl?: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
};

function publicUser(user: PublicUserSource) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    department: user.department || '',
    designation: user.designation || '',
    profileImageUrl: user.profileImageUrl || '',
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function GET(req: Request) {
  try {
    const auth = verifyAuth(req);
    if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById(auth.userId).select('-password');
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json(publicUser(user));
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to load profile') }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = verifyAuth(req);
    if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const department = typeof body.department === 'string' ? body.department.trim() : '';
    const designation = typeof body.designation === 'string' ? body.designation.trim() : '';

    if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return NextResponse.json({ message: 'Enter a valid phone number' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      auth.userId,
      { name, phone, department, designation },
      { new: true }
    ).select('-password');

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const token = jwt.sign(
      { userId: user._id, role: user.role, status: user.status },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json(publicUser(user));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to update profile') }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = verifyAuth(req);
    if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Current and new password are required' }, { status: 400 });
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json({ message: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const user = await User.findById(auth.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to update password') }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = verifyAuth(req);
    if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ message: 'Profile photo is required' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'Profile photo must be 10 MB or less' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Upload an image file (JPG, PNG, or WebP)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `profile-${auth.userId}`;

    const { secure_url } = await uploadToCloudinary(buffer, filename, 'profiles', 'image');

    const user = await User.findByIdAndUpdate(
      auth.userId,
      { profileImageUrl: secure_url },
      { new: true }
    ).select('-password');

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json(publicUser(user));
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to upload profile photo') }, { status: 500 });
  }
}
