import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Machine from '@/models/Machine';
import MachineType from '@/models/MachineType';
import SparePart from '@/models/SparePart';
import MachineMaintenanceFormTemplate from '@/models/MachineMaintenanceFormTemplate';
import mongoose from 'mongoose';

// GET /api/machines/[machineCode]
export async function GET(req: NextRequest, { params }: { params: Promise<{ machineCode: string }> }) {
  await dbConnect();
  
  // Ensure models are registered
  MachineType;
  SparePart;
  MachineMaintenanceFormTemplate;
  
  const { machineCode } = await params;
  
  try {
    // Get machine without populate first
    const machine = await Machine.findOne({ machineCode });
      
    if (!machine) {
      return NextResponse.json({ success: false, error: 'Machine not found' }, { status: 404 });
    }

    // Manually get related data to avoid populate issues
    const machineType = await MachineType.findById(machine.machineType, 'typeName machineTypeCode');
    const templates = await MachineMaintenanceFormTemplate.find({ machine: machine._id });
    
    // Handle spare parts if any exist
    let populatedSparePartMaintenance = [];
    if (machine.sparePartMaintenance && machine.sparePartMaintenance.length > 0) {
      populatedSparePartMaintenance = await Promise.all(
        machine.sparePartMaintenance.map(async (item: any) => {
          const sparePart = await SparePart.findById(item.sparePart, 'sparePartCode sparePartName sparePartPrice inventoryQuantity');
          return {
            ...item.toObject(),
            sparePart
          };
        })
      );
    }
    
    // Create the response data
    const machineData = machine.toObject();
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        ...machineData,
        machineType,
        sparePartMaintenance: populatedSparePartMaintenance,
        templates, // For backward compatibility
        maintenanceForms: templates // Update the actual field with populated data
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

// PUT /api/machines/[machineCode]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ machineCode: string }> }) {
  await dbConnect();
  const session = await mongoose.startSession();
  try {
    const { machineCode } = await params;
    const data = await req.json();
    const { templates, ...machineData } = data;
    if (!templates || templates.length !== 5) {
      return NextResponse.json({ success: false, error: '5 templates are required' }, { status: 400 });
    }
    // Remove machineCode from update
    delete machineData.machineCode;
    session.startTransaction();
    const machine = await Machine.findOneAndUpdate(
      { machineCode },
      machineData,
      { new: true, session }
    );
    if (!machine) throw new Error('Machine not found');
    const upsertedTemplates = [];
    for (const tmpl of templates) {
      const filter = { machine: machine._id, frequency: tmpl.frequency };
      const update = { ...tmpl, machine: machine._id };
      const doc = await MachineMaintenanceFormTemplate.findOneAndUpdate(filter, update, { new: true, upsert: true, session });
      upsertedTemplates.push(doc);
    }
    await session.commitTransaction();
    return NextResponse.json({ success: true, data: { machine, templates: upsertedTemplates } });
  } catch (error) {
    await session.abortTransaction();
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : error }, { status: 500 });
  } finally {
    session.endSession();
  }
}

// DELETE /api/machines/[machineCode]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ machineCode: string }> }) {
  await dbConnect();
  const { machineCode } = await params;
  const machine = await Machine.findOne({ machineCode });
  if (!machine) return NextResponse.json({ success: false, error: 'Machine not found' }, { status: 404 });
  await Machine.findByIdAndDelete(machine._id);
  await MachineMaintenanceFormTemplate.deleteMany({ machine: machine._id });
  return NextResponse.json({ success: true });
}