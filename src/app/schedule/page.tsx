'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllSchedules, ScheduleData } from '@/hooks/schedule';
import { getAllMachineTypesForDropdown, MachineType } from '@/hooks/machine-types';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function SchedulePageContent() {
  const searchParams = useSearchParams(); // This makes the page dynamic
  
  // Force dynamic rendering by accessing window object
  const [isHydrated, setIsHydrated] = useState(false);
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

  const loadMachineTypes = useCallback(async () => {
    try {
      const response = await getAllMachineTypesForDropdown();
      if (response.success) {
        setMachineTypes(response.data || []);
      }
    } catch {
      console.error('Failed to load machine types');
    }
  }, []);

  const loadSchedules = useCallback(async () => {
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
    } catch {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [frequency, debouncedPlantFilter, debouncedMachineCodeFilter, machineTypeFilter]);

  useEffect(() => {
    // This will only run on the client, forcing dynamic behavior
    if (typeof window !== 'undefined') {
      setIsHydrated(true);
    }
  }, []);

  // Use searchParams to initialize from URL (makes it truly dynamic)
  useEffect(() => {
    if (searchParams && isHydrated) {
      const urlFrequency = searchParams.get('frequency') as 'half-yearly' | 'yearly' || 'yearly';
      const urlPlant = searchParams.get('plant') || '';
      const urlMachineCode = searchParams.get('machineCode') || '';
      const urlMachineType = searchParams.get('machineType') || 'all';
      
      setFrequency(urlFrequency);
      setPlantFilter(urlPlant);
      setMachineCodeFilter(urlMachineCode);
      setMachineTypeFilter(urlMachineType);
    }
  }, [searchParams, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      loadMachineTypes();
      loadSchedules();
    }
  }, [loadMachineTypes, loadSchedules, isHydrated]);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

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
    // Calculate week ranges according to user requirements:
    // Week 1: 1-7, Week 2: 8-15, Week 3: 16-22, Week 4: 23-end of month
    let weekStart: number, weekEnd: number;
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    
    switch (week) {
      case 1:
        weekStart = 1;
        weekEnd = 7;
        break;
      case 2:
        weekStart = 8;
        weekEnd = 15;
        break;
      case 3:
        weekStart = 16;
        weekEnd = 22;
        break;
      case 4:
        weekStart = 23;
        weekEnd = lastDayOfMonth;
        break;
      default:
        return [];
    }
    
    const filteredSchedules = machine.maintenanceSchedule.filter(schedule => {
      if (type === 'plan') {
        const date = new Date(schedule.plannedDate);
        const dayOfMonth = date.getDate();
        const isInRange = date.getMonth() === month && date.getFullYear() === year && 
                         dayOfMonth >= weekStart && dayOfMonth <= weekEnd;
        
        // Debug logging for July 2025
        if (month === 6 && year === 2025) {
          console.log(`Plan - Week ${week} (${weekStart}-${weekEnd}):`, {
            plannedDate: schedule.plannedDate,
            dayOfMonth,
            isInRange
          });
        }
        
        return isInRange;
      } else {
        // For actual, only include schedules that have an actualDate
        if (!schedule.actualDate) return false;
        const date = new Date(schedule.actualDate);
        const dayOfMonth = date.getDate();
        const isInRange = date.getMonth() === month && date.getFullYear() === year && 
                         dayOfMonth >= weekStart && dayOfMonth <= weekEnd;
        
        // Debug logging for July 2025
        if (month === 6 && year === 2025) {
          console.log(`Actual - Week ${week} (${weekStart}-${weekEnd}):`, {
            actualDate: schedule.actualDate,
            dayOfMonth,
            isInRange
          });
        }
        
        return isInRange;
      }
    });
    
    return filteredSchedules;
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
                      <th key={month.key} className="border border-gray-300  text-center font-semibold min-w-[80px]">
                        <div className="text-xs">{month.name}</div>
                        <div className="grid grid-cols-4 border-t border-gray-200">
                          <div className="text-xs py-1 border-r border-gray-200">1</div>
                          <div className="text-xs py-1 border-r border-gray-200">2</div>
                          <div className="text-xs py-1 border-r border-gray-200">3</div>
                          <div className="text-xs py-1">4</div>
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
                        <td className="border border-gray-300  font-medium" rowSpan={2}>
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 " rowSpan={2}>
                          <div>
                            <div className="font-medium text-sm">{machine.machineName}</div>
                          </div>
                        </td>
                        <td className="border border-gray-300  bg-blue-50">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-blue-700 font-medium">PLAN</span>
                          </div>
                        </td>
                        {months.map(month => (
                          <td key={`plan-${month.key}`} className="border border-gray-300">
                            <div className="grid grid-cols-4">
                              {[1, 2, 3, 4].map(week => {
                                const schedules = getScheduleForMonthWeek(machine, month.month, month.year, week, 'plan');
                                return (
                                  <div key={week} className={`h-6 flex items-center justify-center ${week < 4 ? 'border-r border-gray-200' : ''}`}>
                                    {schedules.map(schedule => (
                                      <div 
                                        key={schedule._id} 
                                        className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-blue-500"
                                        title={`Planned: ${new Date(schedule.plannedDate).toLocaleDateString()}`}
                                      ></div>
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
                        <td className="border border-gray-300  bg-green-50">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-green-700 font-medium">ACTUAL</span>
                          </div>
                        </td>
                        {months.map(month => (
                          <td key={`actual-${month.key}`} className="border border-gray-300">
                            <div className="grid grid-cols-4">
                              {[1, 2, 3, 4].map(week => {
                                const schedules = getScheduleForMonthWeek(machine, month.month, month.year, week, 'actual');
                                return (
                                  <div key={week} className={`h-6 flex items-center justify-center ${week < 4 ? 'border-r border-gray-200' : ''}`}>
                                    {schedules.map(schedule => (
                                      <div 
                                        key={schedule._id} 
                                        className="w-4 h-4 bg-green-500"
                                        title={`Completed: ${new Date(schedule.actualDate!).toLocaleDateString()}`}
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

export default function SchedulePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SchedulePageContent />
    </Suspense>
  );
} 