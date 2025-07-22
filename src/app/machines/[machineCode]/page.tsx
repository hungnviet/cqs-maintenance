"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { getMachineDetail, MachineDetail } from '@/hooks/machine';
import MachineGeneralInfo from '@/components/machine/MachineGeneralInfo';
import MachineMaintenanceTemplates from '@/components/machine/MachineMaintenanceTemplates';

export default function MachineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const machineCode = params.machineCode as string;
  
  const [machine, setMachine] = useState<MachineDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMachine = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMachineDetail(machineCode);
      if (response.success) {
        setMachine(response.data);
      } else {
        toast.error('Failed to load machine');
        router.push('/machines');
      }
    } catch (error) {
      console.error('Error loading machine:', error);
      toast.error('Failed to load machine');
      router.push('/machines');
    } finally {
      setLoading(false);
    }
  }, [machineCode, router]);

  useEffect(() => {
    loadMachine();
  }, [loadMachine]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Machine not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{machine.machineName}</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-500">Code: {machine.machineCode}</p>
              <Badge className={getStatusColor(machine.status)}>
                {machine.status}
              </Badge>
              <p className="text-gray-500">
                Type: {machine.machineType.typeName}
              </p>
            </div>
          </div>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/machines/${machine.machineCode}/schedule`)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Manage Schedule
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/machines/${machine.machineCode}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General Information
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Maintenance Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <MachineGeneralInfo machine={machine} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <MachineMaintenanceTemplates machineCode={machine.machineCode} machine={machine} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
