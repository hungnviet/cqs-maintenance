import { localStorageManager, CACHE_KEYS, generateCacheKey } from '@/lib/localStorage';

// Types
export interface MachineType {
  _id: string;
  typeName: string;
  machineTypeCode: string;
  totalMachines: number;
  description?: string;
}

export interface DetailedMachineType {
  typeName: string;
  machineTypeCode: string;
  description?: string;
  specificationTemplate: { title: string; _id: string }[];
  templates: Array<{
    _id: string;
    machineType: string;
    frequency: string;
    groups: Array<{
      groupTitle: string;
      requirements: Array<{
        titleEng: string;
        titleVn: string;
        note?: string;
        _id: string;
      }>;
      _id: string;
    }>;
    __v?: number;
  }>;
}

export interface MachineTypeData {
  typeName: string;
  machineTypeCode: string;
  description?: string;
  specificationTemplate: { title: string }[];
  templates: MaintenanceFormTemplate[];
}

export interface MaintenanceFormTemplate {
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Half-Yearly' | 'Yearly';
  groups: RequirementGroup[];
}

export interface RequirementGroup {
  groupTitle: string;
  requirements: Requirement[];
}

export interface Requirement {
  titleEng: string;
  titleVn: string;
  note?: string;
}

// API Functions
export async function getAllMachineTypes(params?: {
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}, forceRefresh: boolean = false) {
  const cacheKey = generateCacheKey(CACHE_KEYS.MACHINE_TYPES, params || {});
  
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cachedData = localStorageManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.pageIndex !== undefined) searchParams.append('pageIndex', params.pageIndex.toString());
  if (params?.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString());
  
  // Add cache busting
  searchParams.append('_t', Date.now().toString());
  
  const res = await fetch(`/api/machine-types?${searchParams}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch machine types');
  
  const data = await res.json();
  
  // Cache the result for 10 minutes (machine types change less frequently)
  if (data.success) {
    localStorageManager.set(cacheKey, data, 10);
  }
  
  return data;
}

export async function getAllMachineTypesForDropdown(forceRefresh: boolean = false) {
  const cacheKey = 'machine_types_dropdown';
  
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cachedData = localStorageManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const res = await fetch(`/api/machine-types?getAll=true&_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch machine types for dropdown');
  
  const data = await res.json();
  
  // Cache the result for 15 minutes
  if (data.success) {
    localStorageManager.set(cacheKey, data, 15);
  }
  
  return data;
}

export async function getMachineTypeDetail(machineTypeCode: string, forceRefresh: boolean = false) {
  const cacheKey = CACHE_KEYS.MACHINE_TYPE_DETAIL(machineTypeCode);
  
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cachedData = localStorageManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const res = await fetch(`/api/machine-types/${machineTypeCode}?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch machine type detail');
  
  const data = await res.json();
  
  // Cache the result for 15 minutes (machine type details change infrequently)
  if (data.success) {
    localStorageManager.set(cacheKey, data, 15);
  }
  
  return data;
  return res.json();
}

export async function createMachineType(data: MachineTypeData) {
  const res = await fetch('/api/machine-types', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create machine type');
  return res.json();
}

export async function updateMachineType(machineTypeCode: string, data: Omit<MachineTypeData, 'machineTypeCode'>) {
  const res = await fetch(`/api/machine-types/${machineTypeCode}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update machine type');
  return res.json();
}

export async function deleteMachineType(machineTypeCode: string) {
  const res = await fetch(`/api/machine-types/${machineTypeCode}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete machine type');
  return res.json();
}

export async function getMachineTypeMaintenanceTemplates(machineTypeId: string) {
  const res = await fetch(`/api/machine-types/${machineTypeId}/maintenance-templates`);
  if (!res.ok) throw new Error('Failed to fetch maintenance templates');
  return res.json();
}
