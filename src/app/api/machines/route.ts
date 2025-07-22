import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Machine from '@/models/Machine';
import MachineType from '@/models/MachineType';
import MachineMaintenanceFormTemplate from '@/models/MachineMaintenanceFormTemplate';
import mongoose from 'mongoose';
import { IMachine } from '@/models/Machine';
import { uploadImageToCloudinary } from '@/lib/cloudinary';


// GET /api/machines
export async function GET(req: NextRequest) {
  await dbConnect();
  void MachineType;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const plant = searchParams.get('plant') || '';
  const status = searchParams.get('status') || '';
  const pageIndex = parseInt(searchParams.get('pageIndex') || '0');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  
  // Build filter query
  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      { machineName: { $regex: search, $options: 'i' } },
      { machineCode: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (plant) {
    filter.plant = { $regex: plant, $options: 'i' };
  }
  
  if (status) {
    filter.status = status;
  }
  
  try {
    const total = await Machine.countDocuments(filter);
    const machines = await Machine.find(filter)
      .populate('machineType', 'typeName machineTypeCode')
      .select('machineName machineCode status plant machineType purchaseDate')
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: machines,
      total,
      pageIndex,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

// POST /api/machines
export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await mongoose.startSession();
  try {
    const formData = await req.formData();
    const images: string[] = [];
    for (let i = 0; i < 3; i++) {
      const imageFile = formData.get(`image${i}`) as File | null;
      if (imageFile) {
        const tempId = 'machine_' + Date.now() + '_' + i;
        const url = await uploadImageToCloudinary(imageFile, tempId);
        images.push(url);
      }
    }
    const machineData = JSON.parse(formData.get('data') as string);
    const templates = machineData.templates;
    session.startTransaction();
    const machine: IMachine = new Machine({
      ...machineData,
      images,
      maintenanceSchedule: [], // Initialize as empty - schedules will be created separately
      maintenanceForms: [],
    });
    await machine.save({ session });
    const machineId = machine._id;

    const createdTemplates = [];
    for (const tmpl of templates) {
      const doc = new MachineMaintenanceFormTemplate({ ...tmpl, machine: machineId});
      await doc.save({ session });
      createdTemplates.push(doc._id);
    }
    
    // Update machine with references to the created templates
    machine.maintenanceForms = createdTemplates;
    await machine.save({ session });
    await session.commitTransaction();
    return NextResponse.json({ success: true, data: { machine, templates: createdTemplates } });
  } catch (error) {
    await session.abortTransaction();
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : error }, { status: 500 });
  } finally {
    session.endSession();
  }
}