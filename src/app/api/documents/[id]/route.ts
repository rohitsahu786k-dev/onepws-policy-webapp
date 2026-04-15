import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Document from '@/models/Document';
import { unlink } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = requireAdmin(req);
    if (error) return NextResponse.json({ message: error.message }, { status: error.status });

    await connectDB();
    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : '';

    if (!title || !categoryId) {
      return NextResponse.json({ message: 'Title and category are required' }, { status: 400 });
    }

    const document = await Document.findByIdAndUpdate(
      id,
      { title, categoryId },
      { new: true }
    ).populate('categoryId');

    if (!document) return NextResponse.json({ message: 'Document not found' }, { status: 404 });

    return NextResponse.json(document);
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to update document') }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = requireAdmin(req);
    if (error) return NextResponse.json({ message: error.message }, { status: error.status });

    await connectDB();

    const document = await Document.findById(id);
    if (!document) return NextResponse.json({ message: 'Document not found' }, { status: 404 });

    // Delete file from storage
    if (document.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', document.fileUrl.replace(/^\/+/, ''));
      try {
        await unlink(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    await Document.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error, 'Unable to delete document') }, { status: 500 });
  }
}
