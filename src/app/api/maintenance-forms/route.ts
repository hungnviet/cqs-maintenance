import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CompletedMaintenanceForm from '@/models/CompletedMaintenanceForm';
import Machine from '@/models/Machine';

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const data = await req.json();
    const { machine, frequency, scheduleId, ...formData } = data;
    
    // Create completed maintenance form
    const completedForm = new CompletedMaintenanceForm({
      machine,
      frequency,
      filledAt: new Date(),
      ...formData
    });
    
    await completedForm.save();
    
    // Update specific schedule in machine's maintenance schedule
    if (scheduleId) {
      // Update the specific schedule by its ID
      await Machine.findByIdAndUpdate(
        machine,
        {
          $push: {
            maintenanceForms: completedForm._id
          },
          $set: {
            'maintenanceSchedule.$[elem].actualDate': new Date(),
            'maintenanceSchedule.$[elem].completedForm': completedForm._id
          }
        },
        {
          arrayFilters: [{ 'elem._id': scheduleId }],
          new: true
        }
      );
    } else {
      // Fallback to old behavior if no scheduleId provided
      await Machine.findByIdAndUpdate(
        machine,
        {
          $push: {
            maintenanceForms: completedForm._id
          },
          $set: {
            'maintenanceSchedule.$[elem].actualDate': new Date(),
            'maintenanceSchedule.$[elem].completedForm': completedForm._id
          }
        },
        {
          arrayFilters: [{ 'elem.frequency': frequency, 'elem.actualDate': null }],
          new: true
        }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: completedForm
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(req.url);
    const machine = searchParams.get('machine');
    const frequency = searchParams.get('frequency');
    
    const filter: any = {};
    if (machine) filter.machine = machine;
    if (frequency) filter.frequency = frequency;
    
    const forms = await CompletedMaintenanceForm.find(filter)
      .populate('machine', 'machineName machineCode')
      .sort({ filledAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: forms
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
