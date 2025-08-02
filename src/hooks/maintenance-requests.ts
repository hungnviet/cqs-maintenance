import { localStorageManager, CACHE_KEYS, generateCacheKey, invalidateCache } from '@/lib/localStorage';

const CACHE_DURATION = 3; // 3 minutes

export interface MaintenanceRequest {
  _id: string;
  serialNumber: string;
  area: string;
  plant: string;
  machine: {
    _id: string;
    machineName: string;
    machineCode: string;
    machineType: {
      typeName: string;
    };
  };
  date: string;
  shift: string;
  partsName: string;
  partsNumber: string;
  operatorName: string;
  operatorNumber: string;
  breakdownStartTime: string;
  priority: 'Normal' | 'High';
  serviceRequestForm: 'Machine Maintenance' | 'Mold Maintenance';
  problemDescription: string;
  requestedBy: string;
  receivedBy: string;
  
  // Completion fields
  correctiveActionTaken?: string;
  breakdownFinishedDate?: string;
  doneBy?: string;
  breakdownEndTime?: string;
  totalStopHours?: number;
  maintenanceStatus?: 'Rectified' | 'Not Rectified';
  breakdownReviewedAndClosed?: boolean;
  comments?: string;
  others?: string;
  reviewedAndClosedBy?: string;
  
  // Department approvals
  engineering?: boolean;
  quality?: boolean;
  moldShopMaintenance?: boolean;
  production?: boolean;
  
  status: 'Pending' | 'In Progress' | 'Completed' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceRequestData {
  area: string;
  machine: string;
  date: Date;
  shift: string;
  partsName: string;
  partsNumber?: string;
  operatorName: string;
  operatorNumber?: string;
  breakdownStartTime: Date;
  priority: 'Normal' | 'High';
  serviceRequestForm: 'Machine Maintenance' | 'Mold Maintenance';
  problemDescription: string;
  requestedBy: string;
  receivedBy: string;
}

export interface UpdateMaintenanceRequestData extends Partial<CreateMaintenanceRequestData> {
  correctiveActionTaken?: string;
  breakdownFinishedDate?: Date;
  doneBy?: string;
  breakdownEndTime?: Date;
  totalStopHours?: number;
  maintenanceStatus?: 'Rectified' | 'Not Rectified';
  breakdownReviewedAndClosed?: boolean;
  comments?: string;
  others?: string;
  reviewedAndClosedBy?: string;
  engineering?: boolean;
  quality?: boolean;
  moldShopMaintenance?: boolean;
  production?: boolean;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Closed';
}

export const getMaintenanceRequests = async (params?: {
  status?: string;
  machine?: string;
  priority?: string;
  forceRefresh?: boolean;
}): Promise<{ success: boolean; data: MaintenanceRequest[]; error?: string }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.machine) queryParams.append('machine', params.machine);
    if (params?.priority) queryParams.append('priority', params.priority);
    
    const cacheKey = generateCacheKey(CACHE_KEYS.MAINTENANCE_REQUESTS, params || {});
    
    // Check cache first (unless force refresh)
    if (!params?.forceRefresh) {
      const cached = localStorageManager.get<MaintenanceRequest[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }
    
    const response = await fetch(`/api/maintenance-requests?${queryParams.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, data: [], error: errorData.error || 'Failed to fetch maintenance requests' };
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Cache the result
      localStorageManager.set(cacheKey, result.data, CACHE_DURATION);
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return { 
      success: false, 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const getMaintenanceRequestDetail = async (
  id: string,
  forceRefresh?: boolean
): Promise<{ success: boolean; data: MaintenanceRequest | null; error?: string }> => {
  try {
    const cacheKey = `${CACHE_KEYS.MAINTENANCE_REQUESTS}-detail-${id}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = localStorageManager.get<MaintenanceRequest>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }
    
    const response = await fetch(`/api/maintenance-requests/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, data: null, error: errorData.error || 'Failed to fetch maintenance request' };
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Cache the result
      localStorageManager.set(cacheKey, result.data, CACHE_DURATION);
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching maintenance request detail:', error);
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const createMaintenanceRequest = async (
  data: CreateMaintenanceRequestData
): Promise<{ success: boolean; data?: MaintenanceRequest; error?: string }> => {
  try {
    const response = await fetch('/api/maintenance-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Invalidate cache
      invalidateCache.maintenanceRequests();
    }
    
    return result;
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const updateMaintenanceRequest = async (
  id: string,
  data: UpdateMaintenanceRequestData
): Promise<{ success: boolean; data?: MaintenanceRequest; error?: string }> => {
  try {
    const response = await fetch(`/api/maintenance-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Invalidate cache
      invalidateCache.maintenanceRequests();
    }
    
    return result;
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const deleteMaintenanceRequest = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/maintenance-requests/${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Invalidate cache
      invalidateCache.maintenanceRequests();
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
