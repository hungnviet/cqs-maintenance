"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllMachineTypes } from '@/hooks/machine-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface MachineType {
  _id: string;
  typeName: string;
  machineTypeCode: string;
  totalMachines: number;
  description?: string;
}

function MachineTypesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This makes the page dynamic
  
  // Force dynamic rendering by accessing window object
  const [isHydrated, setIsHydrated] = useState(false);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const loadMachineTypes = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const response = await getAllMachineTypes({
        search: searchTerm,
        pageIndex,
        pageSize,
      }, forceRefresh);
      
      if (response.success) {
        setMachineTypes(response.data || []);
        setTotal(response.total || 0);
      } else {
        toast.error('Failed to load machine types');
      }
    } catch (error) {
      console.error('Error loading machine types:', error);
      toast.error('Failed to load machine types');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pageIndex, pageSize]);

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
      const urlPage = parseInt(searchParams.get('page') || '0');
      
      setSearchTerm(urlSearch);
      setPageIndex(urlPage);
    }
  }, [searchParams, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      loadMachineTypes();
    }
  }, [loadMachineTypes, isHydrated]);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  // Manual refresh function
  const refreshData = () => {
    loadMachineTypes(true);
    toast.success('Refreshing machine types...');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPageIndex(0); // Reset to first page when searching
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Machine Types</h2>
          <p className="text-gray-500 mt-1">
            Manage machine types and their maintenance templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push('/machine-types/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Machine Type
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
            <CardTitle>All Machine Types</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg">Loading...</div>
            </div>
          ) : machineTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm ? (
                  <>
                    <p className="text-lg">No machine types found matching {searchTerm}</p>
                    <p className="text-sm mt-1">Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg">No machine types found</p>
                    <p className="text-sm mt-1">Create your first machine type to get started</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type Name</TableHead>
                    <TableHead>Type Code</TableHead>
                    <TableHead>Total Machines</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machineTypes.map((type) => (
                    <TableRow
                      key={type.machineTypeCode}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/machine-types/${type.machineTypeCode}`)}
                    >
                      <TableCell className="font-medium">{type.typeName}</TableCell>
                      <TableCell className="font-mono text-sm">{type.machineTypeCode}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {type.totalMachines}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="truncate" title={type.description}>
                          {type.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/machine-types/${type.machineTypeCode}`);
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

export default function MachineTypesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MachineTypesPageContent />
    </Suspense>
  );
} 