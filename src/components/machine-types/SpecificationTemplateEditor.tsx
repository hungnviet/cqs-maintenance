"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

interface SpecificationTemplateEditorProps {
  specifications: { title: string }[];
  onChange: (specifications: { title: string }[]) => void;
}

export default function SpecificationTemplateEditor({ 
  specifications, 
  onChange 
}: SpecificationTemplateEditorProps) {
  const [newSpecTitle, setNewSpecTitle] = useState('');

  const addSpecification = () => {
    if (newSpecTitle.trim()) {
      onChange([...specifications, { title: newSpecTitle.trim() }]);
      setNewSpecTitle('');
    }
  };

  const removeSpecification = (index: number) => {
    onChange(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, title: string) => {
    onChange(
      specifications.map((spec, i) => 
        i === index ? { title } : spec
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">Specification Fields</Label>
        <span className="text-sm text-gray-500">
          {specifications.length} specification{specifications.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {specifications.map((spec, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  value={spec.title}
                  onChange={(e) => updateSpecification(index, e.target.value)}
                  placeholder="Specification title"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeSpecification(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 border-dashed">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              value={newSpecTitle}
              onChange={(e) => setNewSpecTitle(e.target.value)}
              placeholder="Enter new specification title"
              onKeyPress={(e) => e.key === 'Enter' && addSpecification()}
            />
          </div>
          <Button onClick={addSpecification} disabled={!newSpecTitle.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Specification
          </Button>
        </div>
      </Card>

      {specifications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No specifications added yet.</p>
          <p className="text-sm">Add specification fields that will be used when creating machines of this type.</p>
        </div>
      )}
    </div>
  );
}
