import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Machine from '@/models/Machine';
import MachineMaintenanceFormTemplate from '@/models/MachineMaintenanceFormTemplate';

// POST /api/machines/fix-maintenance-forms
// This is a one-time fix for existing machines that don't have maintenanceForms populated
export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    // Find all machines with empty maintenanceForms
    const machines = await Machine.find({ 
      $or: [
        { maintenanceForms: { $exists: false } },
        { maintenanceForms: { $size: 0 } }
      ]
    });
    
    let updatedCount = 0;
    
    for (const machine of machines) {
      // Find templates for this machine
      const templates = await MachineMaintenanceFormTemplate.find({ machine: machine._id });
      
      if (templates.length > 0) {
        // Update machine with template references
        machine.maintenanceForms = templates.map(t => t._id);
        await machine.save();
        updatedCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} machines`,
      totalMachines: machines.length 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}
