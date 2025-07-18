"use client";

import { RequirementGroup } from '@/hooks/machine-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MaintenanceFormViewerProps {
  frequency: string;
  groups: RequirementGroup[];
}

export default function MaintenanceFormViewer({ frequency, groups }: MaintenanceFormViewerProps) {
  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{frequency} Maintenance Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No maintenance requirements defined for {frequency.toLowerCase()} maintenance.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{frequency} Maintenance Template</span>
          <div className="text-sm text-gray-500">
            {groups.length} group{groups.length !== 1 ? 's' : ''}, {' '}
            {groups.reduce((acc, group) => acc + group.requirements.length, 0)} requirement{groups.reduce((acc, group) => acc + group.requirements.length, 0) !== 1 ? 's' : ''}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="border-collapse border border-gray-300">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%] border border-gray-300 bg-gray-50 font-semibold text-center">
                Requirement / Yêu cầu
              </TableHead>
              <TableHead className="w-[20%] border border-gray-300 bg-gray-50 font-semibold text-center">
                Verify<br />Xác minh
              </TableHead>
              <TableHead className="w-[20%] border border-gray-300 bg-gray-50 font-semibold text-center">
                Corrective Action / hành động khắc phục
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group, groupIndex) => (
              <>
                {/* Group Header Row */}
                <TableRow key={`group-${groupIndex}`} className="bg-gray-100">
                  <TableCell colSpan={3} className="border border-gray-300 font-bold">
                    {group.groupTitle}
                  </TableCell>
                </TableRow>
                
                {/* Requirements Rows */}
                {group.requirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="border border-gray-300 text-center py-4 text-gray-500 italic">
                      No requirements in this group
                    </TableCell>
                  </TableRow>
                ) : (
                  group.requirements.map((requirement, reqIndex) => (
                    <TableRow key={`req-${groupIndex}-${reqIndex}`}>
                      <TableCell className="border border-gray-300 p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-600 min-w-[20px]">
                            {reqIndex + 1}.
                          </span>
                          <div className="flex-1 flex flex-row items-start align-center">
                            <div className="font-medium">
                              {requirement.titleEng}
                            </div>
                            {requirement.titleVn && (
                              <div className="text-sm text-gray-600 italic">
                                /
                                {requirement.titleVn}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-center p-3 min-h-[60px]">
                        {/* Empty cell for verification - will be filled during maintenance */}
                        <div className="h-8"></div>
                      </TableCell>
                      <TableCell className="border border-gray-300 text-center p-3 min-h-[60px]">
                        {/* Empty cell for corrective action - will be filled during maintenance */}
                        <div className="h-8"></div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
