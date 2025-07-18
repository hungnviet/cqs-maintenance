import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MachineType from '@/models/MachineType';
import MachineTypeMaintenanceFormTemplate from '@/models/MachineTypeMaintenanceFormTemplate';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ machineTypeCode: string }> }) {
  await dbConnect();
  const { machineTypeCode } = await params;
  const type = await MachineType.findOne({ machineTypeCode });
  if (!type) return NextResponse.json({ success: false, error: 'MachineType not found' }, { status: 404 });
  const templates = await MachineTypeMaintenanceFormTemplate.find({ machineType: type._id });
  return NextResponse.json({
    success: true,
    data: {
      typeName: type.typeName,
      machineTypeCode: type.machineTypeCode,
      description: type.description,
      specificationTemplate: type.specificationTemplate,
      templates,
    },
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ machineTypeCode: string }> }) {
  await dbConnect();
  const session = await mongoose.startSession();
  try {
    const { machineTypeCode } = await params;
    const data = await req.json();
    const { typeName, description, specificationTemplate, templates } = data;
    if (!typeName || !specificationTemplate || !templates || templates.length !== 5) {
      return NextResponse.json({ success: false, error: 'typeName, specificationTemplate, and 5 templates are required' }, { status: 400 });
    }
    session.startTransaction();
    const machineType = await MachineType.findOneAndUpdate(
      { machineTypeCode },
      { typeName, description, specificationTemplate },
      { new: true, session }
    );
    if (!machineType) throw new Error('MachineType not found');
    const upsertedTemplates = [];
    for (const tmpl of templates) {
      const filter = { machineType: machineType._id, frequency: tmpl.frequency };
      const update = { ...tmpl, machineType: machineType._id };
      const doc = await MachineTypeMaintenanceFormTemplate.findOneAndUpdate(filter, update, { new: true, upsert: true, session });
      upsertedTemplates.push(doc);
    }
    await session.commitTransaction();
    return NextResponse.json({ success: true, data: { machineType, templates: upsertedTemplates } });
  } catch (error) {
    await session.abortTransaction();
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : error }, { status: 500 });
  } finally {
    session.endSession();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ machineTypeCode: string }> }) {
  await dbConnect();
  const { machineTypeCode } = await params;
  const type = await MachineType.findOne({ machineTypeCode });
  if (!type) return NextResponse.json({ success: false, error: 'MachineType not found' }, { status: 404 });
  await MachineType.findByIdAndDelete(type._id);
  await MachineTypeMaintenanceFormTemplate.deleteMany({ machineType: type._id });
  return NextResponse.json({ success: true });
}