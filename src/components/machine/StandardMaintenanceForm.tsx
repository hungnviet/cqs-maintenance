"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { MaintenanceFormProps } from './types';

export default function StandardMaintenanceForm({ template, machine, renderMachineImages }: MaintenanceFormProps) {
  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto space-y-0">
      {/* Header */}
      <div className="border border-black">
        <div className="bg-gray-100 p-3 border-b border-black text-center">
          <h1 className="text-base font-bold">
            {machine?.machineType?.typeName || 'Machine'} Preventive Maintenance {template.frequency} Checklist
          </h1>
          <p className="text-xs mt-1">
            {machine?.machineType?.typeName || 'Machine'} Bảo trì phòng ngừa Danh sách kiểm tra {template.frequency === 'Weekly' ? 'hàng tuần' : 
            template.frequency === 'Monthly' ? 'hàng tháng' : 
            template.frequency === 'Half-Yearly' ? 'nửa năm' : 'hàng năm'}
          </p>
        </div>

        {/* Section 1: General Information */}
        <div className="p-3 border-b border-black">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex">
                <span className="font-medium min-w-28 text-sm">Machine Name:</span>
                <span className="border-b border-black flex-1 ml-2 text-sm">{machine?.machineName || 'N/A'}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Tên máy móc:</p>
            </div>
            <div>
              <div className="flex">
                <span className="font-medium min-w-28 text-sm">Machine Number:</span>
                <span className="border-b border-black flex-1 ml-2 text-sm">{machine?.machineCode || 'N/A'}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Số máy:</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <div className="flex">
                <span className="font-medium min-w-28 text-sm">Maintenance Time:</span>
                <div className="flex-1 ml-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Start:</span>
                    <span className="border-b border-black px-2 text-sm">...........</span>
                    <span className="text-sm">Finish:</span>
                    <span className="border-b border-black px-2 text-sm">...........</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">Thời gian bảo trì: Bắt đầu / Kết thúc:</p>
            </div>
            <div>
              <div className="flex">
                <span className="font-medium min-w-28 text-sm">DATE:</span>
                <span className="border-b border-black flex-1 ml-2 text-center text-sm">........................</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex">
              <span className="font-medium min-w-44 text-sm">MAINTENANCE Operator Number:</span>
              <span className="border-b border-black flex-1 ml-2 text-sm">........................</span>
            </div>
          </div>
        </div>

        {/* Section 2: Machine Picture */}
        {machine?.images && machine.images.length > 0 && (
          <div className="p-3 border-b border-black">
            <h3 className="font-medium mb-2 text-sm">Machine Picture / Hình ảnh máy</h3>
            <div className="min-h-[200px]">
              {renderMachineImages(machine.images)}
            </div>
          </div>
        )}

        {/* Section 3: Preventive Maintenance Description */}
        <div className="border-b border-black">
          <div className="bg-gray-100 p-2 border-b border-black text-center">
            <h3 className="font-medium text-sm">Preventive Maintenance Description / Mô tả bảo trì phòng ngừa</h3>
          </div>
          
          <Table className="border-collapse text-xs">
            <TableHeader>
              <TableRow className="border-b border-black">
                <TableHead className="border-r border-black text-center font-medium text-black p-1 w-8">No.</TableHead>
                <TableHead className="border-r border-black text-center font-medium text-black p-1">Item Description / Mô tả hạng mục</TableHead>
                <TableHead className="border-r border-black text-center font-medium text-black p-1 w-16">Verify / Xác minh</TableHead>
                <TableHead className="text-center font-medium text-black p-1">Corrective Action / hành động khắc phục</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {template.groups.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {/* Group Title Row */}
                  <TableRow className="border-b border-black bg-gray-50">
                    <TableCell colSpan={4} className="px-2">
                      <p className="font-medium text-xs p-0">{group.groupTitle}</p>
                    </TableCell>
                  </TableRow>
                  {/* Group Requirements */}
                  {group.requirements.map((requirement, reqIndex) => (
                    <TableRow key={reqIndex} className="border-b border-black">
                      <TableCell className="border-r border-black text-center p-1 text-xs">{reqIndex + 1}</TableCell>
                      <TableCell className="border-r border-black p-1">
                        <div className='flex flex-row'>
                          <p className="font-medium text-xs">{requirement.titleEng}</p>
                          <span className="mx-1">/</span>
                          <p className="text-xs text-gray-600">{requirement.titleVn}</p>
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-black text-center p-1">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="p-1 text-xs">
                        <div className="h-6"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Section 4: Remarks */}
        <div className="p-3 border-b border-black">
          <div className="flex flex-col md:flex-row gap-2">
            <span className="min-w-32 text-sm font-medium">REMARKS/GHI CHÚ:</span>
            <div className="flex-1 ml-2 border border-black p-2 min-h-12 text-sm">
              {/* Empty for filling */}
            </div>
          </div>
        </div>

        {/* Section 5: Verification Symbol */}
        <div className="p-3 border-b border-black">
          <div className="grid grid-cols-5 gap-2">
            <div>
              <h4 className="font-medium mb-1 text-sm">Verification Symbol</h4>
              <p className="text-xs">Biểu tượng xác minh</p>
            </div>
            <div className="mt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 border border-black flex items-center justify-center text-xs">OK</div>
                  <Check className="h-3 w-3" />
                  <span className="text-xs">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 border border-black flex items-center justify-center text-xs">NG</div>
                  <X className="h-3 w-3" />
                  <span className="text-xs">Abnormal</span>
                </div>
            </div>
            <div className="col-span-3">
              <p className="text-xs">
                <strong>Note:</strong> If When verify found abnormal immediately taken corrective Action Required
              </p>
              <p className="text-xs mt-1">
                <strong>Lưu ý:</strong> Nếu khi kiểm tra thấy bất thường lập tức thực hiện hành động khắc phục Yêu cầu
              </p>
            </div>
          </div>
        </div>

        {/* Section 6: Verification and Approval */}
        <div className="p-3">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="font-medium text-sm">Prepared By:</p>
              <div className="mt-8 border-b border-black w-full h-8"></div>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Checked By:</p>
              <div className="mt-8 border-b border-black w-full h-8"></div>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Approved By:</p>
              <div className="mt-8 border-b border-black w-full h-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
