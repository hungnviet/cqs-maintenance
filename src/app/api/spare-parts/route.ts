import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SparePart from '@/models/SparePart';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// GET /api/spare-parts?search=xxx&pageIndex=1&pageSize=10&sortBy=inventoryQuantity&sortOrder=desc&plant=Plant%20A
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const pageIndex = parseInt(searchParams.get('pageIndex') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'sparePartName';
  const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;
  const plant = searchParams.get('plant') || '';

  const filter: any = {};
  if (search) {
    filter.$or = [
      { sparePartName: { $regex: search, $options: 'i' } },
      { sparePartCode: { $regex: search, $options: 'i' } },
    ];
  }
  if (plant) {
    filter.plant = plant;
  }

  const total = await SparePart.countDocuments(filter);
  const parts = await SparePart.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((pageIndex - 1) * pageSize)
    .limit(pageSize);

  return NextResponse.json({ success: true, data: parts, total });
}

// POST /api/spare-parts
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    let imageUrl = '';
    if (imageFile) {
      const tempId = 'sparepart_' + Date.now();
      imageUrl = await uploadImageToCloudinary(imageFile, tempId);
    }
    // Get other fields
    const sparePartData = JSON.parse(formData.get('data') as string);
    const part = new SparePart({ ...sparePartData, imageUrl });
    await part.save();
    return NextResponse.json({ success: true, data: part });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

