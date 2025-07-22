"use client";

import React from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';

interface CompletedForm {
  _id: string;
  machine: {
    machineName: string;
    machineCode: string;
    machineType: {
      typeName: string;
    };
    images: string[];
  };
  frequency: string;
  date: string;
  maintenanceStartTime: string;
  maintenanceEndTime: string;
  maintenanceOperatorNumber: number | string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  remarks: string;
  groups: Array<{
    groupTitle: string;
    requirements: Array<{
      titleEng: string;
      titleVn: string;
      accepted: boolean;
      note: string;
    }>;
  }>;
  filledAt: string;
}

interface MaintenanceFormViewerProps {
  form: CompletedForm;
}

export default function MaintenanceFormViewer({ form }: MaintenanceFormViewerProps) {
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    });
  };

  const renderMachineImages = (images: string[] = []) => {
    if (!images || images.length === 0) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="border border-black bg-gray-50 w-1/2 h-[33vh]"></div>
          ))}
        </div>
      );
    }

    
    const imageElements = images.map((imageUrl, index) => (
      <div key={index} className="border border-black bg-gray-50 relative w-full h-full">
        <Image 
          src={imageUrl}
          alt={`Machine image ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          onError={() => {
            console.log(`Error loading image ${index + 1}`);
          }}
        />
      </div>
    ));

    // Layout logic based on number of images - each image 1/2 paper width and 1/3 paper height
    if (images.length === 1) {
      return (
        <div className="flex justify-center">
          <div className="w-1/2 h-[33vh]">
            {imageElements[0]}
          </div>
        </div>
      );
    } else if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {imageElements.map((element, index) => (
            <div key={index} className="w-full h-[33vh]">
              {element}
            </div>
          ))}
        </div>
      );
    } else if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-full h-[33vh]">
              {imageElements[0]}
            </div>
          </div>
          <div className="grid grid-rows-2 gap-2">
            <div className="w-full h-[16vh]">
              {imageElements[1]}
            </div>
            <div className="w-full h-[16vh]">
              {imageElements[2]}
            </div>
          </div>
        </div>
      );
    } else {
      // For more than 3 images, show first 3 with same layout as 3 images
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-full h-[33vh]">
              {imageElements[0]}
            </div>
          </div>
          <div className="grid grid-rows-2 gap-2">
            <div className="w-full h-[16vh]">
              {imageElements[1]}
            </div>
            <div className="w-full h-[16vh]">
              {imageElements[2]}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto space-y-0">
      {/* Header */}
      <div className="border border-black ">
        <div className="bg-gray-100 p-3 border-b border-black text-center">
          <h1 className="text-base font-bold">
            {form.machine.machineType.typeName} Preventive Maintenance {form.frequency} Checklist
          </h1>
          <p className="text-xs mt-1">
            Dục áp lực Bảo trì phòng ngừa Danh sách kiểm tra {form.frequency === 'Weekly' ? 'hàng tuần' : 
            form.frequency === 'Daily' ? 'hàng ngày' : 
            form.frequency === 'Monthly' ? 'hàng tháng' : 
            form.frequency === 'Half-Yearly' ? 'nửa năm' : 'hàng năm'}
          </p>
        </div>

        {/* Section 1: General Information */}
        <div className="p-3 border-b border-black">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex">
                <span className="font-medium min-w-28 text-sm">Machine Name:</span>
                <span className="border-b border-black flex-1 ml-2 text-sm">{form.machine.machineName}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Tên máy móc:</p>
            </div>
            <div>
              <div className="flex">
                <span className="font-medium min-w-28 text-sm">Machine Number:</span>
                <span className="border-b border-black flex-1 ml-2 text-sm">{form.machine.machineCode}</span>
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
                    <span className="border-b border-black px-2 text-sm">{formatTime(form.maintenanceStartTime)}</span>
                    <span className="text-sm">Finish:</span>
                    <span className="border-b border-black px-2 text-sm">{formatTime(form.maintenanceEndTime)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">Thời gian bảo trì: Bắt đầu / Kết thúc:</p>
            </div>
            <div>
              <div className="flex">
                <span className="font-medium min-w-28 text-sm">DATE:</span>
                <span className="border-b border-black flex-1 ml-2 text-center text-sm">{formatDate(form.date)}</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex">
              <span className="font-medium min-w-44 text-sm">MAINTENANCE Operator Number:</span>
              <span className="border-b border-black flex-1 ml-2 text-sm">{form.maintenanceOperatorNumber || ''}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Machine Picture */}
        <div className="p-3 border-b border-black">
          <h3 className="font-medium mb-2 text-sm">Machine Picture / Hình ảnh máy</h3>
          {renderMachineImages(form.machine.images)}
        </div>

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
              {form.groups.map((group, groupIndex) => (
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
                        {requirement.accepted ? (
                          <div className="flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <X className="h-3 w-3 text-red-600" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-1 text-xs">
                        {requirement.note || ''}
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
              {form.remarks || ''}
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
              <p className="text-sm mt-1">{form.preparedBy || ''}</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Checked By:</p>
              <p className="text-sm mt-1">{form.checkedBy || ''}</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Approved By:</p>
              <p className="text-sm mt-1">{form.approvedBy || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
