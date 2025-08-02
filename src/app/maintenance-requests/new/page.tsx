"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Machine {
  _id: string;
  machineName: string;
  machineCode: string;
  machineType: {
    _id: string;
    typeName: string;
    machineTypeCode: string;
  };
  status: string;
  plant: string;
}

export default function NewMaintenanceRequestPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/machines');
      const data = await response.json();
      
      if (data.success) {
        setMachines(data.data);
      } else {
        toast.error('Failed to fetch machines');
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast.error('Failed to fetch machines');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const handleMachineSelect = (machine: Machine) => {
    setSelectedMachine(machine);
    // Navigate to the form page with selected machine using machineCode
    router.push(`/maintenance-requests/new/form?machineCode=${machine.machineCode}`);
  };

  const filteredMachines = machines.filter(machine =>
    machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.machineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.machineType.typeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading machines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/maintenance-requests')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Maintenance Request</h1>
            <p className="text-gray-500">Select a machine to create a maintenance request</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Machines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by machine name, code, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Machines List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Machines ({filteredMachines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMachines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No machines found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine Name</TableHead>
                    <TableHead>Machine Code</TableHead>
                    <TableHead>Machine Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMachines.map((machine) => (
                    <TableRow 
                      key={machine._id}
                      className="hover:bg-gray-50 "
                    >
                      <TableCell className="font-medium">
                        {machine.machineName}
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {machine.machineCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{machine.machineType.typeName}</div>
                          <div className="text-sm text-gray-500">{machine.machineType.machineTypeCode}</div>
                        </div>
                      </TableCell>
                      <TableCell> Plant {machine.plant || 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={machine.status === 'Active' ? 'default' : 'secondary'}
                        >
                          {machine.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className='cursor-pointer'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMachineSelect(machine);
                          }}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
