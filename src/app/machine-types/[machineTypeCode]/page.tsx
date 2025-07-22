"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Edit, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getMachineTypeDetail, 
  deleteMachineType, 
  MachineTypeData 
} from '@/hooks/machine-types';
import MachineTypeForm from '@/components/machine-types/MachineTypeForm';
import MaintenanceFormViewer from '@/components/machine-types/MaintenanceFormViewer';

export default function MachineTypeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const machineTypeCode = params.machineTypeCode as string;
  
  const [machineType, setMachineType] = useState<MachineTypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadMachineType = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMachineTypeDetail(machineTypeCode);
      if (response.success) {
        setMachineType(response.data);
      } else {
        toast.error('Failed to load machine type');
        router.push('/machine-types');
      }
    } catch (error) {
      console.error('Error loading machine type:', error);
      toast.error('Failed to load machine type');
      router.push('/machine-types');
    } finally {
      setLoading(false);
    }
  }, [machineTypeCode, router]);

  useEffect(() => {
    loadMachineType();
  }, [loadMachineType]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this machine type? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteMachineType(machineTypeCode);
      toast.success('Machine type deleted successfully');
      router.push('/machine-types');
    } catch (error) {
      console.error('Error deleting machine type:', error);
      toast.error('Failed to delete machine type');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!machineType) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Machine type not found</div>
      </div>
    );
  }

  if (editMode) {
    return (
      <MachineTypeForm 
        machineType={machineType} 
        mode="edit" 
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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
            <h1 className="text-3xl font-bold">{machineType.typeName}</h1>
            <p className="text-gray-500">Code: {machineType.machineTypeCode}</p>
          </div>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setEditMode(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className='cursor-pointer'>Overview</TabsTrigger>
          <TabsTrigger value="specifications" className='cursor-pointer'>Specifications</TabsTrigger>
          <TabsTrigger value="daily" className='cursor-pointer'>Daily</TabsTrigger>
          <TabsTrigger value="weekly" className='cursor-pointer'>Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className='cursor-pointer'>Monthly</TabsTrigger>
          <TabsTrigger value="half-yearly" className='cursor-pointer'>Half-Yearly</TabsTrigger>
          <TabsTrigger value="yearly" className='cursor-pointer'>Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type Name</label>
                  <p className="text-lg">{machineType.typeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Machine Type Code</label>
                  <p className="text-lg font-mono">{machineType.machineTypeCode}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-lg">{machineType.description || 'No description provided'}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{machineType.specificationTemplate?.length || 0}</p>
                  <p className="text-sm text-gray-500">Specification Fields</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{machineType.templates?.length || 0}</p>
                  <p className="text-sm text-gray-500">Maintenance Templates</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {machineType.templates?.reduce((acc, template) => acc + template.groups.reduce((groupAcc, group) => groupAcc + group.requirements.length, 0), 0) || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Requirements</p>
                </div>
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
              {machineType.specificationTemplate && machineType.specificationTemplate.length > 0 ? (
                <div className="grid gap-3">
                  {machineType.specificationTemplate.map((spec, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{spec.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No specification fields defined</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          {machineType.templates && machineType.templates.length > 0 ? (
            machineType.templates.map((template) => (
              <MaintenanceFormViewer
                key={template.frequency}
                frequency={template.frequency}
                groups={template.groups}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <p>No maintenance templates defined</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Individual maintenance template tabs */}
        <TabsContent value="daily" className="space-y-4">
          {machineType.templates ? (
            <MaintenanceFormViewer
              frequency="Daily"
              groups={machineType.templates.find(t => t.frequency === 'Daily')?.groups || []}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <p>No daily maintenance template defined</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {machineType.templates ? (
            <MaintenanceFormViewer
              frequency="Weekly"
              groups={machineType.templates.find(t => t.frequency === 'Weekly')?.groups || []}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <p>No weekly maintenance template defined</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {machineType.templates ? (
            <MaintenanceFormViewer
              frequency="Monthly"
              groups={machineType.templates.find(t => t.frequency === 'Monthly')?.groups || []}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <p>No monthly maintenance template defined</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="half-yearly" className="space-y-4">
          {machineType.templates ? (
            <MaintenanceFormViewer
              frequency="Half-Yearly"
              groups={machineType.templates.find(t => t.frequency === 'Half-Yearly')?.groups || []}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <p>No half-yearly maintenance template defined</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          {machineType.templates ? (
            <MaintenanceFormViewer
              frequency="Yearly"
              groups={machineType.templates.find(t => t.frequency === 'Yearly')?.groups || []}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <p>No yearly maintenance template defined</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}