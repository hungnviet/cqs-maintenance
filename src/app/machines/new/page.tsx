"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getMachineTypeDetail, MachineType, DetailedMachineType } from '@/hooks/machine-types';
import { createMachine } from '@/hooks/machine';
import MachineTypeSelection from '@/components/machine/MachineTypeSelection';
import MachineBasicInfo from '@/components/machine/MachineBasicInfo';
import MachineSpecifications from '@/components/machine/MachineSpecifications';
import MachineMaintenanceCustomization from '@/components/machine/MachineMaintenanceCustomization';
import MachineSparePartsSelection from '@/components/machine/MachineSparePartsSelection';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface MaintenanceTemplate {
  frequency: string;
  groups: {
    groupTitle: string;
    requirements: {
      titleEng: string;
      titleVn: string;
      note?: string;
    }[];
  }[];
}

interface MachineFormData {
  machineName: string;
  machineCode: string;
  machineType: string;
  purchaseDate: string;
  plant: string;
  status: string;
  description: string;
  specifications: { title: string; value: string }[];
  images: File[];
  maintenanceTemplates: MaintenanceTemplate[];
  sparePartMaintenance: { frequencies: string[]; sparePart: string; quantity: number }[];
}

const steps = [
  { id: 1, title: 'Select Machine Type', description: 'Choose the type of machine you want to create' },
  { id: 2, title: 'Basic Information', description: 'Enter basic machine details' },
  { id: 3, title: 'Specifications', description: 'Fill in machine specifications' },
  { id: 4, title: 'Maintenance Templates', description: 'Customize maintenance templates' },
  { id: 5, title: 'Spare Parts', description: 'Select spare parts for maintenance' },
];

function NewMachinePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This makes the page dynamic
  
  // Force dynamic rendering by accessing window object
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedMachineType, setSelectedMachineType] = useState<MachineType | null>(null);
  const [detailedMachineType, setDetailedMachineType] = useState<DetailedMachineType | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState<MachineFormData>({
    machineName: '',
    machineCode: '',
    machineType: '',
    purchaseDate: '',
    plant: '',
    status: 'Active',
    description: '',
    specifications: [],
    images: [],
    maintenanceTemplates: [],
    sparePartMaintenance: [],
  });
  
  useEffect(() => {
    // This will only run on the client, forcing dynamic behavior
    if (typeof window !== 'undefined') {
      setIsHydrated(true);
    }
  }, []);
  
  // Use searchParams to initialize from URL (makes it truly dynamic)
  useEffect(() => {
    if (searchParams && isHydrated) {
      const urlStep = parseInt(searchParams.get('step') || '1');
      setCurrentStep(urlStep);
    }
  }, [searchParams, isHydrated]);

  // Reset form when refresh trigger changes (useful if machine types get updated)
  useEffect(() => {
    if (refreshTrigger > 0) {
      setSelectedMachineType(null);
      setDetailedMachineType(null);
      setCurrentStep(1);
    }
  }, [refreshTrigger]);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  const updateFormData = (newData: Partial<MachineFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Add refresh mechanism for dynamic data loading
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Refreshing machine types and spare parts...');
  };

  const handleMachineTypeSelection = async (machineType: MachineType) => {
    setSelectedMachineType(machineType);
    
    try {
      setLoadingDetails(true);
      const response = await getMachineTypeDetail(machineType.machineTypeCode);
      
      if (response.success) {
        const detailedType = response.data;
        setDetailedMachineType(detailedType);
        
        // Update form data with specifications and templates
        updateFormData({
          machineType: machineType._id,
          specifications: (detailedType.specificationTemplate || []).map((spec: { title: string }) => ({
            title: spec.title,
            value: ''
          })),
          maintenanceTemplates: detailedType.templates || []
        });
      } else {
        toast.error('Failed to load machine type details');
      }
    } catch {
      toast.error('Failed to load machine type details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add images
      formData.images.forEach((file, index) => {
        submitData.append(`image${index}`, file);
      });
      
      // Add other data as JSON
      const machineData = {
        machineName: formData.machineName,
        machineCode: formData.machineCode,
        machineType: formData.machineType,
        purchaseDate: formData.purchaseDate,
        plant: formData.plant,
        status: formData.status,
        description: formData.description,
        specifications: formData.specifications,
        sparePartMaintenance: formData.sparePartMaintenance,
        templates: formData.maintenanceTemplates,
      };
      submitData.append('data', JSON.stringify(machineData));
      
      const response = await createMachine(submitData);
      
      if (response.success) {
        toast.success('Machine created successfully');
        router.push(`/machines/${formData.machineCode}`);
      } else {
        toast.error(response.error || 'Failed to create machine');
      }
    } catch {
      toast.error('Failed to create machine');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedMachineType !== null && detailedMachineType !== null && !loadingDetails;
      case 2:
        return formData.machineName && formData.machineCode && formData.plant;
      case 3:
        return formData.specifications.every(spec => spec.value.trim() !== '');
      case 4:
        return formData.maintenanceTemplates.length === 5;
      case 5:
        return true; // Spare parts are optional
      default:
        return false;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/machines')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Machines
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Machine</h1>
            <p className="text-gray-500">Step {currentStep} of {steps.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={refreshData}
            disabled={loadingDetails}
            title="Refresh machine types"
          >
            <RefreshCw className={`h-4 w-4 ${loadingDetails ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                ${currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
                }
              `}>
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {step.id < steps.length && (
                <div className={`
                  w-20 h-0.5 mx-4 transition-colors
                  ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <h2 className="text-xl font-semibold">{steps[currentStep - 1].title}</h2>
          <p className="text-gray-500">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <MachineTypeSelection
                selectedType={selectedMachineType}
                onSelect={handleMachineTypeSelection}
                key={refreshTrigger} // Force re-render to fetch latest data
              />
              {loadingDetails && (
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading machine type details...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <MachineBasicInfo
              data={formData}
              onChange={updateFormData}
              machineType={detailedMachineType}
            />
          )}

          {currentStep === 3 && (
            <MachineSpecifications
              specifications={formData.specifications}
              onChange={(specifications: { title: string; value: string }[]) => updateFormData({ specifications })}
            />
          )}

          {currentStep === 4 && (
            <MachineMaintenanceCustomization
              machineType={detailedMachineType}
              templates={formData.maintenanceTemplates}
              onChange={(maintenanceTemplates: MaintenanceTemplate[]) => updateFormData({ maintenanceTemplates })}
            />
          )}

          {currentStep === 5 && (
            <MachineSparePartsSelection
              sparePartMaintenance={formData.sparePartMaintenance}
              onChange={(sparePartMaintenance: { frequencies: string[]; sparePart: string; quantity: number }[]) => updateFormData({ sparePartMaintenance })}
              plant={formData.plant}
              key={`spare-parts-${refreshTrigger}`} // Force re-render to fetch latest data
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep === steps.length ? (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
          >
            {loading ? 'Creating...' : 'Create Machine'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewMachinePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewMachinePageContent />
    </Suspense>
  );
}
