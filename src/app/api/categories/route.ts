import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';
import { ensureDefaultCategories } from '@/lib/categories';

export async function GET() {
  try {
    await connectDB();
    const categories = await ensureDefaultCategories();
    return NextResponse.json(categories);
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to load categories') }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { error } = requireAdmin(req);
    if (error) return NextResponse.json({ message: error.message }, { status: error.status });

    await connectDB();
    const { name } = await req.json();
    const cleanName = typeof name === 'string' ? name.trim() : '';
    if (!cleanName) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

    const existingCategory = await Category.findOne({ name: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (existingCategory) return NextResponse.json({ message: 'Category already exists' }, { status: 400 });

    const newCategory = new Category({ name: cleanName });
    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to create category') }, { status: 500 });
  }
}
