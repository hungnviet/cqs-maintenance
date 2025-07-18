"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MaintenanceFormProps } from './types';

export default function DailyMaintenanceForm({ template, machine, renderMachineImages }: MaintenanceFormProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">
          {machine?.machineType?.typeName || 'Machine'} Preventive Maintenance Daily Checklist
        </h1>
        <p className="text-sm text-gray-600">
          {machine?.machineType?.typeName || 'Machine'} Bảo trì phòng ngừa Danh sách kiểm tra hàng ngày
        </p>
      </div>

      {/* Machine Info */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <div><strong>Machine Name:</strong> {machine?.machineName || 'N/A'}</div>
          <div><strong>Tên máy móc:</strong></div>
        </div>
        <div>
          <div><strong>Month:</strong> ............ <strong>Year:</strong> ..........</div>
          <div><strong>Machine No:</strong> {machine?.machineCode || 'N/A'}</div>
        </div>
        <div className="text-right">
          <div><strong>Machine No:</strong> {machine?.machineCode || 'N/A'}</div>
        </div>
      </div>

      {/* Machine Picture */}
      {machine?.images && machine.images.length > 0 && (
        <div className="mb-4">
          <div className="font-medium mb-2">Machine Picture / hình ảnh máy</div>
          <div className="min-h-[150px]">
            {renderMachineImages(machine.images)}
          </div>
        </div>
      )}

      {/* Daily Checklist Table */}
      <div className="overflow-x-auto">
        <Table className="border-collapse border border-gray-300 text-xs">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="border border-gray-300 text-center w-12">S.No</TableHead>
              <TableHead className="border border-gray-300 text-center w-32">Machine type / Loại máy</TableHead>
              <TableHead className="border border-gray-300 text-center w-48">Checking method / Phương pháp kiểm tra</TableHead>
              <TableHead className="border border-gray-300 text-center w-20">P.I.C</TableHead>
              {Array.from({length: 15}, (_, i) => (
                <TableHead key={i} className="border border-gray-300 text-center w-8">{i + 1}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {template.groups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {/* Group header row */}
                <TableRow className="bg-gray-200">
                  <TableCell colSpan={19} className="border border-gray-300 font-bold text-center">
                    {group.groupTitle}
                  </TableCell>
                </TableRow>
                
                {/* Requirements rows */}
                {group.requirements.map((requirement, reqIndex) => (
                  <TableRow key={reqIndex}>
                    <TableCell className="border border-gray-300 text-center">
                      {reqIndex + 1}
                    </TableCell>
                    <TableCell className="border border-gray-300 p-2">
                      <div className="flex flex-row">
                        <div className="font-medium">{requirement.titleEng}/ </div>
                        {requirement.titleVn && (
                          <div className="text-gray-600 text-xs">{requirement.titleVn}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-300 p-2 text-center">
                      Visual / Thị giác
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center">
                      □
                    </TableCell>
                    {Array.from({length: 15}, (_, i) => (
                      <TableCell key={i} className="border border-gray-300 text-center">
                        {/* Empty cells for daily checks */}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Section */}
      <div className="mt-4">
        <Table className="border-collapse border border-gray-300 text-xs">
          <TableBody>
            <TableRow>
              <TableCell className="border border-gray-300 p-2 text-center font-medium" rowSpan={3}>
                <div><strong>Operator "O"</strong></div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center font-medium" rowSpan={3}>
                <div><strong>Leader "O"</strong></div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center font-medium" rowSpan={3}>
                <div><strong>Maintenance "Y"</strong></div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center font-medium">
                <div><strong>Operator</strong></div>
              </TableCell>
              {Array.from({length: 15}, (_, i) => (
                <TableCell key={i} className="border border-gray-300 p-1 text-center w-8">
                  {/* Empty cells for daily operator checks */}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="border border-gray-300 p-2 text-center font-medium">
                <div><strong>Leader</strong></div>
              </TableCell>
              {Array.from({length: 15}, (_, i) => (
                <TableCell key={i} className="border border-gray-300 p-1 text-center w-8">
                  {/* Empty cells for daily leader checks */}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="border border-gray-300 p-2 text-center" colSpan={16}>
                {/* Empty row for spacing */}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Verification Section */}
      <div className="mt-4">
        <Table className="border-collapse border border-gray-300 text-xs">
          <TableBody>
            <TableRow>
              <TableCell className="border border-gray-300 p-2 text-center font-medium" rowSpan={3}>
                <div><strong>Verification Symbol</strong></div>
                <div><strong>Biểu tượng xác minh</strong></div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center">
                <div><strong>OK</strong></div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center">
                <div className="w-6 h-6 bg-green-500 text-white flex items-center justify-center mx-auto text-xs font-bold">✓</div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center" rowSpan={3}>
                <div><strong>Note:</strong> If have any Problem immediately inform to Leader</div>
                <div className="mt-1">Lưu ý: Nếu có vấn đề gì Thông báo ngay cho Leader</div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border border-gray-300 p-2 text-center">
                <div><strong>NG</strong></div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center">
                <div className="w-6 h-6 bg-red-500 text-white flex items-center justify-center mx-auto text-xs font-bold">X</div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border border-gray-300 p-2 text-center">
                <div><strong>Measured Value / giá trị đo</strong></div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center">
                <div><strong>Number / Con số (123)</strong></div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Signature Section */}
      <div className="mt-4">
        <Table className="border-collapse border border-gray-300 text-xs">
          <TableBody>
            <TableRow>
              <TableCell className="border border-gray-300 p-3 text-center font-medium">
                <div className="underline"><strong>Leader By:</strong></div>
              </TableCell>
              <TableCell className="border border-gray-300 p-3 text-center font-medium">
                <div className="underline"><strong>Checked By:</strong></div>
              </TableCell>
              <TableCell className="border border-gray-300 p-3 text-center font-medium">
                <div className="underline"><strong>Approved By:</strong></div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border border-gray-300 p-6"></TableCell>
              <TableCell className="border border-gray-300 p-6"></TableCell>
              <TableCell className="border border-gray-300 p-6"></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
