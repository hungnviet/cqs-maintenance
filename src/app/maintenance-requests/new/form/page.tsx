"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import MaintenanceRequestForm from '@/components/machine/MaintenanceRequestForm';

interface Machine {
  _id: string;
  machineName: string;
  machineCode: string;
  machineType: {
    typeName: string;
    machineTypeCode: string;
  };
}

interface MaintenanceRequestFormData {
  area: string;
  date: string;
  shift: string;
  partsName: string;
  partsNumber: string;
  operatorName: string;
  operatorNumber: string;
  breakdownStartTime: string;
  priority: 'Normal' | 'High';
  serviceRequestForm: 'Machine Maintenance' | 'Mold Maintenance';
  problemDescription: string;
  requestedBy: string;
  receivedBy: string;
}

export default function NewMaintenanceRequestFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const machineCode = searchParams.get('machineCode');
  
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMachine = async () => {
      if (!machineCode) {
        toast.error('No machine selected');
        router.push('/maintenance-requests/new');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/machines/${machineCode}`);
        const data = await response.json();
        
        if (data.success) {
          setMachine(data.data);
        } else {
          toast.error('Machine not found');
          router.push('/maintenance-requests/new');
        }
      } catch (error) {
        console.error('Error fetching machine:', error);
        toast.error('Failed to load machine details');
        router.push('/maintenance-requests/new');
      } finally {
        setLoading(false);
      }
    };

    fetchMachine();
  }, [machineCode, router]);

  const handleSubmit = async (formData: MaintenanceRequestFormData) => {
    try {
      setSaving(true);
      
      // Convert breakdownStartTime to proper format
      const processedData = {
        ...formData,
        machine: machine?._id,
        breakdownStartTime: new Date(formData.breakdownStartTime),
        date: new Date(formData.date)
      };
      
      const response = await fetch('/api/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        toast.success('Maintenance request created successfully');
        router.push('/maintenance-requests');
      } else {
        toast.error(responseData.error || 'Failed to create maintenance request');
      }
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      toast.error('Failed to create maintenance request');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading machine details...</p>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Machine not found</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/maintenance-requests/new')}
            className="mt-4"
          >
            Back to Machine Selection
          </Button>
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
            onClick={() => router.push('/maintenance-requests/new')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Machine Selection
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Maintenance Request</h1>
            <p className="text-gray-500">
              Machine: {machine.machineName} ({machine.machineCode})
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <MaintenanceRequestForm
        machine={machine}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}
