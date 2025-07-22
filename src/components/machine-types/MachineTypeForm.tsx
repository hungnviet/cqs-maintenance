"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  MachineTypeData, 
  MaintenanceFormTemplate, 
  RequirementGroup,
  createMachineType, 
  updateMachineType 
} from '@/hooks/machine-types';

import SpecificationTemplateEditor from './SpecificationTemplateEditor';
import MaintenanceTemplateEditor from './MaintenanceTemplateEditor';



interface MachineTypeFormProps {
  machineType?: MachineTypeData | null;
  mode: 'create' | 'edit';
}

export default function MachineTypeForm({ machineType, mode }: MachineTypeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MachineTypeData>({
    typeName: '',
    machineTypeCode: '',
    description: '',
    specificationTemplate: [],
    templates: [
      { frequency: 'Daily', groups: [] },
      { frequency: 'Weekly', groups: [] },
      { frequency: 'Monthly', groups: [] },
      { frequency: 'Half-Yearly', groups: [] },
      { frequency: 'Yearly', groups: [] },
    ] as MaintenanceFormTemplate[],
  });

  useEffect(() => {
    if (machineType) {
      setFormData({
        typeName: machineType.typeName,
        machineTypeCode: machineType.machineTypeCode,
        description: machineType.description || '',
        specificationTemplate: machineType.specificationTemplate,
        templates: machineType.templates,
      });
    }
  }, [machineType]);

  const handleBasicInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecificationTemplateChange = (specifications: { title: string }[]) => {
    setFormData(prev => ({
      ...prev,
      specificationTemplate: specifications
    }));
  };

  const handleMaintenanceTemplateChange = (frequency: string, groups: RequirementGroup[]) => {
    setFormData(prev => ({
      ...prev,
      templates: prev.templates.map(template => 
        template.frequency === frequency 
          ? { ...template, groups }
          : template
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validation
      if (!formData.typeName.trim()) {
        toast.error('Type name is required');
        return;
      }
      if (!formData.machineTypeCode.trim()) {
        toast.error('Machine type code is required');
        return;
      }

      if (mode === 'create') {
        await createMachineType(formData);
        toast.success('Machine type created successfully');
      } else {
        await updateMachineType(formData.machineTypeCode, {
          typeName: formData.typeName,
          description: formData.description,
          specificationTemplate: formData.specificationTemplate,
          templates: formData.templates,
        });
        toast.success('Machine type updated successfully');
      }

      router.push('/machine-types');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Create New Machine Type' : 'Edit Machine Type'}
        </h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="half-yearly">Half-Yearly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typeName">Type Name *</Label>
                  <Input
                    id="typeName"
                    value={formData.typeName}
                    onChange={(e) => handleBasicInfoChange('typeName', e.target.value)}
                    placeholder="Enter type name"
                    disabled={mode === 'edit'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machineTypeCode">Machine Type Code *</Label>
                  <Input
                    id="machineTypeCode"
                    value={formData.machineTypeCode}
                    onChange={(e) => handleBasicInfoChange('machineTypeCode', e.target.value)}
                    placeholder="Enter machine type code"
                    disabled={mode === 'edit'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Specification Template</CardTitle>
            </CardHeader>
            <CardContent>
              <SpecificationTemplateEditor
                specifications={formData.specificationTemplate}
                onChange={handleSpecificationTemplateChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="space-y-6">
            {formData.templates.map((template) => (
              <Card key={template.frequency}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">{template.frequency} Maintenance Template</span>
                    <span className="text-sm text-gray-500">
                      ({template.groups.length} groups, {template.groups.reduce((acc, group) => acc + group.requirements.length, 0)} requirements)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MaintenanceTemplateEditor
                    frequency={template.frequency}
                    groups={template.groups}
                    onChange={(groups: RequirementGroup[]) => handleMaintenanceTemplateChange(template.frequency, groups)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual maintenance template tabs */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Maintenance Template</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceTemplateEditor
                frequency="Daily"
                groups={formData.templates.find(t => t.frequency === 'Daily')?.groups || []}
                onChange={(groups: RequirementGroup[]) => handleMaintenanceTemplateChange('Daily', groups)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Maintenance Template</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceTemplateEditor
                frequency="Weekly"
                groups={formData.templates.find(t => t.frequency === 'Weekly')?.groups || []}
                onChange={(groups: RequirementGroup[]) => handleMaintenanceTemplateChange('Weekly', groups)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Maintenance Template</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceTemplateEditor
                frequency="Monthly"
                groups={formData.templates.find(t => t.frequency === 'Monthly')?.groups || []}
                onChange={(groups: RequirementGroup[]) => handleMaintenanceTemplateChange('Monthly', groups)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="half-yearly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Half-Yearly Maintenance Template</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceTemplateEditor
                frequency="Half-Yearly"
                groups={formData.templates.find(t => t.frequency === 'Half-Yearly')?.groups || []}
                onChange={(groups: RequirementGroup[]) => handleMaintenanceTemplateChange('Half-Yearly', groups)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Maintenance Template</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceTemplateEditor
                frequency="Yearly"
                groups={formData.templates.find(t => t.frequency === 'Yearly')?.groups || []}
                onChange={(groups: RequirementGroup[]) => handleMaintenanceTemplateChange('Yearly', groups)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
