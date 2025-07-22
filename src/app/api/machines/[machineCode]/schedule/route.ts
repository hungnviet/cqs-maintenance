import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Machine from '@/models/Machine';

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ machineCode: string }> }
) {
  await dbConnect();
  
  try {
    const { machineCode } = await params;
    
    const machine = await Machine.findOne({ machineCode })
      .select('maintenanceSchedule')
      .populate('maintenanceForms');
    
    if (!machine) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' }, 
        { status: 404 }
      );
    }

    // Calculate status for each schedule item
    const now = new Date();
    const scheduleWithStatus = machine.maintenanceSchedule.map((schedule: {
      actualDate?: Date;
      plannedDate: Date;
      _id: string;
      toObject: () => Record<string, unknown>;
    }) => {
      let status = 'upcoming';
      
      if (schedule.actualDate) {
        status = 'completed';
      } else if (new Date(schedule.plannedDate) < now) {
        status = 'late';
      }
      
      return {
        ...schedule.toObject(),
        status
      };
    });

    return NextResponse.json({
      success: true,
      data: scheduleWithStatus
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ machineCode: string }> }
) {
  await dbConnect();
  
  try {
    const { machineCode } = await params;
    const updateData = await req.json();
    
    const machine = await Machine.findOne({ machineCode });
    
    if (!machine) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' }, 
        { status: 404 }
      );
    }

    // Update specific schedule item
    if (updateData.scheduleId) {
      const scheduleIndex = machine.maintenanceSchedule.findIndex(
        (s: { _id: { toString: () => string } }) => s._id.toString() === updateData.scheduleId
      );
      
      if (scheduleIndex !== -1) {
        if (updateData.actualDate) {
          machine.maintenanceSchedule[scheduleIndex].actualDate = new Date(updateData.actualDate);
        }
        if (updateData.plannedDate) {
          machine.maintenanceSchedule[scheduleIndex].plannedDate = new Date(updateData.plannedDate);
        }
      }
    }

    await machine.save();

    return NextResponse.json({
      success: true,
      data: machine.maintenanceSchedule
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ machineCode: string }> }
) {
  await dbConnect();
  
  try {
    const { machineCode } = await params;
    const { schedules } = await req.json();
    
    const machine = await Machine.findOne({ machineCode });
    
    if (!machine) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' }, 
        { status: 404 }
      );
    }

    // Add new schedules to the machine
    const newSchedules = schedules.map((schedule: {
      frequency: string;
      plannedDate: string;
      actualDate?: string;
    }) => ({
      frequency: schedule.frequency,
      plannedDate: new Date(schedule.plannedDate),
      actualDate: schedule.actualDate ? new Date(schedule.actualDate) : null
    }));

    machine.maintenanceSchedule.push(...newSchedules);
    await machine.save();

    return NextResponse.json({
      success: true,
      data: machine.maintenanceSchedule
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ machineCode: string }> }
) {
  await dbConnect();
  
  try {
    const { machineCode } = await params;
    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('scheduleId');
    
    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }
    
    const machine = await Machine.findOne({ machineCode });
    
    if (!machine) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' }, 
        { status: 404 }
      );
    }

    // Remove the schedule from the array
    machine.maintenanceSchedule = machine.maintenanceSchedule.filter(
      (schedule: { _id: { toString: () => string } }) => schedule._id.toString() !== scheduleId
    );
    
    await machine.save();

    return NextResponse.json({
      success: true,
      data: machine.maintenanceSchedule
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
