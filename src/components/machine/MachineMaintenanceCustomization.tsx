"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DetailedMachineType } from '@/hooks/machine-types';

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

interface MachineMaintenanceCustomizationProps {
  machineType: DetailedMachineType | null;
  templates: MaintenanceTemplate[];
  onChange: (templates: MaintenanceTemplate[]) => void;
}

const frequencies = ['Daily', 'Weekly', 'Monthly', 'Half-Yearly', 'Yearly'];

export default function MachineMaintenanceCustomization({
  machineType,
  templates,
  onChange
}: MachineMaintenanceCustomizationProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily');

  useEffect(() => {
    if (machineType) {
      loadTemplatesFromType();
    }
  }, [machineType]);

  const loadTemplatesFromType = async () => {
    if (!machineType) return;

    try {
      setLoading(true);
      
      if (machineType.templates && machineType.templates.length > 0) {
        // Use templates from the machine type detail
        const initialTemplates = frequencies.map(frequency => {
          const typeTemplate = machineType.templates!.find((t: any) => t.frequency === frequency);
          return {
            frequency,
            groups: typeTemplate ? typeTemplate.groups : []
          };
        });
        onChange(initialTemplates);
      } else {
        // Initialize empty templates if no templates exist
        const emptyTemplates = frequencies.map(frequency => ({
          frequency,
          groups: []
        }));
        onChange(emptyTemplates);
      }
    } catch (error) {
      toast.error('Failed to load maintenance templates');
      // Initialize empty templates as fallback
      const emptyTemplates = frequencies.map(frequency => ({
        frequency,
        groups: []
      }));
      onChange(emptyTemplates);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTemplate = () => {
    return templates.find(t => t.frequency === activeTab) || { frequency: activeTab, groups: [] };
  };

  const updateTemplate = (updatedTemplate: MaintenanceTemplate) => {
    const updated = templates.map(t => 
      t.frequency === activeTab ? updatedTemplate : t
    );
    onChange(updated);
  };

  const addGroup = () => {
    const currentTemplate = getCurrentTemplate();
    const newGroup: Group = {
      groupTitle: `New Group ${currentTemplate.groups.length + 1}`,
      requirements: []
    };
    updateTemplate({
      ...currentTemplate,
      groups: [...currentTemplate.groups, newGroup]
    });
  };

  const updateGroup = (groupIndex: number, updatedGroup: Group) => {
    const currentTemplate = getCurrentTemplate();
    const updatedGroups = currentTemplate.groups.map((group, index) =>
      index === groupIndex ? updatedGroup : group
    );
    updateTemplate({
      ...currentTemplate,
      groups: updatedGroups
    });
  };

  const removeGroup = (groupIndex: number) => {
    const currentTemplate = getCurrentTemplate();
    const updatedGroups = currentTemplate.groups.filter((_, index) => index !== groupIndex);
    updateTemplate({
      ...currentTemplate,
      groups: updatedGroups
    });
  };

  const addRequirement = (groupIndex: number) => {
    const currentTemplate = getCurrentTemplate();
    const updatedGroups = currentTemplate.groups.map((group, index) => {
      if (index === groupIndex) {
        return {
          ...group,
          requirements: [
            ...group.requirements,
            { titleEng: '', titleVn: '' }
          ]
        };
      }
      return group;
    });
    updateTemplate({
      ...currentTemplate,
      groups: updatedGroups
    });
  };

  const updateRequirement = (groupIndex: number, reqIndex: number, field: keyof Requirement, value: string) => {
    const currentTemplate = getCurrentTemplate();
    const updatedGroups = currentTemplate.groups.map((group, gIndex) => {
      if (gIndex === groupIndex) {
        const updatedRequirements = group.requirements.map((req, rIndex) =>
          rIndex === reqIndex ? { ...req, [field]: value } : req
        );
        return { ...group, requirements: updatedRequirements };
      }
      return group;
    });
    updateTemplate({
      ...currentTemplate,
      groups: updatedGroups
    });
  };

  const removeRequirement = (groupIndex: number, reqIndex: number) => {
    const currentTemplate = getCurrentTemplate();
    const updatedGroups = currentTemplate.groups.map((group, gIndex) => {
      if (gIndex === groupIndex) {
        return {
          ...group,
          requirements: group.requirements.filter((_, rIndex) => rIndex !== reqIndex)
        };
      }
      return group;
    });
    updateTemplate({
      ...currentTemplate,
      groups: updatedGroups
    });
  };

  const copyFromFrequency = (sourceFrequency: string) => {
    const sourceTemplate = templates.find(t => t.frequency === sourceFrequency);
    if (sourceTemplate) {
      updateTemplate({
        frequency: activeTab,
        groups: JSON.parse(JSON.stringify(sourceTemplate.groups)) // Deep copy
      });
      toast.success(`Copied template from ${sourceFrequency}`);
    }
  };

  const getCompletionStatus = () => {
    const totalTemplates = frequencies.length;
    const completedTemplates = templates.filter(t => 
      t.groups.length > 0 && 
      t.groups.every(g => 
        g.groupTitle.trim() !== '' && 
        g.requirements.length > 0 &&
        g.requirements.every(r => r.titleEng.trim() !== '' && r.titleVn.trim() !== '')
      )
    ).length;
    
    return { completed: completedTemplates, total: totalTemplates };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading maintenance templates...</p>
        </div>
      </div>
    );
  }

  const currentTemplate = getCurrentTemplate();
  const { completed, total } = getCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Template Completion</span>
            <span className="text-sm text-gray-600">{completed} of {total} frequencies completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
          <div className="flex gap-2 mt-3">
            {frequencies.map(freq => {
              const template = templates.find(t => t.frequency === freq);
              const isCompleted = template && template.groups.length > 0 && 
                template.groups.every(g => g.groupTitle.trim() !== '' && g.requirements.length > 0);
              return (
                <Badge key={freq} variant={isCompleted ? "default" : "secondary"}>
                  {freq} {isCompleted && <Check className="h-3 w-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Template Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Templates</CardTitle>
          <p className="text-sm text-gray-500">
            Customize the maintenance requirements for each frequency. Based on {machineType?.typeName} templates.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              {frequencies.map((frequency) => (
                <TabsTrigger key={frequency} value={frequency} className="text-xs">
                  {frequency}
                </TabsTrigger>
              ))}
            </TabsList>

            {frequencies.map((frequency) => (
              <TabsContent key={frequency} value={frequency} className="space-y-4">
                {/* Tab Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{frequency} Maintenance</h3>
                  <div className="flex gap-2">
                    {templates.some(t => t.frequency !== frequency && t.groups.length > 0) && (
                      <div className="relative group">
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy from...
                        </Button>
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          {frequencies
                            .filter(f => f !== frequency && templates.find(t => t.frequency === f)?.groups.length && templates.find(t => t.frequency === f)!.groups.length > 0)
                            .map(f => (
                              <button
                                key={f}
                                className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm whitespace-nowrap"
                                onClick={() => copyFromFrequency(f)}
                              >
                                {f}
                              </button>
                            ))
                          }
                        </div>
                      </div>
                    )}
                    <Button onClick={addGroup} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Group
                    </Button>
                  </div>
                </div>

                {/* Groups */}
                {currentTemplate.groups.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No maintenance groups defined</p>
                    <p className="text-sm text-gray-400 mt-1">Add groups to organize maintenance requirements</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentTemplate.groups.map((group, groupIndex) => (
                      <Card key={groupIndex} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Input
                                value={group.groupTitle}
                                onChange={(e) => updateGroup(groupIndex, { ...group, groupTitle: e.target.value })}
                                placeholder="Group title"
                                className="font-medium"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeGroup(groupIndex)}
                              className="ml-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Requirements */}
                          {group.requirements.map((requirement, reqIndex) => (
                            <div key={reqIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-lg">
                              <div className="space-y-2">
                                <Label>English Title</Label>
                                <Input
                                  value={requirement.titleEng}
                                  onChange={(e) => updateRequirement(groupIndex, reqIndex, 'titleEng', e.target.value)}
                                  placeholder="English requirement title"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Vietnamese Title</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={requirement.titleVn}
                                    onChange={(e) => updateRequirement(groupIndex, reqIndex, 'titleVn', e.target.value)}
                                    placeholder="Vietnamese requirement title"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeRequirement(groupIndex, reqIndex)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addRequirement(groupIndex)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Requirement
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
