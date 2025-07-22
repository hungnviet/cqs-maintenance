"use client";

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SparePart {
  _id: string;
  sparePartCode: string;
  sparePartName: string;
  sparePartPrice: number;
  supplierName: string;
  inventoryQuantity: number;
  plant: string;
  imageUrl?: string;
}

interface SparePartMaintenance {
  frequencies: string[];
  sparePart: string;
  quantity: number;
}

interface MachineSparePartsSelectionProps {
  sparePartMaintenance: SparePartMaintenance[];
  onChange: (sparePartMaintenance: SparePartMaintenance[]) => void;
  plant: string;
}

const frequencies = ['Daily', 'Weekly', 'Monthly', 'Half-Yearly', 'Yearly'];

export default function MachineSparePartsSelection({ 
  sparePartMaintenance, 
  onChange 
}: MachineSparePartsSelectionProps) {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSparePartSelector, setShowSparePartSelector] = useState(false);

  const loadSpareParts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('pageSize', '50'); // Get more results for selection
      
      const response = await fetch(`/api/spare-parts?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSpareParts(data.data || []);
      } else {
        toast.error('Failed to load spare parts');
      }
    } catch (err) {
      console.error('Error loading spare parts:', err);
      toast.error('Failed to load spare parts');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      loadSpareParts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [loadSpareParts]);

  // Load spare parts initially
  useEffect(() => {
    loadSpareParts();
  }, [loadSpareParts]);

  const addSparePartMaintenance = (sparePartId: string) => {
    const newItem: SparePartMaintenance = {
      frequencies: ['Monthly'],
      sparePart: sparePartId,
      quantity: 1,
    };
    onChange([...sparePartMaintenance, newItem]);
    setShowSparePartSelector(false);
  };

  const updateSparePartMaintenance = (index: number, field: keyof SparePartMaintenance, value: string | number | string[]) => {
    const updated = sparePartMaintenance.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const toggleFrequency = (index: number, frequency: string) => {
    const item = sparePartMaintenance[index];
    const currentFrequencies = item.frequencies || [];
    
    let newFrequencies: string[];
    if (currentFrequencies.includes(frequency)) {
      // Remove frequency
      newFrequencies = currentFrequencies.filter(f => f !== frequency);
    } else {
      // Add frequency
      newFrequencies = [...currentFrequencies, frequency];
    }
    
    // Ensure at least one frequency is selected
    if (newFrequencies.length === 0) {
      toast.error('At least one frequency must be selected');
      return;
    }
    
    updateSparePartMaintenance(index, 'frequencies', newFrequencies);
  };

  const removeSparePartMaintenance = (index: number) => {
    const updated = sparePartMaintenance.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getSparePartById = (id: string) => {
    return spareParts.find(sp => sp._id === id);
  };

  const getSelectedSparePartIds = () => {
    return sparePartMaintenance.map(item => item.sparePart);
  };

  const availableSpareParts = spareParts.filter(sp => 
    !getSelectedSparePartIds().includes(sp._id)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spare Parts for Maintenance</CardTitle>
          <p className="text-sm text-gray-500">
            Select spare parts that will be needed for regular maintenance of this machine
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Selections */}
          {sparePartMaintenance.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Selected Spare Parts</Label>
              {sparePartMaintenance.map((item, index) => {
                const sparePart = getSparePartById(item.sparePart);
                return (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        {/* Spare Part Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-gray-500">Spare Part</Label>
                            <p className="font-medium">{sparePart?.sparePartName || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{sparePart?.sparePartCode}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-gray-500">Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateSparePartMaintenance(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="h-8 mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs text-gray-500">Available Stock</Label>
                            <Badge variant="secondary" className="mt-1">
                              {sparePart?.inventoryQuantity || 0} units
                            </Badge>
                          </div>
                        </div>

                        {/* Frequencies Selection */}
                        <div>
                          <Label className="text-xs text-gray-500 mb-2 block">Maintenance Frequencies</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {frequencies.map((freq) => (
                              <div key={freq} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`freq-${index}-${freq}`}
                                  checked={item.frequencies.includes(freq)}
                                  onCheckedChange={() => toggleFrequency(index, freq)}
                                />
                                <Label
                                  htmlFor={`freq-${index}-${freq}`}
                                  className="text-xs cursor-pointer"
                                >
                                  {freq}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {item.frequencies.map((freq) => (
                                <Badge key={freq} variant="outline" className="text-xs">
                                  {freq}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSparePartMaintenance(index)}
                        className="text-red-600 hover:text-red-700 mt-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add New Spare Part */}
          {!showSparePartSelector ? (
            <Button 
              onClick={() => setShowSparePartSelector(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Spare Part for Maintenance
            </Button>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Spare Part</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSparePartSelector(false)}
                >
                  Cancel
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search spare parts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Spare Parts List */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading spare parts...</p>
                </div>
              ) : availableSpareParts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No available spare parts found</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-400 mt-1">
                      No results for &quot;{searchTerm}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {availableSpareParts.map((sparePart) => (
                    <div
                      key={sparePart._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => addSparePartMaintenance(sparePart._id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {sparePart.imageUrl && (
                            <div className="relative w-10 h-10 rounded overflow-hidden">
                              <Image
                                src={sparePart.imageUrl}
                                alt={sparePart.sparePartName}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{sparePart.sparePartName}</p>
                            <p className="text-sm text-gray-500">{sparePart.sparePartCode}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${sparePart.sparePartPrice}</p>
                        <Badge variant={sparePart.inventoryQuantity > 0 ? "secondary" : "destructive"}>
                          Stock: {sparePart.inventoryQuantity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {sparePartMaintenance.length === 0 && !showSparePartSelector && (
            <div className="text-center py-8 text-gray-500">
              <p>No spare parts selected for maintenance</p>
              <p className="text-sm text-gray-400 mt-1">
                Add spare parts that will be regularly used for this machine&apos;s maintenance
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
