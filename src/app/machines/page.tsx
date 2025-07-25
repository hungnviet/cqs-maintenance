"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllMachines } from '@/hooks/machine';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Machine {
  _id: string;
  machineName: string;
  machineCode: string;
  machineType: {
    typeName: string;
    machineTypeCode: string;
  };
  plant: string;
  status: string;
  purchaseDate: string;
}

function MachinesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This makes the page dynamic
  
  // Force dynamic rendering by accessing window object
  const [isHydrated, setIsHydrated] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [plantFilter, setPlantFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Debounce search and filter values to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedPlantFilter = useDebounce(plantFilter, 500);

  const loadMachines = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const response = await getAllMachines({
        search: debouncedSearchTerm,
        plant: debouncedPlantFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
        pageIndex,
        pageSize,
      }, forceRefresh);
      
      if (response.success) {
        setMachines(response.data || []);
        setTotal(response.total || 0);
      } else {
        toast.error('Failed to load machines');
      }
    } catch  {
      toast.error('Failed to load machines');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, debouncedPlantFilter, statusFilter, pageIndex, pageSize]);

  useEffect(() => {
    // This will only run on the client, forcing dynamic behavior
    if (typeof window !== 'undefined') {
      setIsHydrated(true);
    }
  }, []);

  // Use searchParams to initialize from URL (makes it truly dynamic)
  useEffect(() => {
    if (searchParams && isHydrated) {
      const urlSearch = searchParams.get('search') || '';
      const urlPlant = searchParams.get('plant') || '';
      const urlStatus = searchParams.get('status') || 'all';
      const urlPage = parseInt(searchParams.get('page') || '0');
      
      setSearchTerm(urlSearch);
      setPlantFilter(urlPlant);
      setStatusFilter(urlStatus);
      setPageIndex(urlPage);
    }
  }, [searchParams, isHydrated]);

  useEffect(() => {
    loadMachines(false); // Don't force refresh on normal load
  }, [loadMachines]);

  // Force refresh when lastRefresh changes
  useEffect(() => {
    if (lastRefresh > Date.now() - 1000) { // Only if refresh was triggered recently
      loadMachines(true); // Force refresh when manual refresh is triggered
    }
  }, [lastRefresh, loadMachines]);

  // Refresh data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setLastRefresh(Date.now());
      }
    };

    const handleFocus = () => {
      setLastRefresh(Date.now());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Auto-refresh every 30 seconds when page is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && !loading) {
        setLastRefresh(Date.now());
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading]);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  // Manual refresh function
  const refreshData = () => {
    setLastRefresh(Date.now());
    toast.success('Refreshing machines data...');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPageIndex(0);
  };

  const handlePlantFilter = (value: string) => {
    setPlantFilter(value);
    setPageIndex(0);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPageIndex(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Machines</h2>
          <p className="text-gray-500 mt-1">
            Manage machines and their maintenance schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push('/machines/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Machine
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={refreshData}
            disabled={loading}
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Machines</CardTitle>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filters */}
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Filter by plant..."
                value={plantFilter}
                onChange={(e) => handlePlantFilter(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg">Loading...</div>
            </div>
          ) : machines.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {debouncedSearchTerm || debouncedPlantFilter || statusFilter !== 'all' ? (
                  <>
                    <p className="text-lg">No machines found matching your criteria</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg">No machines found</p>
                    <p className="text-sm mt-1">Create your first machine to get started</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine Name</TableHead>
                    <TableHead>Machine Code</TableHead>
                    <TableHead>Machine Type</TableHead>
                    <TableHead>Plant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machines.map((machine) => (
                    <TableRow
                      key={machine.machineCode}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/machines/${machine.machineCode}`)}
                    >
                      <TableCell className="font-medium">{machine.machineName}</TableCell>
                      <TableCell className="font-mono text-sm">{machine.machineCode}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{machine.machineType.typeName}</div>
                          <div className="text-xs text-gray-500">{machine.machineType.machineTypeCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>{machine.plant}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(machine.status)}>
                          {machine.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(machine.purchaseDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/machines/${machine.machineCode}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, total)} of {total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                      disabled={pageIndex === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pageIndex + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
                      disabled={pageIndex >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MachinesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MachinesPageContent />
    </Suspense>
  );
}