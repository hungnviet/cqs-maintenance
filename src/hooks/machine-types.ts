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
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.pageIndex !== undefined) searchParams.append('pageIndex', params.pageIndex.toString());
  if (params?.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString());
  
  const res = await fetch(`/api/machine-types?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch machine types');
  return res.json();
}

export async function getAllMachineTypesForDropdown() {
  const res = await fetch('/api/machine-types?getAll=true');
  if (!res.ok) throw new Error('Failed to fetch machine types for dropdown');
  return res.json();
}

export async function getMachineTypeDetail(machineTypeCode: string) {
  const res = await fetch(`/api/machine-types/${machineTypeCode}`);
  if (!res.ok) throw new Error('Failed to fetch machine type detail');
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
