import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MachineTypeMaintenanceFormTemplate from '@/models/MachineTypeMaintenanceFormTemplate';

export async function GET(
  req: NextRequest, 
  { params }: { params: { machineTypeCode: string } }
) {
  await dbConnect();
  
  try {
    const { machineTypeCode } = params;
    
    const templates = await MachineTypeMaintenanceFormTemplate.find({ 
      machineType: machineTypeCode 
    }).sort({ frequency: 1 });
    
    return NextResponse.json({
      success: true,
      data: templates
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
