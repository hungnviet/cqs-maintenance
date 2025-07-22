"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DetailedMachineType } from '@/hooks/machine-types';

interface MachineFormData {
  machineName: string;
  machineCode: string;
  machineType: string;
  purchaseDate: string;
  plant: string;
  status: string;
  description: string;
  images: File[];
}

interface MachineBasicInfoProps {
  data: MachineFormData;
  onChange: (data: Partial<MachineFormData>) => void;
  machineType: DetailedMachineType | null;
}



const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Under Maintenance', label: 'Under Maintenance' }
];

export default function MachineBasicInfo({ data, onChange, machineType }: MachineBasicInfoProps) {
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (data.images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    const newImages = [...data.images, ...files];
    onChange({ images: newImages });

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index);
    onChange({ images: newImages });

    // Remove preview URL
    if (imagePreview[index]) {
      URL.revokeObjectURL(imagePreview[index]);
    }
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Selected Machine Type Info */}
      {machineType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Machine Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Type Name</Label>
                <p className="text-lg">{machineType.typeName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Type Code</Label>
                <p className="text-lg font-mono">{machineType.machineTypeCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="machineName">Machine Name *</Label>
              <Input
                id="machineName"
                placeholder="Enter machine name"
                value={data.machineName}
                onChange={(e) => onChange({ machineName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="machineCode">Machine Code *</Label>
              <Input
                id="machineCode"
                placeholder="Enter unique machine code"
                value={data.machineCode}
                onChange={(e) => onChange({ machineCode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plant">Plant *</Label>
              <Input
                id="plant"
                placeholder="Enter plant name"
                value={data.plant}
                onChange={(e) => onChange({ plant: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={data.status} onValueChange={(value) => onChange({ status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={data.purchaseDate}
                onChange={(e) => onChange({ purchaseDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter machine description (optional)"
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Images</CardTitle>
          <p className="text-sm text-gray-500">Upload up to 3 images of the machine</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Image Preview Grid */}
            {data.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {data.images.map((_, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      {imagePreview[index] ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={imagePreview[index]}
                            alt={`Machine image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                            priority
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {data.images.length < 3 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload machine images
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  PNG, JPG up to 10MB ({3 - data.images.length} remaining)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
