import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SparePart from '@/models/SparePart';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// PUT /api/spare-parts/[sparePartCode]
export async function PUT(req: NextRequest, context: { params: { sparePartCode: string } }) {
  await dbConnect();
  try {
    const { params } = context;
    const { sparePartCode } = await params;
    // Support both JSON and multipart/form-data
    let updateData: any = {};
    let imageUrl = '';
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const imageFile = formData.get('image') as File | null;
      if (imageFile) {
        const tempId = 'sparepart_' + Date.now();
        imageUrl = await uploadImageToCloudinary(imageFile, tempId);
      }
      updateData = JSON.parse(formData.get('data') as string);
      if (imageUrl) updateData.imageUrl = imageUrl;
    } else {
      updateData = await req.json();
    }
    const part = await SparePart.findOneAndUpdate({ sparePartCode }, updateData, { new: true });
    if (!part) return NextResponse.json({ success: false, error: 'Spare part not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: part });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

// DELETE /api/spare-parts/[sparePartCode]
export async function DELETE(req: NextRequest, context: { params: { sparePartCode: string } }) {
  await dbConnect();
  try {
    const { params } = context;
    const { sparePartCode } = await params;
    const deleted = await SparePart.findOneAndDelete({ sparePartCode });
    if (!deleted) return NextResponse.json({ success: false, error: 'Spare part not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
