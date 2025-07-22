"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trash2, Plus } from 'lucide-react';
import { RequirementGroup, Requirement } from '@/hooks/machine-types';

interface MaintenanceTemplateEditorProps {
  frequency: string;
  groups: RequirementGroup[];
  onChange: (groups: RequirementGroup[]) => void;
}

export default function MaintenanceTemplateEditor({ 
  frequency, 
  groups, 
  onChange 
}: MaintenanceTemplateEditorProps) {
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);

  const addGroup = () => {
    if (newGroupTitle.trim()) {
      onChange([...groups, { groupTitle: newGroupTitle.trim(), requirements: [] }]);
      setNewGroupTitle('');
      setShowAddGroup(false);
    }
  };

  const removeGroup = (groupIndex: number) => {
    onChange(groups.filter((_, i) => i !== groupIndex));
  };

  const updateGroupTitle = (groupIndex: number, title: string) => {
    onChange(
      groups.map((group, i) => 
        i === groupIndex ? { ...group, groupTitle: title } : group
      )
    );
  };

  const addRequirement = (groupIndex: number) => {
    const newRequirement: Requirement = {
      titleEng: '',
      titleVn: '',
      note: ''
    };

    onChange(
      groups.map((group, i) => 
        i === groupIndex 
          ? { ...group, requirements: [...group.requirements, newRequirement] }
          : group
      )
    );
  };

  const removeRequirement = (groupIndex: number, reqIndex: number) => {
    onChange(
      groups.map((group, i) => 
        i === groupIndex 
          ? { ...group, requirements: group.requirements.filter((_, j) => j !== reqIndex) }
          : group
      )
    );
  };

  const updateRequirement = (groupIndex: number, reqIndex: number, field: keyof Requirement, value: string) => {
    onChange(
      groups.map((group, i) => 
        i === groupIndex 
          ? {
              ...group,
              requirements: group.requirements.map((req, j) => 
                j === reqIndex ? { ...req, [field]: value } : req
              )
            }
          : group
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{frequency} Maintenance Requirements</h3>
          <p className="text-sm text-gray-500">
            {groups.length} group{groups.length !== 1 ? 's' : ''}, {' '}
            {groups.reduce((acc, group) => acc + group.requirements.length, 0)} requirement{groups.reduce((acc, group) => acc + group.requirements.length, 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowAddGroup(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      {showAddGroup && (
        <Card className="p-4 border-dashed">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                value={newGroupTitle}
                onChange={(e) => setNewGroupTitle(e.target.value)}
                placeholder="Enter group title"
                onKeyPress={(e) => e.key === 'Enter' && addGroup()}
              />
            </div>
            <Button onClick={addGroup} disabled={!newGroupTitle.trim()}>
              Add
            </Button>
            <Button variant="outline" onClick={() => {
              setShowAddGroup(false);
              setNewGroupTitle('');
            }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {groups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Input
                    value={group.groupTitle}
                    onChange={(e) => updateGroupTitle(groupIndex, e.target.value)}
                    className="font-medium text-lg border-none p-0 focus-visible:ring-0"
                    placeholder="Group title"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addRequirement(groupIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Requirement
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeGroup(groupIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {group.requirements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No requirements in this group yet.</p>
                  <p className="text-sm">Click &quot; Add Requirement &quot; to add the first requirement.</p>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {group.requirements.map((requirement, reqIndex) => (
                    <AccordionItem key={reqIndex} value={`req-${reqIndex}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full mr-4">
                          <span className="text-left">
                            {requirement.titleEng || `Requirement ${reqIndex + 1}`}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Title (English) *</Label>
                              <Input
                                value={requirement.titleEng}
                                onChange={(e) => updateRequirement(groupIndex, reqIndex, 'titleEng', e.target.value)}
                                placeholder="English title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Title (Vietnamese)</Label>
                              <Input
                                value={requirement.titleVn}
                                onChange={(e) => updateRequirement(groupIndex, reqIndex, 'titleVn', e.target.value)}
                                placeholder="Vietnamese title"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeRequirement(groupIndex, reqIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove Requirement
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No requirement groups added yet.</p>
          <p className="text-sm">Start by adding a requirement group for {frequency.toLowerCase()} maintenance.</p>
        </div>
      )}
    </div>
  );
}
