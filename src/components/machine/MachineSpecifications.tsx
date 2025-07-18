"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Specification {
  title: string;
  value: string;
}

interface MachineSpecificationsProps {
  specifications: Specification[];
  onChange: (specifications: Specification[]) => void;
}

export default function MachineSpecifications({ specifications, onChange }: MachineSpecificationsProps) {
  const [newSpecTitle, setNewSpecTitle] = useState('');

  const updateSpecification = (index: number, field: keyof Specification, value: string) => {
    const updated = specifications.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    );
    onChange(updated);
  };

  const addSpecification = () => {
    if (!newSpecTitle.trim()) {
      toast.error('Please enter a specification title');
      return;
    }

    // Check if title already exists
    if (specifications.some(spec => spec.title.toLowerCase() === newSpecTitle.toLowerCase())) {
      toast.error('Specification with this title already exists');
      return;
    }

    const newSpec: Specification = {
      title: newSpecTitle.trim(),
      value: ''
    };

    onChange([...specifications, newSpec]);
    setNewSpecTitle('');
    toast.success('Specification added successfully');
  };

  const removeSpecification = (index: number) => {
    const updated = specifications.filter((_, i) => i !== index);
    onChange(updated);
    toast.success('Specification removed');
  };

  const getRequiredFieldsCount = () => {
    return specifications.filter(spec => spec.value.trim() === '').length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Machine Specifications</CardTitle>
          <p className="text-sm text-gray-500">
            Fill in the specification values for this machine. You can also add custom specifications if needed.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Indicator */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {specifications.length - getRequiredFieldsCount()} of {specifications.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${specifications.length > 0 ? ((specifications.length - getRequiredFieldsCount()) / specifications.length) * 100 : 0}%` 
                }}
              />
            </div>
          </div>

          {/* Specifications List */}
          {specifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No specifications defined for this machine type</p>
              <p className="text-sm text-gray-400 mt-1">
                You can add custom specifications below
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor={`spec-title-${index}`}>Specification</Label>
                    <Input
                      id={`spec-title-${index}`}
                      value={spec.title}
                      onChange={(e) => updateSpecification(index, 'title', e.target.value)}
                      placeholder="Specification name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`spec-value-${index}`}>Value *</Label>
                    <Input
                      id={`spec-value-${index}`}
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      placeholder="Enter value"
                      className={spec.value.trim() === '' ? 'border-red-300' : ''}
                    />
                    {spec.value.trim() === '' && (
                      <p className="text-xs text-red-500">This field is required</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Specification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Custom Specification</CardTitle>
          <p className="text-sm text-gray-500">
            Add additional specifications that are specific to this machine
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter specification title"
                value={newSpecTitle}
                onChange={(e) => setNewSpecTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSpecification()}
              />
            </div>
            <Button onClick={addSpecification} disabled={!newSpecTitle.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {specifications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total Specifications: {specifications.length}
              </span>
              <span className={getRequiredFieldsCount() > 0 ? 'text-red-600' : 'text-green-600'}>
                {getRequiredFieldsCount() > 0 
                  ? `${getRequiredFieldsCount()} fields need to be completed`
                  : 'All specifications completed'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
