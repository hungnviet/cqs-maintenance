"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, CheckCircle, AlertTriangle, FileText, Plus } from 'lucide-react';
import { getMachineSchedule } from '@/hooks/machine';
import { toast } from 'sonner';

interface MachineSchedule {
  _id?: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Half-Yearly' | 'Yearly';
  plannedDate: string;
  actualDate?: string | null;
  status: 'upcoming' | 'late' | 'completed';
  completedForm?: any;
}

interface MachineScheduledMaintenanceProps {
  machineCode: string;
}

export default function MachineScheduledMaintenance({ machineCode }: MachineScheduledMaintenanceProps) {
  const [schedules, setSchedules] = useState<MachineSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSchedules();
  }, [machineCode]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await getMachineSchedule(machineCode);
      if (response.success) {
        setSchedules(response.data || []);
      } else {
        toast.error('Failed to load maintenance schedule');
      }
    } catch (error) {
      toast.error('Failed to load maintenance schedule');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'late': return <AlertTriangle className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const handleScheduleClick = (schedule: MachineSchedule) => {
    if (schedule.status === 'completed') {
      // Navigate to view completed form
      router.push(`/machines/${machineCode}/maintenance/${schedule.frequency}/view?formId=${schedule.completedForm?._id}`);
    } else {
      // Navigate to fill form
      router.push(`/machines/${machineCode}/maintenance/${schedule.frequency}/fill`);
    }
  };

  const groupedSchedules = {
    upcoming: schedules.filter(s => s.status === 'upcoming'),
    late: schedules.filter(s => s.status === 'late'),
    completed: schedules.filter(s => s.status === 'completed')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{groupedSchedules.upcoming.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Late</p>
                <p className="text-2xl font-bold text-red-600">{groupedSchedules.late.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{groupedSchedules.completed.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Maintenance Schedule</CardTitle>
            <Button 
              size="sm"
              onClick={() => router.push(`/machines/${machineCode}/schedule/new`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No maintenance schedule found</p>
              <p className="text-sm text-gray-400 mt-1">
                Add maintenance schedules to track upcoming and completed maintenance
              </p>
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
                {schedules.map((schedule, index) => (
                  <TableRow 
                    key={`${schedule.frequency}-${index}`} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleScheduleClick(schedule)}
                  >
                    <TableCell className="font-medium">
                      {schedule.frequency}
                    </TableCell>
                    <TableCell>
                      {new Date(schedule.plannedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {schedule.actualDate 
                        ? new Date(schedule.actualDate).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(schedule.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(schedule.status)}
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScheduleClick(schedule);
                        }}
                      >
                        {schedule.status === 'completed' ? (
                          <>
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-1" />
                            Fill Form
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
