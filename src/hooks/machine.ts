// Types for Machine management
export interface MachineData {
  machineName: string;
  machineCode: string;
  machineType: string; // ObjectId as string
  purchaseDate: string;
  plant: string;
  status: 'Active' | 'Inactive' | 'Under Maintenance';
  images: string[];
  description: string;
  specifications: { title: string; value: string }[];
}

export interface MachineSchedule {
  _id?: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Half-Yearly' | 'Yearly';
  plannedDate: string;
  actualDate?: string | null;
  status: 'upcoming' | 'late' | 'completed';
}

export interface MachineDetail {
  _id: string;
  machineName: string;
  machineCode: string;
  machineType: {
    _id: string;
    typeName: string;
    machineTypeCode: string;
  };
  purchaseDate: string;
  plant: string;
  status: 'Active' | 'Inactive' | 'Under Maintenance';
  images: string[];
  description: string;
  specifications: { title: string; value: string }[];
  sparePartMaintenance: {
    frequencies: string[];
    sparePart: {
      _id: string;
      sparePartCode: string;
      sparePartName: string;
      sparePartPrice: number;
      inventoryQuantity: number;
    };
    quantity: number;
  }[];
  maintenanceSchedule: MachineSchedule[];
  maintenanceForms: any[];
}

// API Functions
export async function getAllMachines(params?: {
  search?: string;
  plant?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.plant) searchParams.append('plant', params.plant);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.pageIndex !== undefined) searchParams.append('pageIndex', params.pageIndex.toString());
  if (params?.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString());
  
  const res = await fetch(`/api/machines?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch machines');
  return res.json();
}

export async function getMachineDetail(machineCode: string) {
  const res = await fetch(`/api/machines/${machineCode}`);
  if (!res.ok) throw new Error('Failed to fetch machine detail');
  return res.json();
}

export async function createMachine(data: FormData) {
  const res = await fetch('/api/machines', {
    method: 'POST',
    body: data,
  });
  if (!res.ok) throw new Error('Failed to create machine');
  return res.json();
}

export async function updateMachine(machineCode: string, data: FormData) {
  const res = await fetch(`/api/machines/${machineCode}`, {
    method: 'PUT',
    body: data,
  });
  if (!res.ok) throw new Error('Failed to update machine');
  return res.json();
}

export async function deleteMachine(machineCode: string) {
  const res = await fetch(`/api/machines/${machineCode}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete machine');
  return res.json();
}

// Schedule API Functions
export async function getMachineSchedule(machineCode: string) {
  const res = await fetch(`/api/machines/${machineCode}/schedule`);
  if (!res.ok) throw new Error('Failed to fetch machine schedule');
  return res.json();
}

export async function updateMachineSchedule(machineCode: string, scheduleData: any) {
  const res = await fetch(`/api/machines/${machineCode}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData),
  });
  if (!res.ok) throw new Error('Failed to update machine schedule');
  return res.json();
}

export async function createMachineSchedule(machineCode: string, scheduleData: any) {
  const res = await fetch(`/api/machines/${machineCode}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData),
  });
  if (!res.ok) throw new Error('Failed to create machine schedule');
  return res.json();
}

export async function deleteMachineSchedule(machineCode: string, scheduleId: string) {
  const res = await fetch(`/api/machines/${machineCode}/schedule?scheduleId=${scheduleId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete machine schedule');
  return res.json();
}

export async function getMachineMaintenanceTemplates(machineCode: string) {
  const res = await fetch(`/api/machines/${machineCode}/maintenance-templates`);
  if (!res.ok) throw new Error('Failed to fetch maintenance templates');
  return res.json();
}