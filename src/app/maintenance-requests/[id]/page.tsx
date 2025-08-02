"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function MaintenanceRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/maintenance-requests/${requestId}`);
        const data = await response.json();
        
        if (data.success) {
          setRequest(data.data);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this maintenance request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/maintenance-requests/${requestId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Maintenance request deleted successfully');
        router.push('/maintenance-requests');
      } else {
        toast.error(data.error || 'Failed to delete maintenance request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete maintenance request');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge variant={priority === 'High' ? 'destructive' : 'secondary'}>
        {priority}
      </Badge>
    );
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
            onClick={() => router.push('/maintenance-requests')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Maintenance Request #{request.serialNumber}</h1>
            <p className="text-gray-500">
              Created on {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(request.status)}
          <Button
            variant="outline"
            onClick={() => router.push(`/maintenance-requests/${requestId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Request Details */}
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Area/Unit</h4>
                <p className="text-gray-600">{request.area}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Plant</h4>
                <p className="text-gray-600">{request.plant}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Date</h4>
                <p className="text-gray-600">{new Date(request.date).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Shift</h4>
                <p className="text-gray-600">{request.shift}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Machine Information */}
        <Card>
          <CardHeader>
            <CardTitle>Machine Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Machine Name</h4>
                <p className="text-gray-600">{request.machine.machineName}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Machine Code</h4>
                <p className="text-gray-600 font-mono">{request.machine.machineCode}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Machine Type</h4>
                <p className="text-gray-600">{request.machine.machineType.typeName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parts and Operator */}
        <Card>
          <CardHeader>
            <CardTitle>Parts and Operator Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Parts Name</h4>
                <p className="text-gray-600">{request.partsName}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Parts Number</h4>
                <p className="text-gray-600">{request.partsNumber || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Operator Name</h4>
                <p className="text-gray-600">{request.operatorName}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Operator Number</h4>
                <p className="text-gray-600">{request.operatorNumber || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Priority</h4>
                  {getPriorityBadge(request.priority)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Service Type</h4>
                  <Badge variant="outline">{request.serviceRequestForm}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Breakdown Start</h4>
                  <p className="text-gray-600">
                    {new Date(request.breakdownStartTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  {getStatusBadge(request.status)}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Problem Description</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{request.problemDescription}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Requested By</h4>
                  <p className="text-gray-600">{request.requestedBy}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Received By</h4>
                  <p className="text-gray-600">{request.receivedBy}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Details (if completed) */}
        {(request.correctiveActionTaken || request.breakdownFinishedDate) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Completion Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.correctiveActionTaken && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Corrective Action Taken</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{request.correctiveActionTaken}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {request.breakdownFinishedDate && (
                    <div>
                      <h4 className="font-medium text-gray-900">Finished Date</h4>
                      <p className="text-gray-600">
                        {new Date(request.breakdownFinishedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {request.breakdownEndTime && (
                    <div>
                      <h4 className="font-medium text-gray-900">End Time</h4>
                      <p className="text-gray-600">
                        {new Date(request.breakdownEndTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {request.totalStopHours && (
                    <div>
                      <h4 className="font-medium text-gray-900">Total Stop Hours</h4>
                      <p className="text-gray-600">{request.totalStopHours} hours</p>
                    </div>
                  )}
                  {request.doneBy && (
                    <div>
                      <h4 className="font-medium text-gray-900">Done By</h4>
                      <p className="text-gray-600">{request.doneBy}</p>
                    </div>
                  )}
                </div>

                {request.maintenanceStatus && (
                  <div>
                    <h4 className="font-medium text-gray-900">Maintenance Status</h4>
                    <Badge variant={request.maintenanceStatus === 'Rectified' ? 'default' : 'destructive'}>
                      {request.maintenanceStatus}
                    </Badge>
                  </div>
                )}

                {(request.comments || request.others) && (
                  <div className="space-y-2">
                    {request.comments && (
                      <div>
                        <h4 className="font-medium text-gray-900">Comments</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{request.comments}</p>
                      </div>
                    )}
                    {request.others && (
                      <div>
                        <h4 className="font-medium text-gray-900">Others</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{request.others}</p>
                      </div>
                    )}
                  </div>
                )}

                {request.reviewedAndClosedBy && (
                  <div>
                    <h4 className="font-medium text-gray-900">Reviewed & Closed By</h4>
                    <p className="text-gray-600">{request.reviewedAndClosedBy}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Department Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Department Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${request.engineering ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm">Engineering</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${request.quality ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm">Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${request.moldShopMaintenance ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm">Mold Shop/Machine Maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${request.production ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm">Production</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
