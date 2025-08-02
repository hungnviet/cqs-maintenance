"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MaintenanceRequest {
  _id: string;
  serialNumber: string;
  area: string;
  plant: string;
  machine: {
    _id: string;
    machineName: string;
    machineCode: string;
    machineType: {
      typeName: string;
    };
  };
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
  
  // Completion fields
  correctiveActionTaken?: string;
  breakdownFinishedDate?: string;
  doneBy?: string;
  breakdownEndTime?: string;
  totalStopHours?: number;
  maintenanceStatus?: 'Rectified' | 'Not Rectified';
  breakdownReviewedAndClosed?: boolean;
  comments?: string;
  others?: string;
  reviewedAndClosedBy?: string;
  
  // Department approvals
  engineering?: boolean;
  quality?: boolean;
  moldShopMaintenance?: boolean;
  production?: boolean;
  
  status: 'Pending' | 'In Progress' | 'Completed' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export default function EditMaintenanceRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<MaintenanceRequest>>({});

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/maintenance-requests/${requestId}`);
        const data = await response.json();
        
        if (data.success) {
          setRequest(data.data);
          // Initialize form data
          setFormData({
            area: data.data.area,
            date: data.data.date.split('T')[0],
            shift: data.data.shift,
            partsName: data.data.partsName,
            partsNumber: data.data.partsNumber || '',
            operatorName: data.data.operatorName,
            operatorNumber: data.data.operatorNumber || '',
            breakdownStartTime: data.data.breakdownStartTime ? 
              new Date(data.data.breakdownStartTime).toISOString().slice(0, 16) : '',
            priority: data.data.priority,
            serviceRequestForm: data.data.serviceRequestForm,
            problemDescription: data.data.problemDescription,
            requestedBy: data.data.requestedBy,
            receivedBy: data.data.receivedBy,
            correctiveActionTaken: data.data.correctiveActionTaken || '',
            breakdownFinishedDate: data.data.breakdownFinishedDate ? 
              data.data.breakdownFinishedDate.split('T')[0] : '',
            doneBy: data.data.doneBy || '',
            breakdownEndTime: data.data.breakdownEndTime ? 
              new Date(data.data.breakdownEndTime).toISOString().slice(0, 16) : '',
            totalStopHours: data.data.totalStopHours || 0,
            maintenanceStatus: data.data.maintenanceStatus || undefined,
            breakdownReviewedAndClosed: data.data.breakdownReviewedAndClosed || false,
            comments: data.data.comments || '',
            others: data.data.others || '',
            reviewedAndClosedBy: data.data.reviewedAndClosedBy || '',
            engineering: data.data.engineering || false,
            quality: data.data.quality || false,
            moldShopMaintenance: data.data.moldShopMaintenance || false,
            production: data.data.production || false,
            status: data.data.status
          });
        } else {
          toast.error('Maintenance request not found');
          router.push('/maintenance-requests');
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        toast.error('Failed to load maintenance request');
        router.push('/maintenance-requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId, router]);

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Process the data
      const processedData = {
        ...formData,
        date: formData.date ? new Date(formData.date) : undefined,
        breakdownStartTime: formData.breakdownStartTime ? 
          new Date(formData.breakdownStartTime) : undefined,
        breakdownFinishedDate: formData.breakdownFinishedDate ? 
          new Date(formData.breakdownFinishedDate) : undefined,
        breakdownEndTime: formData.breakdownEndTime ? 
          new Date(formData.breakdownEndTime) : undefined,
      };
      
      const response = await fetch(`/api/maintenance-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        toast.success('Maintenance request updated successfully');
        router.push(`/maintenance-requests/${requestId}`);
      } else {
        toast.error(responseData.error || 'Failed to update maintenance request');
      }
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      toast.error('Failed to update maintenance request');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading maintenance request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Maintenance request not found</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/maintenance-requests')}
            className="mt-4"
          >
            Back to Requests
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
            onClick={() => router.push(`/maintenance-requests/${requestId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Request
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Maintenance Request #{request.serialNumber}</h1>
            <p className="text-gray-500">
              Machine: {request.machine.machineName} ({request.machine.machineCode})
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Area/Unit</Label>
                <Input
                  value={formData.area || ''}
                  onChange={(e) => updateFormField('area', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Plant</Label>
                <Input
                  value={request.plant}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => updateFormField('date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Shift</Label>
                <Select 
                  value={formData.shift || ''} 
                  onValueChange={(value) => updateFormField('shift', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Day">Day Shift</SelectItem>
                    <SelectItem value="Night">Night Shift</SelectItem>
                    <SelectItem value="Overtime">Overtime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parts and Operator Information */}
        <Card>
          <CardHeader>
            <CardTitle>Parts and Operator Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Parts Name</Label>
                <Input
                  value={formData.partsName || ''}
                  onChange={(e) => updateFormField('partsName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Parts Number</Label>
                <Input
                  value={formData.partsNumber || ''}
                  onChange={(e) => updateFormField('partsNumber', e.target.value)}
                />
              </div>
              <div>
                <Label>Operator Name</Label>
                <Input
                  value={formData.operatorName || ''}
                  onChange={(e) => updateFormField('operatorName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Operator Number</Label>
                <Input
                  value={formData.operatorNumber || ''}
                  onChange={(e) => updateFormField('operatorNumber', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Priority</Label>
                <Select 
                  value={formData.priority || ''} 
                  onValueChange={(value) => updateFormField('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Service Type</Label>
                <Select 
                  value={formData.serviceRequestForm || ''} 
                  onValueChange={(value) => updateFormField('serviceRequestForm', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Machine Maintenance">Machine Maintenance</SelectItem>
                    <SelectItem value="Mold Maintenance">Mold Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Breakdown Start Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.breakdownStartTime || ''}
                  onChange={(e) => updateFormField('breakdownStartTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status || ''} 
                  onValueChange={(value) => updateFormField('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Problem Description</Label>
              <Textarea
                value={formData.problemDescription || ''}
                onChange={(e) => updateFormField('problemDescription', e.target.value)}
                required
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Requested By</Label>
                <Input
                  value={formData.requestedBy || ''}
                  onChange={(e) => updateFormField('requestedBy', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Received By</Label>
                <Input
                  value={formData.receivedBy || ''}
                  onChange={(e) => updateFormField('receivedBy', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completion Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Corrective Action Taken</Label>
              <Textarea
                value={formData.correctiveActionTaken || ''}
                onChange={(e) => updateFormField('correctiveActionTaken', e.target.value)}
                rows={4}
                className="resize-none"
                placeholder="Describe the corrective action taken..."
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Breakdown Finished Date</Label>
                <Input
                  type="date"
                  value={formData.breakdownFinishedDate || ''}
                  onChange={(e) => updateFormField('breakdownFinishedDate', e.target.value)}
                />
              </div>
              <div>
                <Label>Breakdown End Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.breakdownEndTime || ''}
                  onChange={(e) => updateFormField('breakdownEndTime', e.target.value)}
                />
              </div>
              <div>
                <Label>Total Stop Hours</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.totalStopHours || ''}
                  onChange={(e) => updateFormField('totalStopHours', parseFloat(e.target.value) || 0)}
                  placeholder="Hours"
                />
              </div>
              <div>
                <Label>Done By</Label>
                <Input
                  value={formData.doneBy || ''}
                  onChange={(e) => updateFormField('doneBy', e.target.value)}
                  placeholder="Person who completed the work"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Maintenance Status</Label>
                <Select 
                  value={formData.maintenanceStatus || ''} 
                  onValueChange={(value) => updateFormField('maintenanceStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rectified">Rectified</SelectItem>
                    <SelectItem value="Not Rectified">Not Rectified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="reviewed"
                  checked={formData.breakdownReviewedAndClosed || false}
                  onCheckedChange={(checked) => 
                    updateFormField('breakdownReviewedAndClosed', checked)
                  }
                />
                <Label htmlFor="reviewed">Breakdown reviewed & closed</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Comments</Label>
                <Textarea
                  value={formData.comments || ''}
                  onChange={(e) => updateFormField('comments', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div>
                <Label>Others</Label>
                <Textarea
                  value={formData.others || ''}
                  onChange={(e) => updateFormField('others', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <div>
              <Label>Reviewed & Closed By</Label>
              <Input
                value={formData.reviewedAndClosedBy || ''}
                onChange={(e) => updateFormField('reviewedAndClosedBy', e.target.value)}
                placeholder="Name of reviewer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Department Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Department Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="engineering"
                  checked={formData.engineering || false}
                  onCheckedChange={(checked) => updateFormField('engineering', checked)}
                />
                <Label htmlFor="engineering">Engineering</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quality"
                  checked={formData.quality || false}
                  onCheckedChange={(checked) => updateFormField('quality', checked)}
                />
                <Label htmlFor="quality">Quality</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="moldShop"
                  checked={formData.moldShopMaintenance || false}
                  onCheckedChange={(checked) => updateFormField('moldShopMaintenance', checked)}
                />
                <Label htmlFor="moldShop">Mold Shop/Machine Maintenance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="production"
                  checked={formData.production || false}
                  onCheckedChange={(checked) => updateFormField('production', checked)}
                />
                <Label htmlFor="production">Production</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => router.push(`/maintenance-requests/${requestId}`)}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={saving}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
