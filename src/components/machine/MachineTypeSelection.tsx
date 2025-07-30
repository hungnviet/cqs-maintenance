"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

      {/* Machine Types Table */}
      {filteredTypes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No machine types found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search terms or create a new machine type
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Machine Type Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Total Machines</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTypes.map((type) => (
                <TableRow
                  key={type._id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedType?._id === type._id 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                      : ''
                  }`}
                  onClick={() => onSelect(type)}
                >
                  <TableCell className="font-medium">
                    {type.typeName}
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {type.machineTypeCode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {type.totalMachines} machines
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {type.description || 'No description'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
