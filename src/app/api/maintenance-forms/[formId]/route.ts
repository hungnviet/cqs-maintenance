import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CompletedMaintenanceForm from '@/models/CompletedMaintenanceForm';
import MachineType from '@/models/MachineType';
import Machine from '@/models/Machine';

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ formId: string }> }
) {
  await dbConnect();
  void MachineType; 
  void Machine; 
  try {
    const { formId } = await params;
    
    const form = await CompletedMaintenanceForm.findById(formId)
      .populate({
        path: 'machine',
        populate: {
          path: 'machineType',
          select: 'typeName machineTypeCode'
        }
      });
    
    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Maintenance form not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: form
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
