import { localStorageManager, CACHE_KEYS, generateCacheKey, invalidateCache } from '@/lib/localStorage';
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

export interface MaintenanceForm {
  _id: string;
  frequency: string;
  date: string;
  machineId: string;
  machine: string;
  filledAt: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  maintenanceStartTime: string;
  maintenanceEndTime: string;
  maintenanceOperatorNumber: string;
  remarks: string;
  groups: Array<{
    groupTitle: string;
    requirements: Array<{
      titleEng: string;
      titleVn: string;
      accepted: boolean;
      note: string;
    }>;
  }>;
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
  maintenanceForms: MaintenanceForm[];
}

// API Functions
export async function getAllMachines(params?: {
  search?: string;
  plant?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}, forceRefresh: boolean = false) {
  const cacheKey = generateCacheKey(CACHE_KEYS.MACHINES, params || {});
  
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cachedData = localStorageManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.plant) searchParams.append('plant', params.plant);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.pageIndex !== undefined) searchParams.append('pageIndex', params.pageIndex.toString());
  if (params?.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString());
  
  // Add cache busting
  searchParams.append('_t', Date.now().toString());
  
  const res = await fetch(`/api/machines?${searchParams}`, {
    cache: 'no-store', // Prevent caching
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch machines');
  
  const data = await res.json();
  
  // Cache the result for 3 minutes
  if (data.success) {
    localStorageManager.set(cacheKey, data, 3);
  }
  
  return data;
}

export async function getMachineDetail(machineCode: string, forceRefresh: boolean = false) {
  const cacheKey = CACHE_KEYS.MACHINE_DETAIL(machineCode);
  
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cachedData = localStorageManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const res = await fetch(`/api/machines/${machineCode}?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch machine detail');
  
  const data = await res.json();
  
  // Cache the result for 5 minutes
  if (data.success) {
    localStorageManager.set(cacheKey, data, 5);
  }
  
  return data;
}

export async function createMachine(data: FormData) {
  const res = await fetch('/api/machines', {
    method: 'POST',
    body: data,
  });
  if (!res.ok) throw new Error('Failed to create machine');
  
  const result = await res.json();
  
  // Invalidate machines cache when creating new machine
  if (result.success) {
    invalidateCache.machines();
  }
  
  return result;
}

export async function updateMachine(machineCode: string, data: FormData) {
  const res = await fetch(`/api/machines/${machineCode}`, {
    method: 'PUT',
    body: data,
  });
  if (!res.ok) throw new Error('Failed to update machine');
  
  const result = await res.json();
  
  // Invalidate related cache when updating machine
  if (result.success) {
    invalidateCache.machines();
    invalidateCache.machineDetail(machineCode);
  }
  
  return result;
}

export async function deleteMachine(machineCode: string) {
  const res = await fetch(`/api/machines/${machineCode}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete machine');
  
  const result = await res.json();
  
  // Invalidate related cache when deleting machine
  if (result.success) {
    invalidateCache.machines();
    invalidateCache.machineDetail(machineCode);
    invalidateCache.machineSchedule(machineCode);
  }
  
  return result;
}

export interface ScheduleData {
  schedules: Array<{
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Half-Yearly' | 'Yearly';
    plannedDate: Date | string;
    actualDate: Date | string | null;
  }>;
}

// Schedule API Functions
export async function getMachineSchedule(machineCode: string, forceRefresh: boolean = false) {
  const cacheKey = CACHE_KEYS.MACHINE_SCHEDULE(machineCode);
  
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cachedData = localStorageManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const res = await fetch(`/api/machines/${machineCode}/schedule?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch machine schedule');
  
  const data = await res.json();
  
  // Cache the result for 2 minutes (shorter since schedules change more frequently)
  if (data.success) {
    localStorageManager.set(cacheKey, data, 2);
  }
  
  return data;
}

export async function updateMachineSchedule(machineCode: string, scheduleData: ScheduleData) {
  const res = await fetch(`/api/machines/${machineCode}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData),
  });
  if (!res.ok) throw new Error('Failed to update machine schedule');
  
  const result = await res.json();
  
  // Invalidate related cache when updating schedule
  if (result.success) {
    invalidateCache.machineSchedule(machineCode);
    invalidateCache.machineDetail(machineCode);
    invalidateCache.schedules(); // Also invalidate main schedules cache
  }
  
  return result;
}

export async function createMachineSchedule(machineCode: string, scheduleData: ScheduleData) {
  const res = await fetch(`/api/machines/${machineCode}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData),
  });
  if (!res.ok) throw new Error('Failed to create machine schedule');
  
  const result = await res.json();
  
  // Invalidate related cache when creating schedule
  if (result.success) {
    invalidateCache.machineSchedule(machineCode);
    invalidateCache.machineDetail(machineCode);
    invalidateCache.schedules(); // Also invalidate main schedules cache
  }
  
  return result;
}

export async function deleteMachineSchedule(machineCode: string, scheduleId: string) {
  const res = await fetch(`/api/machines/${machineCode}/schedule?scheduleId=${scheduleId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete machine schedule');
  
  const result = await res.json();
  
  // Invalidate related cache when deleting schedule
  if (result.success) {
    invalidateCache.machineSchedule(machineCode);
    invalidateCache.machineDetail(machineCode);
    invalidateCache.schedules(); // Also invalidate main schedules cache
  }
  
  return result;
}

export async function getMachineMaintenanceTemplates(machineCode: string) {
  const res = await fetch(`/api/machines/${machineCode}/maintenance-templates`);
  if (!res.ok) throw new Error('Failed to fetch maintenance templates');
  return res.json();
}