import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MaintenanceRequest from '@/models/MaintenanceRequest';

export const dynamic = 'force-dynamic';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, context: Context) {
  await dbConnect();
  
  try {
    const { id } = context.params;
    
    const request = await MaintenanceRequest.findById(id)
      .populate({
        path: 'machine',
        select: 'machineName machineCode machineType',
        populate: {
          path: 'machineType',
          select: 'typeName'
        }
      });
    
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Maintenance request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching maintenance request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: Context) {
  await dbConnect();
  
  try {
    const { id } = context.params;
    const data = await req.json();
    
    const request = await MaintenanceRequest.findByIdAndUpdate(
      id,
      { 
        ...data,
        updatedAt: new Date()
      },
      { new: true }
    ).populate({
      path: 'machine',
      select: 'machineName machineCode machineType',
      populate: {
        path: 'machineType',
        select: 'typeName'
      }
    });
    
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Maintenance request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  await dbConnect();
  
  try {
    const { id } = context.params;
    
    const request = await MaintenanceRequest.findByIdAndDelete(id);
    
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Maintenance request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Maintenance request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
