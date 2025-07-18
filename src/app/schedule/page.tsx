'use client';

import React, { useEffect, useState } from 'react';
import { getAllSchedules, ScheduleData } from '@/hooks/schedule';
import { getAllMachineTypesForDropdown, MachineType } from '@/hooks/machine-types';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [frequency, setFrequency] = useState<'half-yearly' | 'yearly'>('yearly');
  const [plantFilter, setPlantFilter] = useState('');
  const [machineCodeFilter, setMachineCodeFilter] = useState('');
  const [machineTypeFilter, setMachineTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  const debouncedPlantFilter = useDebounce(plantFilter, 500);
  const debouncedMachineCodeFilter = useDebounce(machineCodeFilter, 500);

  useEffect(() => {
    loadSchedules();
  }, [frequency, debouncedPlantFilter, debouncedMachineCodeFilter, machineTypeFilter]);

  useEffect(() => {
    loadMachineTypes();
  }, []);

  const loadMachineTypes = async () => {
    try {
      const response = await getAllMachineTypesForDropdown();
      if (response.success) {
        setMachineTypes(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load machine types:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await getAllSchedules({
        frequency,
        plant: debouncedPlantFilter,
        machineCode: debouncedMachineCodeFilter,
        machineType: machineTypeFilter === 'all' ? '' : machineTypeFilter,
      });
      
      if (response.success) {
        setSchedules(response.data || []);
        setDateRange(response.dateRange);
      } else {
        toast.error('Failed to load schedules');
      }
    } catch (error) {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthColumns = () => {
    if (!dateRange) return [];
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const months = [];
    
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const monthName = current.toLocaleDateString('en-US', { month: 'short' });
      const year = current.getFullYear();
      months.push({
        key: `${year}-${current.getMonth()}`,
        name: monthName,
        year: year,
        month: current.getMonth()
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const getScheduleForMonthWeek = (machine: ScheduleData, month: number, year: number, week: number, type: 'plan' | 'actual') => {
    const weekStart = new Date(year, month, (week - 1) * 7 + 1);
    const weekEnd = new Date(year, month, week * 7);
    
    return machine.maintenanceSchedule.filter(schedule => {
      const date = new Date(type === 'plan' ? schedule.plannedDate : schedule.actualDate || '');
      return date >= weekStart && date <= weekEnd;
    });
  };

  const getStatusColor = (schedule: any) => {
    if (schedule.actualDate) {
      return 'bg-green-100 text-green-800'; // Completed
    }
    const planned = new Date(schedule.plannedDate);
    const now = new Date();
    if (planned < now) {
      return 'bg-red-100 text-red-800'; // Overdue
    }
    return 'bg-yellow-100 text-yellow-800'; // Upcoming
  };

  const months = generateMonthColumns();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Schedule</h2>
          <p className="text-gray-500 mt-1">
            {frequency === 'yearly' ? 'Yearly' : 'Half-Yearly'} maintenance schedules overview
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Schedule Overview</CardTitle>
            <div className="flex items-center gap-4">
              {/* Frequency Filter */}
              <Select value={frequency} onValueChange={(value: 'half-yearly' | 'yearly') => setFrequency(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                </SelectContent>
              </Select>

              {/* Plant Filter */}
              <Input
                placeholder="Filter by plant..."
                value={plantFilter}
                onChange={(e) => setPlantFilter(e.target.value)}
                className="w-40"
              />

              {/* Machine Code Filter */}
              <Input
                placeholder="Filter by machine code..."
                value={machineCodeFilter}
                onChange={(e) => setMachineCodeFilter(e.target.value)}
                className="w-48"
              />

              {/* Machine Type Filter */}
              <Select value={machineTypeFilter} onValueChange={setMachineTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by machine type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Machine Types</SelectItem>
                  {machineTypes.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.typeName} ({type.machineTypeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg">Loading schedules...</div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg">No maintenance schedules found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left font-semibold">No.</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">Machine</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">Type</th>
                    {months.map(month => (
                      <th key={month.key} className="border border-gray-300 p-1 text-center font-semibold min-w-[120px]">
                        <div>{month.name}</div>
                        <div className="grid grid-cols-4 gap-1 mt-1">
                          <div className="text-xs">W1</div>
                          <div className="text-xs">W2</div>
                          <div className="text-xs">W3</div>
                          <div className="text-xs">W4</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((machine, index) => (
                    <React.Fragment key={machine._id}>
                      {/* Plan Row */}
                      <tr className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-medium" rowSpan={2}>
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 p-2" rowSpan={2}>
                          <div>
                            <div className="font-medium">{machine.machineName}</div>
                            <div className="text-sm text-gray-500">{machine.machineCode}</div>
                            <div className="text-xs text-gray-400">{machine.plant}</div>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2 bg-blue-50">
                          <Badge variant="outline" className="text-blue-700">PLAN</Badge>
                        </td>
                        {months.map(month => (
                          <td key={`plan-${month.key}`} className="border border-gray-300 p-1">
                            <div className="grid grid-cols-4 gap-1">
                              {[1, 2, 3, 4].map(week => {
                                const schedules = getScheduleForMonthWeek(machine, month.month, month.year, week, 'plan');
                                return (
                                  <div key={week} className="h-6 flex items-center justify-center">
                                    {schedules.map(schedule => (
                                      <div key={schedule._id} className="w-2 h-2 bg-blue-500 rounded-full" title={`Planned: ${new Date(schedule.plannedDate).toLocaleDateString()}`}></div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        ))}
                      </tr>
                      
                      {/* Actual Row */}
                      <tr className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 bg-green-50">
                          <Badge variant="outline" className="text-green-700">ACTUAL</Badge>
                        </td>
                        {months.map(month => (
                          <td key={`actual-${month.key}`} className="border border-gray-300 p-1">
                            <div className="grid grid-cols-4 gap-1">
                              {[1, 2, 3, 4].map(week => {
                                const schedules = getScheduleForMonthWeek(machine, month.month, month.year, week, 'actual');
                                return (
                                  <div key={week} className="h-6 flex items-center justify-center">
                                    {schedules.map(schedule => (
                                      <div 
                                        key={schedule._id} 
                                        className={`w-2 h-2 rounded-full ${schedule.actualDate ? 'bg-green-500' : 'bg-gray-300'}`}
                                        title={schedule.actualDate ? `Completed: ${new Date(schedule.actualDate).toLocaleDateString()}` : 'Not completed'}
                                      ></div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 