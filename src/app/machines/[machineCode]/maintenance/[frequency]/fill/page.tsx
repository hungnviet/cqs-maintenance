"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getMachineDetail, getMachineMaintenanceTemplates } from '@/hooks/machine';
import MaintenanceFormFiller from '@/components/machine/MaintenanceFormFiller';

interface MachineDetail {
  _id: string;
  machineName: string;
  machineCode: string;
  machineType: {
    typeName: string;
    machineTypeCode: string;
  };
  images: string[];
}

interface MaintenanceTemplate {
  frequency: string;
  groups: Array<{
    groupTitle: string;
    requirements: Array<{
      titleEng: string;
      titleVn: string;
    }>;
  }>;
}

export default function MaintenanceFillPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const machineCode = params.machineCode as string;
  const frequency = params.frequency as string;
  const scheduleId = searchParams.get('scheduleId');
  
  const [machine, setMachine] = useState<MachineDetail | null>(null);
  const [template, setTemplate] = useState<MaintenanceTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Validate that scheduleId is provided
      if (!scheduleId) {
        toast.error('Schedule ID is required');
        router.push(`/machines/${machineCode}/schedule`);
        return;
      }
      
      // Load machine details
      const machineResponse = await getMachineDetail(machineCode);
      if (!machineResponse.success) {
        toast.error('Failed to load machine details');
        router.push('/machines');
        return;
      }
      
      setMachine(machineResponse.data);
      
      // Load maintenance templates
      const templatesResponse = await getMachineMaintenanceTemplates(machineCode);
      if (templatesResponse.success) {
        const targetTemplate = templatesResponse.data.find(
          (t: MaintenanceTemplate) => t.frequency === frequency
        );
        
        if (targetTemplate) {
          setTemplate(targetTemplate);
        } else {
          toast.error(`No ${frequency} maintenance template found`);
          router.push(`/machines/${machineCode}`);
        }
      } else {
        toast.error('Failed to load maintenance templates');
        router.push(`/machines/${machineCode}`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      router.push(`/machines/${machineCode}`);
    } finally {
      setLoading(false);
    }
  }, [scheduleId, machineCode, frequency, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveForm = async (formData: {
    date: string;
    maintenanceStartTime: string;
    maintenanceEndTime: string;
    maintenanceOperatorNumber: string;
    preparedBy: string;
    checkedBy: string;
    approvedBy: string;
    remarks: string;
    groups: {
      groupTitle: string;
      requirements: {
        titleEng: string;
        titleVn: string;
        accepted: boolean;
        note: string;
      }[];
    }[];
  }) => {
    try {
      setSaving(true);
      
      // Convert time strings to Date objects
      const processedFormData = {
        ...formData,
        maintenanceStartTime: formData.maintenanceStartTime 
          ? new Date(`${formData.date}T${formData.maintenanceStartTime}:00`)
          : null,
        maintenanceEndTime: formData.maintenanceEndTime 
          ? new Date(`${formData.date}T${formData.maintenanceEndTime}:00`)
          : null,
        date: new Date(formData.date)
      };
      
      const response = await fetch('/api/maintenance-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine: machine?._id,
          frequency,
          scheduleId, // Pass the specific schedule ID
          ...processedFormData
        })
      });
      
      if (response.ok) {
        toast.success('Maintenance form saved successfully');
        router.push(`/machines/${machineCode}/schedule`);
      } else {
        toast.error('Failed to save maintenance form');
      }
    } catch (error) {
      console.error('Error saving maintenance form:', error);
      toast.error('Failed to save maintenance form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading maintenance form...</p>
        </div>
      </div>
    );
  }

  if (!machine || !template) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Form not found</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/machines')}
            className="mt-4"
          >
            Back to Machines
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/machines/${machineCode}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Machine
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {machine.machineName} {frequency} Maintenance
            </h1>
            <p className="text-gray-500">
              Fill out the {frequency.toLowerCase()} maintenance checklist
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <MaintenanceFormFiller
        machine={machine}
        template={template}
        frequency={frequency}
        onSave={handleSaveForm}
        saving={saving}
      />
    </div>
  );
}
