import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MachineMaintenanceFormTemplate from '@/models/MachineMaintenanceFormTemplate';
import Machine from '@/models/Machine';

// GET /api/machines/[machineCode]/maintenance-templates
export async function GET(req: NextRequest, { params }: { params: Promise<{ machineCode: string }> }) {
  await dbConnect();
  const { machineCode } = await params;
  
  try {
    // Find the machine first to get its ID
    const machine = await Machine.findOne({ machineCode });
    if (!machine) {
      return NextResponse.json({ success: false, error: 'Machine not found' }, { status: 404 });
    }
    
    // Get the maintenance templates for this machine
    const templates = await MachineMaintenanceFormTemplate.find({ machine: machine._id });
    
    return NextResponse.json({ 
      success: true, 
      data: templates 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}
