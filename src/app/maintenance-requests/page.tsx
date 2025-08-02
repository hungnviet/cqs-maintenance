"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  operatorName: string;
  breakdownStartTime: string;
  priority: 'Normal' | 'High';
  serviceRequestForm: 'Machine Maintenance' | 'Mold Maintenance';
  problemDescription: string;
  requestedBy: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Closed';
  createdAt: string;
}

export default function MaintenanceRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (priorityFilter && priorityFilter !== 'all') queryParams.append('priority', priorityFilter);
      
      const response = await fetch(`/api/maintenance-requests?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error('Failed to fetch maintenance requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, priorityFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/maintenance-requests/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Maintenance request deleted successfully');
        fetchRequests();
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

  const filteredRequests = requests.filter(request =>
    request.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.machine.machineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.problemDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-500 mt-1">Manage machine maintenance requests</p>
        </div>
        <Button 
          onClick={() => router.push('/maintenance-requests/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No maintenance requests found</p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/maintenance-requests/new')}
                className="mt-4"
              >
                Create First Request
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request No.</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Area/Plant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">
                        {request.serialNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.machine.machineName}</div>
                          <div className="text-sm text-gray-500">{request.machine.machineCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.area}</div>
                          <div className="text-sm text-gray-500">{request.plant}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(request.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {request.serviceRequestForm}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/maintenance-requests/${request._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/maintenance-requests/${request._id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(request._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
