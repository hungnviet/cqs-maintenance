import { useEffect, useState } from 'react';

export type SparePart = {
  sparePartCode: string;
  sparePartName: string;
  sparePartPrice: number;
  supplierName: string;
  supplierPhone: string;
  supplierAddress: string;
  supplierEmail: string;
  transportTime: number;
  inventoryQuantity: number;
  estimatedUsage: number;
  plant: string;
  description: string;
  lowerBoundInventory: number;
  imageUrl: string;
  [key: string]: string | number; // for dynamic sorting
};

interface UseSparePartsParams {
  search?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  plant?: string;
}

export function useSpareParts({ search = '', pageIndex = 1, pageSize = 10, sortBy = 'sparePartName', sortOrder = 'asc', plant = '' }: UseSparePartsParams) {
  const [data, setData] = useState<SparePart[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allPlants, setAllPlants] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      const params = new URLSearchParams({
        search,
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
        ...(plant ? { plant } : {}),
      });
      fetch(`/api/spare-parts?${params.toString()}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((json) => {
          setData(json.data || []);
          setTotal(json.total || 0);
          // Extract all unique plants from the returned data for the filter dropdown
          const plants = Array.from(new Set((json.data || []).map((p: SparePart) => String(p.plant)).filter(Boolean))) as string[];
          setAllPlants(plants);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setData([]);
            setTotal(0);
            setAllPlants([]);
          }
        })
        .finally(() => setLoading(false));
    }, 300); // debounce
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, pageIndex, pageSize, sortBy, sortOrder, plant]);

  return { data, total, loading, allPlants };
}

// API Functions
export async function getAllSpareParts(params?: {
  search?: string;
  plant?: string;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.plant) searchParams.append('plant', params.plant);
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
  
  const res = await fetch(`/api/spare-parts?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch spare parts');
  return res.json();
}
