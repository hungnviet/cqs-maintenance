"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import MaintenanceFormViewer from '@/components/machine/MaintenanceFormViewer';

interface CompletedForm {
  _id: string;
  machine: {
    machineName: string;
    machineCode: string;
    machineType: {
      typeName: string;
    };
    images: string[];
  };
  frequency: string;
  date: string;
  maintenanceStartTime: string;
  maintenanceEndTime: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  remarks: string;
  maintenanceOperatorNumber: number; // Added property
  groups: Array<{
    groupTitle: string;
    requirements: Array<{
      titleEng: string;
      titleVn: string;
      accepted: boolean;
      note: string;
    }>;
  }>;
  filledAt: string;
}

export default function MaintenanceViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const machineCode = params.machineCode as string;
  const frequency = params.frequency as string;
  const formId = searchParams.get('formId');
  
  const [form, setForm] = useState<CompletedForm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    if (!formId) {
      toast.error('Form ID not provided');
      router.push(`/machines/${machineCode}`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/maintenance-forms/${formId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setForm(data.data);
        } else {
          toast.error('Failed to load maintenance form');
          router.push(`/machines/${machineCode}`);
        }
      } else {
        toast.error('Failed to load maintenance form');
        router.push(`/machines/${machineCode}`);
      }
    } catch (error) {
      toast.error('Failed to load maintenance form');
      router.push(`/machines/${machineCode}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = async () => {
    // Implementation for PDF download would go here
    toast.info('PDF download feature coming soon');
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

  if (!form) {
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
    <div className="p-6 flex justify-center bg-gray-50">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/machines/${machineCode}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Machine
            </Button>
            <div>
              <p className=" font-bold">
                {form.machine.machineName} {frequency} Maintenance
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Form Viewer */}
        <MaintenanceFormViewer form={form} />
      </div>
    </div>
  );
}
