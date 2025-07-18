import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Machine from '@/models/Machine';
import MachineType from '@/models/MachineType';

// GET /api/schedule
export async function GET(req: NextRequest) {
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const frequency = searchParams.get('frequency') || 'yearly'; // 'half-yearly' or 'yearly'
  const plant = searchParams.get('plant') || '';
  const machineCode = searchParams.get('machineCode') || '';
  const machineType = searchParams.get('machineType') || '';
  
  // Build filter query
  const filter: any = {};
  
  if (plant) {
    filter.plant = { $regex: plant, $options: 'i' };
  }
  
  if (machineCode) {
    filter.machineCode = { $regex: machineCode, $options: 'i' };
  }
  
  if (machineType) {
    filter.machineType = machineType;
  }
  
  // Get current year for date range (show full year regardless of frequency filter)
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31);
  
  try {
    const machines = await Machine.find(filter)
      .populate('machineType', 'typeName machineTypeCode')
      .select('machineName machineCode plant machineType maintenanceSchedule')
      .lean();
    
    // Filter maintenance schedules by frequency and within current year
    const filteredMachines = machines.map(machine => ({
      ...machine,
      maintenanceSchedule: machine.maintenanceSchedule.filter((schedule: any) => {
        const plannedDate = new Date(schedule.plannedDate);
        const isInCurrentYear = plannedDate >= startDate && plannedDate <= endDate;
        const matchesFrequency = schedule.frequency.toLowerCase() === frequency.toLowerCase();
        return isInCurrentYear && matchesFrequency;
      })
    })).filter(machine => machine.maintenanceSchedule.length > 0);
    
    return NextResponse.json({ 
      success: true, 
      data: filteredMachines,
      frequency,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}
