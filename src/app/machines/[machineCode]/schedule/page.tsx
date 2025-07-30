"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Plus, Trash2, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getMachineDetail, getMachineSchedule, createMachineSchedule, deleteMachineSchedule } from '@/hooks/machine';

interface Schedule {
  _id: string;
  frequency: string;
  plannedDate: string;
  actualDate?: string;
  completedForm?: string;
  status: 'upcoming' | 'completed' | 'late';
}

interface NewScheduleData {
  frequency: string;
  plannedDate: string;
  count: number;
}

const frequencies = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Half-Yearly', label: 'Half-Yearly' },
  { value: 'Yearly', label: 'Yearly' }
];

export default function SchedulePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const machineCode = params.machineCode as string;
  
  const [machine, setMachine] = useState<{
    machineName: string;
    machineCode: string;
    [key: string]: unknown;
  } | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newSchedule, setNewSchedule] = useState<NewScheduleData>({
    frequency: '',
    plannedDate: '',
    count: 1
  });

  const loadData = useCallback(async (showLoadingToast = false, forceRefresh = false) => {
    try {
      if (showLoadingToast) {
        toast.loading('Refreshing schedule data...');
      }
      setLoading(true);
      
      // Load machine details
      const machineResponse = await getMachineDetail(machineCode, forceRefresh);
      if (machineResponse.success) {
        setMachine(machineResponse.data);
      }
      
      // Load schedules
      const scheduleResponse = await getMachineSchedule(machineCode, forceRefresh);
      if (scheduleResponse.success) {
        setSchedules(scheduleResponse.data || []);
      }
      
      if (showLoadingToast) {
        toast.dismiss();
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [machineCode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle refresh after form completion
  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh');
    if (shouldRefresh === 'true') {
      // Remove the refresh parameter from URL and reload data
      const newUrl = `/machines/${machineCode}/schedule`;
      router.replace(newUrl);
      loadData(true, true); // Show loading toast and force refresh to bypass cache
      toast.success('Schedule updated with completed maintenance');
    }
  }, [searchParams, machineCode, router, loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const generateScheduleDates = (startDate: string, frequency: string, count: number) => {
    const dates = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < count; i++) {
      dates.push(new Date(currentDate));
      
      // Calculate next date based on frequency
      switch (frequency) {
        case 'Daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'Weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'Monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'Half-Yearly':
          currentDate.setMonth(currentDate.getMonth() + 6);
          break;
        case 'Yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          currentDate.setDate(currentDate.getDate() + 7); // fallback to weekly
      }
    }
    
    return dates;
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.frequency || !newSchedule.plannedDate || newSchedule.count < 1) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setSaving(true);
      
      // Generate multiple schedule dates
      const scheduleDates = generateScheduleDates(
        newSchedule.plannedDate, 
        newSchedule.frequency, 
        newSchedule.count
      );
      
      const scheduleItems = scheduleDates.map(date => ({
        frequency: newSchedule.frequency as 'Daily' | 'Weekly' | 'Monthly' | 'Half-Yearly' | 'Yearly',
        plannedDate: date.toISOString(),
        actualDate: null
      }));

      const response = await createMachineSchedule(machineCode, { schedules: scheduleItems });
      
      if (response.success) {
        toast.success(`${newSchedule.count} ${newSchedule.frequency.toLowerCase()} schedules created successfully`);
        setShowNewModal(false);
        setNewSchedule({ frequency: '', plannedDate: '', count: 1 });
        loadData(true, true); // Show loading toast and force refresh to bypass cache
      } else {
        toast.error('Failed to create schedules');
      }
    } catch {
      toast.error('Failed to create schedules');
    } finally {
      setSaving(false);
    }
  };

  

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await deleteMachineSchedule(machineCode, scheduleId);
      
      if (response.success) {
        toast.success('Schedule deleted successfully');
        loadData(true, true); // Show loading toast and force refresh to bypass cache
      } else {
        toast.error('Failed to delete schedule');
      }
    } catch {
      toast.error('Failed to delete schedule');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
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
            <p className="text-gray-500">{machine?.machineName}</p>
          </div>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Maintenance Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No maintenance schedules found</p>
              <Button onClick={() => setShowNewModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Schedule
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead>Actual Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule._id}>
                    <TableCell className="font-medium">{schedule.frequency}</TableCell>
                    <TableCell>{formatDate(schedule.plannedDate)}</TableCell>
                    <TableCell>
                      {schedule.actualDate ? formatDate(schedule.actualDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {schedule.status === 'completed' && schedule.completedForm ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className='cursor-pointer'
                            onClick={() => router.push(`/machines/${machineCode}/maintenance/${schedule.frequency}/view?formId=${schedule.completedForm}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Form
                          </Button>
                        ) : schedule.status === 'completed' ? (
                          <Badge className="bg-gray-100 text-gray-800">
                            Completed (No Form)
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/machines/${machineCode}/maintenance/${schedule.frequency}/fill?scheduleId=${schedule._id}`)}
                              className='cursor-pointer'
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Fill Form
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSchedule(schedule._id)}
                          className='text-red-500 cursor-pointer'
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Schedule Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Maintenance Schedule</DialogTitle>
            <DialogDescription>
              Create multiple maintenance schedules with automatic date calculation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select 
                value={newSchedule.frequency} 
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newSchedule.plannedDate}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, plannedDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Number of Schedules</Label>
              <Input
                type="number"
                min="1"
                max="52"
                value={newSchedule.count}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
              />
              <p className="text-xs text-gray-500">
                How many {newSchedule.frequency.toLowerCase()} schedules to create
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSchedule}
              disabled={saving || !newSchedule.frequency || !newSchedule.plannedDate}
            >
              {saving ? 'Creating...' : `Create ${newSchedule.count} Schedule${newSchedule.count > 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
