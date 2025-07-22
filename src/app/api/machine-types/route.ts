import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MachineType from '@/models/MachineType';
import MachineTypeMaintenanceFormTemplate from '@/models/MachineTypeMaintenanceFormTemplate';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const pageIndex = parseInt(searchParams.get('pageIndex') || '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const getAll = searchParams.get('getAll') === 'true'; // Add this for dropdown
  
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { typeName: { $regex: search, $options: 'i' } },
      { machineTypeCode: { $regex: search, $options: 'i' } },
    ];
  }
  
  if (getAll) {
    // Return all machine types for dropdown without pagination
    const types = await MachineType.find(filter)
      .select('_id typeName machineTypeCode')
      .sort({ typeName: 1 });
    return NextResponse.json({ success: true, data: types });
  }
  
  const total = await MachineType.countDocuments(filter);
  const types = await MachineType.find(filter)
    .skip(pageIndex * pageSize)
    .limit(pageSize)
    .select('typeName machineTypeCode totalMachines description');
  return NextResponse.json({ success: true, data: types, total });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await mongoose.startSession();
  try {
    const data = await req.json();
    const { typeName, machineTypeCode, description, specificationTemplate, templates } = data;
    if (!typeName || !machineTypeCode || !specificationTemplate || !templates || templates.length !== 5) {
      return NextResponse.json({ success: false, error: 'typeName, machineTypeCode, specificationTemplate, and 5 templates are required' }, { status: 400 });
    }
    session.startTransaction();
    const machineType = new MachineType({ typeName, machineTypeCode, description, specificationTemplate });
    await machineType.save({ session });
    const typeId = machineType._id;
    const createdTemplates = [];
    for (const tmpl of templates) {
      const doc = new MachineTypeMaintenanceFormTemplate({ ...tmpl, machineType: typeId });
      await doc.save({ session });
      createdTemplates.push(doc._id);
    }
    await session.commitTransaction();
    return NextResponse.json({ success: true, data: { machineType, templates: createdTemplates } });
  } catch (error) {
    await session.abortTransaction();
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : error }, { status: 500 });
  } finally {
    session.endSession();
  }
}

