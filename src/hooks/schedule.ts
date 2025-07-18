// Types for Schedule management
export interface ScheduleData {
  _id: string;
  machineName: string;
  machineCode: string;
  plant: string;
  machineType: {
    _id: string;
    typeName: string;
    machineTypeCode: string;
  };
  maintenanceSchedule: MaintenanceScheduleItem[];
}

export interface MaintenanceScheduleItem {
  _id?: string;
  frequency: string;
  plannedDate: string;
  actualDate?: string | null;
  completedForm?: string;
}

// API Functions
export async function getAllSchedules(params?: {
  frequency?: 'half-yearly' | 'yearly';
  plant?: string;
  machineCode?: string;
  machineType?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.frequency) searchParams.append('frequency', params.frequency);
  if (params?.plant) searchParams.append('plant', params.plant);
  if (params?.machineCode) searchParams.append('machineCode', params.machineCode);
  if (params?.machineType) searchParams.append('machineType', params.machineType);
  
  const res = await fetch(`/api/schedule?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch schedules');
  return res.json();
}
