import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MaintenanceRequest from '@/models/MaintenanceRequest';
import Machine from '@/models/Machine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const machine = searchParams.get('machine');
    const priority = searchParams.get('priority');
    
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (machine) filter.machine = machine;
    if (priority) filter.priority = priority;
    
    const requests = await MaintenanceRequest.find(filter)
      .populate({
        path: 'machine',
        select: 'machineName machineCode machineType',
        populate: {
          path: 'machineType',
          select: 'typeName'
        }
      })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const data = await req.json();
    
    // Get machine details for plant info
    const machine = await Machine.findById(data.machine)
      .populate('machineType', 'typeName');
    
    if (!machine) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' },
        { status: 404 }
      );
    }
    
    // Create maintenance request with machine info
    const maintenanceRequest = new MaintenanceRequest({
      ...data,
      plant: machine.machineType?.typeName || 'Unknown Plant',
      machineNumber: machine.machineCode,
      status: 'Pending'
    });
    
    await maintenanceRequest.save();
    
    // Populate the response
    await maintenanceRequest.populate({
      path: 'machine',
      select: 'machineName machineCode machineType',
      populate: {
        path: 'machineType',
        select: 'typeName'
      }
    });
    
    return NextResponse.json({
      success: true,
      data: maintenanceRequest
    });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
