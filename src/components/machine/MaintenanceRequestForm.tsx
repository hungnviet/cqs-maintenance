"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface Machine {
  _id: string;
  machineName: string;
  machineCode: string;
  machineType: {
    typeName: string;
    machineTypeCode: string;
  };
}

interface MaintenanceRequestFormData {
  area: string;
  date: string;
  shift: string;
  partNameNumber: string;
  operatorNameNumber: string;
  breakdownStartTime: string;
  priority: 'Normal' | 'High';
  serviceRequestForm: 'Machine Maintenance' | 'Mold Maintenance';
  problemDescription: string;
  requestedBy: string;
}

interface MaintenanceRequestFormProps {
  machine: Machine;
  onSubmit: (data: MaintenanceRequestFormData) => void;
  saving: boolean;
}

export default function MaintenanceRequestForm({ machine, onSubmit, saving }: MaintenanceRequestFormProps) {
  const [formData, setFormData] = useState<MaintenanceRequestFormData>({
    area: '',
    date: new Date().toISOString().split('T')[0],
    shift: '',
    partNameNumber: '',
    operatorNameNumber: '',
    breakdownStartTime: '',
    priority: 'Normal',
    serviceRequestForm: 'Machine Maintenance',
    problemDescription: '',
    requestedBy: ''
  });

  // Additional state for completion fields
  const [completionData, setCompletionData] = useState({
    receivedBy: '',
    correctiveActionTaken: '',
    breakdownFinishedDate: '',
    doneBy: '',
    breakdownEndTime: '',
    totalStopHours: '',
    breakdownReviewed: '',
    maintenanceStatus: '',
    comments: '',
    others: '',
    reviewedByEngineering: '',
    reviewedByQuality: '',
    reviewedByMoldShop: '',
    reviewedByProduction: ''
  });

  const updateFormField = (field: keyof MaintenanceRequestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCompletionField = (field: string, value: string) => {
    setCompletionData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = () => {
    return formData.area && 
           formData.date && 
           formData.shift &&
           formData.partNameNumber &&
           formData.operatorNameNumber &&
           formData.breakdownStartTime &&
           formData.problemDescription &&
           formData.requestedBy;
  };

  return (
    <div className="bg-white shadow-lg" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '10mm' }}>
      {/* Header Row */}
      <div className="border-2 border-black mb-0">
        <div className="border-b-2 border-black pl-3 pr-3 py-2 flex items-center justify-between">
          <div className='font-bold flex-shrink-0'>CQS</div>
          <div className='flex-1 text-center'>
            <h3 className='font-bold text-lg'>MAINTENANCE REQUEST</h3>
            <p className='text-sm'>ĐỀ NGHỊ BẢO TRÌ</p>
          </div>
          <div className='flex items-center gap-2 flex-shrink-0'>
            <p className='font-bold'>SL No:</p>
            <div className='border-b-2 border-black w-20 h-6 flex items-end'>
              <span className='text-xs pb-1'></span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Area/Unit, Plant */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Area/Unit:</div>
                  <div className="text-xs text-gray-600">Khu vực :</div>
                </div>
                <Input
                  value={formData.area}
                  onChange={(e) => updateFormField('area', e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
              <div className="p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Plant:</div>
                  <div className="text-xs text-gray-600">Nhà máy :</div>
                </div>
                <div className="flex-1 border border-gray-300 px-3 py-2 bg-gray-50 rounded">
                  {machine.machineType.typeName}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Machine Name, Date */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Machine Name/Number:</div>
                  <div className="text-xs text-gray-600">Tên máy / Số :</div>
                </div>
                <div className="flex-1 border border-gray-300 bg-gray-50 rounded text-xs p-2">
                  {machine.machineName} / {machine.machineCode}
                </div>
              </div>
              <div className="p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Date:</div>
                  <div className="text-xs text-gray-600">Ngày:</div>
                </div>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormField('date', e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 3: Parts Name/Number, Shift */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Parts name/Number:</div>
                  <div className="text-xs text-gray-600">Tên thiết bị/Số:</div>
                </div>
                <Input
                  value={formData.partNameNumber}
                  onChange={(e) => updateFormField('partNameNumber', e.target.value)}
                  placeholder="Parts name/number"
                  className="flex-1"
                  required
                />
              </div>
              <div className="p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Shift :</div>
                  <div className="text-xs text-gray-600">Ca :</div>
                </div>
                <Input
                  value={formData.shift}
                  onChange={(e) => updateFormField('shift', e.target.value)}
                  placeholder="Shift"
                  className="flex-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 4: Operator Name/Number, Breakdown Start Time */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Operator Name / Number :</div>
                  <div className="text-xs text-gray-600">Người đi sửa / Số :</div>
                </div>
                <Input
                  value={formData.operatorNameNumber}
                  onChange={(e) => updateFormField('operatorNameNumber', e.target.value)}
                  placeholder="Operator name/number"
                  className="flex-1"
                  required
                />
              </div>
              <div className="p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Breakdown start Time :</div>
                  <div className="text-xs text-gray-600">Thời gian máy hư bắt đầu sửa :</div>
                </div>
                <Input
                  type="datetime-local"
                  value={formData.breakdownStartTime}
                  onChange={(e) => updateFormField('breakdownStartTime', e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 5: Priority */}
          <div className="border-b border-black p-3 flex flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="text-sm font-semibold">Priority :</div>
              <div className="text-xs text-gray-600">Tình trạng :</div>
            </div>
            <RadioGroup 
              value={formData.priority} 
              onValueChange={(value) => updateFormField('priority', value as 'Normal' | 'High')}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Normal" id="normal" />
                <Label htmlFor="normal" className="text-sm">Normal : Thường</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="High" id="high" />
                <Label htmlFor="high" className="text-sm">High : Nặng</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Row 6: Service Request Form */}
          <div className="border-b border-black p-3 flex flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="text-sm font-semibold">Service request form :</div>
              <div className="text-xs text-gray-600">Yêu cầu sửa chữa từ :</div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="machine-maintenance"
                  checked={formData.serviceRequestForm === 'Machine Maintenance'}
                  onCheckedChange={() => updateFormField('serviceRequestForm', 'Machine Maintenance')}
                />
                <Label htmlFor="machine-maintenance" className="text-sm">
                  Machine Maintenance : Bảo trì máy
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mold-maintenance"
                  checked={formData.serviceRequestForm === 'Mold Maintenance'}
                  onCheckedChange={() => updateFormField('serviceRequestForm', 'Mold Maintenance')}
                />
                <Label htmlFor="mold-maintenance" className="text-sm">
                  Mold Maintenance : Bảo trì khuôn
                </Label>
              </div>
            </div>
          </div>

          {/* Row 7: Problem Description */}
          <div className="border-b border-black p-3 flex flex-row items-start gap-4">
            <div className="flex-shrink-0">
              <div className="text-sm font-semibold">Problem description :</div>
              <div className="text-xs text-gray-600">Vấn đề hư hỏng :</div>
            </div>
            <Textarea
              value={formData.problemDescription}
              onChange={(e) => updateFormField('problemDescription', e.target.value)}
              rows={4}
              className="flex-1 resize-none"
              placeholder="Describe the problem in detail..."
              required
            />
          </div>

          {/* Row 8: Requested By, Received By */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Requested Dept & by :</div>
                  <div className="text-xs text-gray-600">Người yêu cầu :</div>
                </div>
                <Input
                  value={formData.requestedBy}
                  onChange={(e) => updateFormField('requestedBy', e.target.value)}
                  placeholder="Name and department"
                  className="flex-1"
                  required
                />
              </div>
              <div className="p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Received by :</div>
                  <div className="text-xs text-gray-600">Người nhận :</div>
                </div>
                <Input
                  value={completionData.receivedBy}
                  onChange={(e) => updateCompletionField('receivedBy', e.target.value)}
                  placeholder="Receiver name"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Row 9: Corrective Action Taken */}
          <div className="border-b border-black p-3 flex flex-col items-start gap-2">
            <div className="flex-shrink-0 flex flex-row">
              <div className="text-sm font-semibold">Corrective action taken :</div>
              <div className="text-xs text-gray-600">Ý kiến sửa chữa :</div>
            </div>
            <Textarea
              value={completionData.correctiveActionTaken}
              onChange={(e) => updateCompletionField('correctiveActionTaken', e.target.value)}
              rows={3}
              className="flex-1 resize-none"
              placeholder="Describe corrective actions taken..."
            />
          </div>

          {/* Row 10: Breakdown Finished Date, Done By */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Breakdown finished date :</div>
                  <div className="text-xs text-gray-600">Ngày hoàn tất :</div>
                </div>
                <Input
                  type="date"
                  value={completionData.breakdownFinishedDate}
                  onChange={(e) => updateCompletionField('breakdownFinishedDate', e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Done by :</div>
                  <div className="text-xs text-gray-600">Người sửa :</div>
                </div>
                <Input
                  value={completionData.doneBy}
                  onChange={(e) => updateCompletionField('doneBy', e.target.value)}
                  placeholder="Technician name"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Row 11: Breakdown End Time, Total Stop Hours */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Breakdown End Time :</div>
                  <div className="text-xs text-gray-600">Giờ hoàn tất :</div>
                </div>
                <Input
                  type="time"
                  value={completionData.breakdownEndTime}
                  onChange={(e) => updateCompletionField('breakdownEndTime', e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="p-3 flex flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold">Total stop Hours :</div>
                  <div className="text-xs text-gray-600">Tổng thời gian dừng :</div>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  value={completionData.totalStopHours}
                  onChange={(e) => updateCompletionField('totalStopHours', e.target.value)}
                  placeholder="Hours"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Row 12: Breakdown Reviewed, Maintenance Status */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3 flex flex-col items-center gap-2">
                <div className="flex-shrink-0 flex flex-row items-center gap-2">
                  <div className="text-sm font-semibold">Breakdown reviewed & closed</div>
                  <div className="text-xs text-gray-600">Ý kiến sau sửa chữa</div>
                </div>
                <Input
                  value={completionData.breakdownReviewed}
                  onChange={(e) => updateCompletionField('breakdownReviewed', e.target.value)}
                  placeholder="Review notes"
                  className="flex-1"
                />
              </div>
              <div className="p-3 flex flex-col gap-4">
                <div className="flex-shrink-0 flex flex-row gap-2 items-center ">
                  <div className="text-sm font-semibold">Maintenance Status :</div>
                  <div className="text-xs text-gray-600">Tình trạng bảo trì :</div>
                </div>
                <RadioGroup 
                  value={completionData.maintenanceStatus} 
                  onValueChange={(value) => updateCompletionField('maintenanceStatus', value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rectified" id="rectified" />
                    <Label htmlFor="rectified" className="text-sm">Rectified : Chấp nhận</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-rectified" id="not-rectified" />
                    <Label htmlFor="not-rectified" className="text-sm">Not Rectified : Không chấp nhận</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Row 13: Comments, Others */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3 flex flex-col items-start gap-2">
                <div className="flex-shrink-0 flex flex-row gap-2 items-center">
                  <div className="text-sm font-semibold">Comments :</div>
                  <div className="text-xs text-gray-600">Kiến nghị :</div>
                </div>
                <Textarea
                  value={completionData.comments}
                  onChange={(e) => updateCompletionField('comments', e.target.value)}
                  rows={3}
                  className="flex-1 resize-none"
                  placeholder="Additional comments..."
                />
              </div>
              <div className="p-3 flex flex-col items-start gap-2">
                <div className="flex-shrink-0 flex flex-row gap-2 items-center">
                  <div className="text-sm font-semibold">Others :</div>
                  <div className="text-xs text-gray-600">Ý kiến khác :</div>
                </div>
                <Textarea
                  value={completionData.others}
                  onChange={(e) => updateCompletionField('others', e.target.value)}
                  rows={3}
                  className="flex-1 resize-none"
                  placeholder="Other feedback..."
                />
              </div>
            </div>
          </div>

          {/* Reviewed & Closed By */}
          <div className="border-b border-black p-3 text-center">
            <div className="text-sm font-semibold">Reviewed & closed by</div>
            <div className="text-xs text-gray-600">Ý kiến, hoàn thành</div>
          </div>

          {/* Row 14: Department Sign-offs */}
          <div className="border-b border-black">
            <div className="grid grid-cols-4">
              <div className="border-r border-black p-3 text-center">
                <div className="mb-2">
                  <div className="text-sm font-semibold">Engineering</div>
                  <div className="text-xs text-gray-600">Kỹ thuật</div>
                </div>
                <Input
                  value={completionData.reviewedByEngineering}
                  onChange={(e) => updateCompletionField('reviewedByEngineering', e.target.value)}
                  placeholder="Signature"
                  className="w-full text-center"
                />
              </div>
              <div className="border-r border-black p-3 text-center">
                <div className="mb-2">
                  <div className="text-sm font-semibold">Quality</div>
                  <div className="text-xs text-gray-600">Chất lượng</div>
                </div>
                <Input
                  value={completionData.reviewedByQuality}
                  onChange={(e) => updateCompletionField('reviewedByQuality', e.target.value)}
                  placeholder="Signature"
                  className="w-full text-center"
                />
              </div>
              <div className="border-r border-black p-3 text-center">
                <div className="mb-2">
                  <div className="text-sm font-semibold">Mold Shop / Machine Maintenance</div>
                  <div className="text-xs text-gray-600">Bảo trì khuôn / Bảo trì máy</div>
                </div>
                <Input
                  value={completionData.reviewedByMoldShop}
                  onChange={(e) => updateCompletionField('reviewedByMoldShop', e.target.value)}
                  placeholder="Signature"
                  className="w-full text-center"
                />
              </div>
              <div className="p-3 text-center">
                <div className="mb-2">
                  <div className="text-sm font-semibold">Production</div>
                  <div className="text-xs text-gray-600">Sản xuất</div>
                </div>
                <Input
                  value={completionData.reviewedByProduction}
                  onChange={(e) => updateCompletionField('reviewedByProduction', e.target.value)}
                  placeholder="Signature"
                  className="w-full text-center"
                />
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-6 print:hidden">
        <Button 
          onClick={handleSubmit}
          disabled={!isFormValid() || saving}
          size="lg"
          className="min-w-[200px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Creating Request...' : 'Create Maintenance Request'}
        </Button>
      </div>
    </div>
  );
}