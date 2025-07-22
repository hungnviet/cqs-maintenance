"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAllMachineTypes, MachineType } from '@/hooks/machine-types';
import { toast } from 'sonner';

interface MachineTypeSelectionProps {
  selectedType: MachineType | null;
  onSelect: (machineType: MachineType) => void;
}

export default function MachineTypeSelection({ selectedType, onSelect }: MachineTypeSelectionProps) {
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMachineTypes();
  }, []); // This will re-run when component key changes

  const loadMachineTypes = async () => {
    try {
      setLoading(true);
      const response = await getAllMachineTypes();
      if (response.success) {
        setMachineTypes(response.data || []);
      } else {
        toast.error('Failed to load machine types');
      }
    } catch {
      toast.error('Failed to load machine types');
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = machineTypes.filter(type =>
    type.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.machineTypeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading machine types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search machine types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Machine Types Grid */}
      {filteredTypes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No machine types found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search terms or create a new machine type
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTypes.map((type) => (
            <Card
              key={type._id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedType?._id === type._id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:border-gray-400'
              }`}
              onClick={() => onSelect(type)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{type.typeName}</h3>
                  <Badge variant="secondary">
                    {type.totalMachines} machines
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-500 mb-3">
                  Code: {type.machineTypeCode}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
