import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Document from '@/models/Document';
import { requireAdmin } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = requireAdmin(req);
    if (error) return NextResponse.json({ message: error.message }, { status: error.status });

    await connectDB();

    // Check if any documents are linked to this category
    const linkedDocuments = await Document.countDocuments({ categoryId: id });
    if (linkedDocuments > 0) {
      return NextResponse.json({ message: 'Cannot delete category with linked documents' }, { status: 400 });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to delete category') }, { status: 500 });
  }
}
