"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getMachineDetail, updateMachineSchedule } from '@/hooks/machine';

interface ScheduleData {
  frequency: string;
  plannedDate: string;
}

interface Machine {
  _id: string;
  machineCode: string;
  machineName: string;
  machineType: string;
  plant: string;
  [key: string]: unknown;
}

const frequencies = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Half-Yearly', label: 'Half-Yearly' },
  { value: 'Yearly', label: 'Yearly' }
];

export default function NewSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const machineCode = params.machineCode as string;
  
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [schedules, setSchedules] = useState<ScheduleData[]>([
    { frequency: '', plannedDate: '' }
  ]);

  const loadMachine = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMachineDetail(machineCode);
      if (response.success) {
        setMachine(response.data);
      } else {
        toast.error('Failed to load machine');
        router.push('/machines');
      }
    } catch {
      toast.error('Failed to load machine');
      router.push('/machines');
    } finally {
      setLoading(false);
    }
  }, [machineCode, router]);

  useEffect(() => {
    loadMachine();
  }, [loadMachine]);

  const addSchedule = () => {
    setSchedules(prev => [...prev, { frequency: '', plannedDate: '' }]);
  };

  const removeSchedule = (index: number) => {
    if (schedules.length > 1) {
      setSchedules(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateSchedule = (index: number, field: keyof ScheduleData, value: string) => {
    setSchedules(prev => prev.map((schedule, i) => 
      i === index ? { ...schedule, [field]: value } : schedule
    ));
  };

  const handleSubmit = async () => {
    // Validate schedules
    const validSchedules = schedules.filter(s => s.frequency && s.plannedDate);
    
    if (validSchedules.length === 0) {
      toast.error('Please add at least one valid schedule');
      return;
    }

    try {
      setSaving(true);
      
      // Update machine's maintenance schedule
      const response = await updateMachineSchedule(machineCode, {
        schedules: validSchedules.map(s => ({
          frequency: s.frequency as 'Daily' | 'Weekly' | 'Monthly' | 'Half-Yearly' | 'Yearly',
          plannedDate: new Date(s.plannedDate),
          actualDate: null
        }))
      });
      
      if (response.success) {
        toast.success('Maintenance schedules added successfully');
        router.push(`/machines/${machineCode}`);
      } else {
        toast.error('Failed to add schedules');
      }
    } catch {
      toast.error('Failed to add schedules');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading machine...</p>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Machine not found</p>
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
    <div className="p-6 max-w-2xl mx-auto">
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
            <h1 className="text-3xl font-bold">Add Maintenance Schedule</h1>
            <p className="text-gray-500">{machine.machineName}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Maintenance Schedules
          </CardTitle>
          <p className="text-sm text-gray-500">
            Add planned maintenance dates for this machine
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedules.map((schedule, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select 
                  value={schedule.frequency} 
                  onValueChange={(value) => updateSchedule(index, 'frequency', value)}
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
                <Label>Planned Date</Label>
                <Input
                  type="date"
                  value={schedule.plannedDate}
                  onChange={(e) => updateSchedule(index, 'plannedDate', e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => removeSchedule(index)}
                  disabled={schedules.length === 1}
                  className="w-full"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={addSchedule}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/machines/${machineCode}`)}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={saving || schedules.every(s => !s.frequency || !s.plannedDate)}
        >
          {saving ? 'Saving...' : 'Add Schedules'}
        </Button>
      </div>
    </div>
  );
}
