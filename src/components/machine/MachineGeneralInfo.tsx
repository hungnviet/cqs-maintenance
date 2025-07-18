"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MachineDetail } from '@/hooks/machine';

interface MachineGeneralInfoProps {
  machine: MachineDetail;
}

export default function MachineGeneralInfo({ machine }: MachineGeneralInfoProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Machine Name</label>
              <p className="text-lg">{machine.machineName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Machine Code</label>
              <p className="text-lg font-mono">{machine.machineCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Machine Type</label>
              <p className="text-lg">{machine.machineType.typeName}</p>
              <p className="text-sm text-gray-500">{machine.machineType.machineTypeCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Plant</label>
              <p className="text-lg">{machine.plant}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(machine.status)}>
                  {machine.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Purchase Date</label>
              <p className="text-lg">
                {new Date(machine.purchaseDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {machine.description && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-lg mt-1">{machine.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Machine Images */}
      {machine.images && machine.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Machine Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machine.images.map((image, index) => (
                <div key={index} className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image}
                    alt={`${machine.machineName} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          {machine.specifications && machine.specifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">Specification</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {machine.specifications.map((spec, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{spec.title}</td>
                      <td className="py-3 px-4 text-gray-600">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No specifications defined</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spare Parts for Maintenance */}
      {machine.sparePartMaintenance && machine.sparePartMaintenance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spare Parts for Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {machine.sparePartMaintenance.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{item.sparePart?.sparePartName || 'Unknown Part'}</span>
                    <p className="text-sm text-gray-500">{item.sparePart?.sparePartCode}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-wrap gap-1 justify-end mb-1">
                      {(item.frequencies || []).map((freq) => (
                        <Badge key={freq} variant="secondary" className="text-xs">
                          {freq}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800';
    case 'Inactive': return 'bg-gray-100 text-gray-800';
    case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
