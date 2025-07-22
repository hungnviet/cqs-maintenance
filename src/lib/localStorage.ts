interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

interface LocalStorageCache {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, expiryMinutes?: number): void;
  remove(key: string): void;
  clear(): void;
  isExpired(key: string): boolean;
}

class LocalStorageManager implements LocalStorageCache {
  private prefix = 'cqs_maintenance_';

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      
      // Check if expired
      if (Date.now() > cacheItem.expiryTime) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  }

  set<T>(key: string, data: T, expiryMinutes: number = 5): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiryTime: Date.now() + (expiryMinutes * 60 * 1000),
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem));
    } catch {
      console.error('Error setting localStorage');
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.prefix + key);
    } catch {
      console.error('Error removing from localStorage');
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch {
      console.error('Error clearing localStorage');
    }
  }

  isExpired(key: string): boolean {
    if (typeof window === 'undefined') return true;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return true;

      const cacheItem: CacheItem = JSON.parse(item);
      return Date.now() > cacheItem.expiryTime;
    } catch {
      return true;
    }
  }
}

export const localStorageManager = new LocalStorageManager();

// Cache keys constants
export const CACHE_KEYS = {
  MACHINES: 'machines',
  MACHINE_TYPES: 'machine_types',
  SPARE_PARTS: 'spare_parts',
  MACHINE_DETAIL: (code: string) => `machine_detail_${code}`,
  MACHINE_TYPE_DETAIL: (code: string) => `machine_type_detail_${code}`,
  MACHINE_SCHEDULE: (code: string) => `machine_schedule_${code}`,
  MAINTENANCE_FORMS: 'maintenance_forms',
};

// Helper function to generate cache key with params
export const generateCacheKey = (baseKey: string, params: Record<string, unknown>) => {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|');
  
  return paramString ? `${baseKey}_${paramString}` : baseKey;
};

// Cache invalidation helpers
export const invalidateCache = {
  machines: () => {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage)
      .filter(key => key.includes('cqs_maintenance_machines'))
      .forEach(key => localStorage.removeItem(key));
  },
  
  machineTypes: () => {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage)
      .filter(key => key.includes('cqs_maintenance_machine_type'))
      .forEach(key => localStorage.removeItem(key));
  },
  
  spareParts: () => {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage)
      .filter(key => key.includes('cqs_maintenance_spare_parts'))
      .forEach(key => localStorage.removeItem(key));
  },
  
  machineDetail: (machineCode: string) => {
    localStorageManager.remove(CACHE_KEYS.MACHINE_DETAIL(machineCode));
  },
  
  machineSchedule: (machineCode: string) => {
    localStorageManager.remove(CACHE_KEYS.MACHINE_SCHEDULE(machineCode));
  },
  
  all: () => {
    localStorageManager.clear();
  }
};
