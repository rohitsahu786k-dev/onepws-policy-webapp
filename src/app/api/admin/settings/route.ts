import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ approverEmails: [process.env.ADMIN_NOTIFICATION_EMAIL || 'marketing@onepws.com'] });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { approverEmails } = await req.json();
    if (!Array.isArray(approverEmails)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ approverEmails });
    } else {
      settings.approverEmails = approverEmails;
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
