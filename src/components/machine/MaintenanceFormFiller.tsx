"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Check, X, Image as ImageIcon } from 'lucide-react';

interface MachineDetail {
  _id: string;
  machineName: string;
  machineCode: string;
  machineType: {
    typeName: string;
    machineTypeCode: string;
  };
  images: string[];
}

interface Requirement {
  titleEng: string;
  titleVn: string;
}

interface Group {
  groupTitle: string;
  requirements: Requirement[];
}

interface MaintenanceTemplate {
  frequency: string;
  groups: Group[];
}

interface CompletedRequirement {
  titleEng: string;
  titleVn: string;
  accepted: boolean;
  note: string;
}

interface CompletedGroup {
  groupTitle: string;
  requirements: CompletedRequirement[];
}

interface FormData {
  date: string;
  maintenanceStartTime: string;
  maintenanceEndTime: string;
  maintenanceOperatorNumber: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  remarks: string;
  groups: CompletedGroup[];
}

interface MaintenanceFormFillerProps {
  machine: MachineDetail;
  template: MaintenanceTemplate;
  frequency: string;
  onSave: (formData: FormData) => void;
  saving: boolean;
}

export default function MaintenanceFormFiller({
  machine,
  template,
  frequency,
  onSave,
  saving
}: MaintenanceFormFillerProps) {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    maintenanceStartTime: '',
    maintenanceEndTime: '',
    maintenanceOperatorNumber: '',
    preparedBy: '',
    checkedBy: '',
    approvedBy: '',
    remarks: '',
    groups: template.groups.map(group => ({
      groupTitle: group.groupTitle,
      requirements: group.requirements.map(req => ({
        titleEng: req.titleEng,
        titleVn: req.titleVn,
        accepted: false,
        note: ''
      }))
    }))
  });

  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateRequirement = (
    groupIndex: number, 
    reqIndex: number, 
    field: keyof CompletedRequirement, 
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, gIndex) => {
        if (gIndex === groupIndex) {
          return {
            ...group,
            requirements: group.requirements.map((req, rIndex) =>
              rIndex === reqIndex ? { ...req, [field]: value } : req
            )
          };
        }
        return group;
      })
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const getTotalRequirements = () => {
    return formData.groups.reduce((total, group) => total + group.requirements.length, 0);
  };

  const getCompletedRequirements = () => {
    return formData.groups.reduce((total, group) => 
      total + group.requirements.filter(req => req.accepted).length, 0
    );
  };

  const isFormValid = () => {
    return formData.date && 
           formData.maintenanceStartTime && 
           formData.maintenanceEndTime &&
           formData.preparedBy &&
           formData.checkedBy &&
           formData.approvedBy;
  };

  const isDailyFrequency = frequency === 'Daily';

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {machine.machineType.typeName} Preventive Maintenance {frequency} Checklist
          </CardTitle>
          <p className="text-sm text-gray-500">
            Danh sách kiểm tra bảo trì phòng ngừa {frequency === 'Daily' ? 'hàng ngày' : 
            frequency === 'Weekly' ? 'hàng tuần' : 
            frequency === 'Monthly' ? 'hàng tháng' : 
            frequency === 'Half-Yearly' ? 'nửa năm' : 'hàng năm'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="font-medium">Machine Name:</Label>
              <p>{machine.machineName}</p>
              <Label className="font-medium text-gray-500">Tên máy móc:</Label>
            </div>
            <div>
              <Label className="font-medium">Machine Number:</Label>
              <p>{machine.machineCode}</p>
              <Label className="font-medium text-gray-500">Số máy:</Label>
            </div>
            <div>
              <Label className="font-medium">Maintenance Time:</Label>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <Label className="text-xs">Start:</Label>
                  <Input
                    type="time"
                    value={formData.maintenanceStartTime}
                    onChange={(e) => updateFormField('maintenanceStartTime', e.target.value)}
                    className="h-6 text-xs"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Label className="text-xs">Finish:</Label>
                  <Input
                    type="time"
                    value={formData.maintenanceEndTime}
                    onChange={(e) => updateFormField('maintenanceEndTime', e.target.value)}
                    className="h-6 text-xs"
                    required
                  />
                </div>
              </div>
              <Label className="font-medium text-gray-500">Thời gian bảo trì: Bắt đầu / Kết thúc:</Label>
            </div>
            <div>
              <Label className="font-medium">DATE:</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => updateFormField('date', e.target.value)}
                className="h-8 text-sm"
                required
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label className="font-medium">MAINTENANCE Operator Number:</Label>
            <Input
              placeholder="Enter operator number"
              value={formData.maintenanceOperatorNumber}
              onChange={(e) => updateFormField('maintenanceOperatorNumber', e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Machine Images */}
      {machine.images && machine.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Machine Picture / Hình ảnh máy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {machine.images.map((image, index) => (
                <div key={index} className="aspect-square border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={image}
                    alt={`Machine image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Preventive Maintenance Description / Mô tả bảo trì phòng ngừa
          </CardTitle>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress: {getCompletedRequirements()} / {getTotalRequirements()} completed</span>
            <span>Completion: {getTotalRequirements() > 0 ? Math.round((getCompletedRequirements() / getTotalRequirements()) * 100) : 0}%</span>
          </div>
        </CardHeader>
        <CardContent>
          {isDailyFrequency ? (
            // Daily maintenance layout - table format
            <div className="space-y-6">
              {formData.groups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="font-medium mb-3 text-center bg-gray-100 py-2">
                    {group.groupTitle}
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No.</TableHead>
                        <TableHead>Item Description / Mô tả hạng mục</TableHead>
                        <TableHead className="w-32">Checking method / Phương pháp kiểm tra</TableHead>
                        <TableHead className="w-24">P.I.C</TableHead>
                        {/* Daily columns for checking */}
                        {Array.from({ length: 31 }, (_, i) => (
                          <TableHead key={i} className="w-8 text-center">{i + 1}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.requirements.map((requirement, reqIndex) => (
                        <TableRow key={reqIndex}>
                          <TableCell>{reqIndex + 1}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{requirement.titleEng}</p>
                              <p className="text-sm text-gray-600">{requirement.titleVn}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">Visual / Bằng mắt</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={requirement.accepted}
                              onCheckedChange={(checked: boolean) => 
                                updateRequirement(groupIndex, reqIndex, 'accepted', checked)
                              }
                            />
                          </TableCell>
                          {/* Daily checkboxes */}
                          {Array.from({ length: 31 }, (_, i) => (
                            <TableCell key={i} className="text-center">
                              <Checkbox />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ) : (
            // Weekly/Monthly/Half-Yearly/Yearly layout - list format
            <div className="space-y-6">
              {formData.groups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="font-medium mb-3 text-lg border-b pb-2">
                    {group.groupTitle}
                  </h3>
                  <div className="space-y-4">
                    {group.requirements.map((requirement, reqIndex) => (
                      <div key={reqIndex} className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg">
                        <div className="col-span-1 text-center font-medium">
                          {reqIndex + 1}
                        </div>
                        <div className="col-span-6">
                          <p className="font-medium">{requirement.titleEng}</p>
                          <p className="text-sm text-gray-600">{requirement.titleVn}</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant={requirement.accepted ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateRequirement(groupIndex, reqIndex, 'accepted', true)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={!requirement.accepted ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => updateRequirement(groupIndex, reqIndex, 'accepted', false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Corrective Action / Hành động khắc phục"
                            value={requirement.note}
                            onChange={(e) => updateRequirement(groupIndex, reqIndex, 'note', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification and Approval */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification and Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="preparedBy">Prepared By:</Label>
              <Input
                id="preparedBy"
                value={formData.preparedBy}
                onChange={(e) => updateFormField('preparedBy', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkedBy">Checked By:</Label>
              <Input
                id="checkedBy"
                value={formData.checkedBy}
                onChange={(e) => updateFormField('checkedBy', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvedBy">Approved By:</Label>
              <Input
                id="approvedBy"
                value={formData.approvedBy}
                onChange={(e) => updateFormField('approvedBy', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <Label htmlFor="remarks">REMARKS/GHI CHÚ:</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => updateFormField('remarks', e.target.value)}
              rows={3}
              placeholder="Enter any additional remarks or notes..."
            />
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Verification Symbol / Biểu tượng xác minh</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="default">OK</Badge>
                <Check className="h-4 w-4 text-green-600" />
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">NG</Badge>
                <X className="h-4 w-4 text-red-600" />
                <span>Abnormal</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Note: If When verify found abnormal immediately taken corrective Action Required
              <br />
              Lưu ý: Nếu khi kiểm tra thấy bất thường lập tức thực hiện hành động khắc phục Yêu cầu
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button 
          onClick={handleSubmit}
          disabled={!isFormValid() || saving}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Maintenance Form'}
        </Button>
      </div>
    </div>
  );
}
