import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImagePreview from '@/components/ImagePreview';
import type { SparePart } from '@/hooks/spare-parts';

interface SparePartFormProps {
  sparePart: SparePart | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SparePart>, imageFile?: File) => Promise<void>;
}

export default function SparePartForm({ sparePart, isOpen, onClose, onSubmit }: SparePartFormProps) {
  const [formData, setFormData] = useState<Partial<SparePart>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = sparePart !== null;

  useEffect(() => {
    if (sparePart) {
      setFormData(sparePart);
    } else {
      setFormData({
        sparePartCode: '',
        sparePartName: '',
        sparePartPrice: 0,
        supplierName: '',
        supplierPhone: '',
        supplierAddress: '',
        supplierEmail: '',
        transportTime: 0,
        inventoryQuantity: 0,
        estimatedUsage: 0,
        plant: '',
        description: '',
        lowerBoundInventory: 0,
        imageUrl: '',
      });
    }
    setImageFile(null);
    setErrors({});
  }, [sparePart]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.sparePartCode?.trim()) {
      newErrors.sparePartCode = 'Spare part code is required';
    }
    if (!formData.sparePartName?.trim()) {
      newErrors.sparePartName = 'Spare part name is required';
    }
    if (!formData.supplierName?.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    }
    if (!formData.plant?.trim()) {
      newErrors.plant = 'Plant is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, imageFile || undefined);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SparePart, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="!max-w-none w-[90vw] max-h-[90vh] w-[90vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Spare Part' : 'Create New Spare Part'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-6 ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Spare Part Code {!isEditMode && '*'}
                </label>
                <input
                  type="text"
                  value={formData.sparePartCode || ''}
                  onChange={(e) => handleInputChange('sparePartCode', e.target.value)}
                  disabled={isEditMode}
                  className={`w-full border rounded px-4 py-3 ${errors.sparePartCode ? 'border-red-500' : ''}`}
                />
                {errors.sparePartCode && <p className="text-red-500 text-sm mt-1">{errors.sparePartCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Spare Part Name *</label>
                <input
                  type="text"
                  value={formData.sparePartName || ''}
                  onChange={(e) => handleInputChange('sparePartName', e.target.value)}
                  className={`w-full border rounded px-4 py-3 ${errors.sparePartName ? 'border-red-500' : ''}`}
                />
                {errors.sparePartName && <p className="text-red-500 text-sm mt-1">{errors.sparePartName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Plant *</label>
                <input
                  type="text"
                  value={formData.plant || ''}
                  onChange={(e) => handleInputChange('plant', e.target.value)}
                  className={`w-full border rounded px-4 py-3 ${errors.plant ? 'border-red-500' : ''}`}
                />
                {errors.plant && <p className="text-red-500 text-sm mt-1">{errors.plant}</p>}
              </div>
            </div>

            {/* Pricing and Inventory */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Pricing & Inventory</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sparePartPrice || ''}
                  onChange={(e) => handleInputChange('sparePartPrice', parseFloat(e.target.value) || 0)}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Inventory Quantity</label>
                <input
                  type="number"
                  value={formData.inventoryQuantity || ''}
                  onChange={(e) => handleInputChange('inventoryQuantity', parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lower Bound Inventory</label>
                <input
                  type="number"
                  value={formData.lowerBoundInventory || ''}
                  onChange={(e) => handleInputChange('lowerBoundInventory', parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estimated Usage</label>
                <input
                  type="number"
                  value={formData.estimatedUsage || ''}
                  onChange={(e) => handleInputChange('estimatedUsage', parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Transport Time (days)</label>
                <input
                  type="number"
                  value={formData.transportTime || ''}
                  onChange={(e) => handleInputChange('transportTime', parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-4 py-3"
                />
              </div>
            </div>

            {/* Supplier Information */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Supplier Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Supplier Name *</label>
                <input
                  type="text"
                  value={formData.supplierName || ''}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                  className={`w-full border rounded px-4 py-3 ${errors.supplierName ? 'border-red-500' : ''}`}
                />
                {errors.supplierName && <p className="text-red-500 text-sm mt-1">{errors.supplierName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Supplier Phone</label>
                <input
                  type="tel"
                  value={formData.supplierPhone || ''}
                  onChange={(e) => handleInputChange('supplierPhone', e.target.value)}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Supplier Email</label>
                <input
                  type="email"
                  value={formData.supplierEmail || ''}
                  onChange={(e) => handleInputChange('supplierEmail', e.target.value)}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Supplier Address</label>
                <textarea
                  value={formData.supplierAddress || ''}
                  onChange={(e) => handleInputChange('supplierAddress', e.target.value)}
                  rows={2}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border rounded px-4 py-3"
                  disabled={isEditMode}
                />
                {formData.imageUrl && (
                  <ImagePreview src={formData.imageUrl} alt={formData.sparePartName} />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
