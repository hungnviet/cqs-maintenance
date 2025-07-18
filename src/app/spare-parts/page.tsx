'use client';
import { useState, useCallback } from 'react';
import SparePartsTable from '@/components/spare-parts/SparePartsTable';
import { useSpareParts } from '@/hooks/spare-parts';
import SearchBar from '@/components/spare-parts/SearchBar';
import SparePartForm from '@/components/spare-parts/Form';
import { Button } from '@/components/ui/button';
import type { SparePart } from '@/hooks/spare-parts';

export default function SparePartsPage() {
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('inventoryQuantity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [plant, setPlant] = useState('');
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSparePart, setSelectedSparePart] = useState<SparePart | null>(null);

  const { data, total, loading, allPlants } = useSpareParts({ search, pageIndex, pageSize, sortBy, sortOrder, plant });

  // Debounce search input
  const handleSearch = useCallback((value: string) => {
    setPageIndex(1);
    setSearch(value);
  }, []);

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPageIndex(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setPageIndex(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(1);
  };

  const handlePlantChange = (plant: string) => {
    setPlant(plant);
    setPageIndex(1);
  };

  const handleCreateNew = () => {
    setSelectedSparePart(null);
    setIsFormOpen(true);
  };

  const handleEditSparePart = (sparePart: SparePart) => {
    setSelectedSparePart(sparePart);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSparePart(null);
  };

  const handleFormSubmit = async (formData: Partial<SparePart>, imageFile?: File) => {
    try {
      const formDataToSend = new FormData();
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      formDataToSend.append('data', JSON.stringify(formData));

      const url = selectedSparePart 
        ? `/api/spare-parts/${selectedSparePart.sparePartCode}`
        : '/api/spare-parts';
      
      const method = selectedSparePart ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to save spare part');
      }

      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error saving spare part:', error);
      throw error;
    }
  };

  return (
    <div className='p-6'>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Spare Parts</h2>
        <Button onClick={handleCreateNew} className='cursor-pointer'>
          Create New Spare Part
        </Button>
      </div>
      
      <div className="mb-4 flex gap-4 items-center">
        <SearchBar 
          value={search} 
          onChange={handleSearch}
          allPlants={allPlants}
          plant={plant}
          onPlantChange={handlePlantChange}
        />
      </div>
      
      <SparePartsTable
        data={data}
        loading={loading}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        onRowClick={handleEditSparePart}
      />

      <SparePartForm
        sparePart={selectedSparePart}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
} 