"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMachineMaintenanceTemplates } from '@/hooks/machine';
import { toast } from 'sonner';
import StandardMaintenanceForm from './StandardMaintenanceForm';
import DailyMaintenanceForm from './DailyMaintenanceForm';
import { MaintenanceTemplate, Machine } from './types';

interface MachineMaintenanceTemplatesProps {
  machineCode: string;
  machine?: Machine;
}

export default function MachineMaintenanceTemplates({ machineCode, machine }: MachineMaintenanceTemplatesProps) {
  const [templates, setTemplates] = useState<MaintenanceTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMachineMaintenanceTemplates(machineCode);
      if (response.success) {
        setTemplates(response.data || []);
      } else {
        toast.error('Failed to load maintenance templates');
      }
    } catch {
      toast.error('Failed to load maintenance templates');
    } finally {
      setLoading(false);
    }
  }, [machineCode]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);


  const renderMaintenanceForm = (template: MaintenanceTemplate) => {
    if (template.frequency === 'Daily') {
      return (
        <DailyMaintenanceForm 
          template={template} 
          machine={machine} 
          renderMachineImages={renderMachineImages} 
        />
      );
    } else {
      return (
        <StandardMaintenanceForm 
          template={template} 
          machine={machine} 
          renderMachineImages={renderMachineImages} 
        />
      );
    }
  };

  const renderMachineImages = (images: string[] = []) => {
    if (!images || images.length === 0) {
      return null;
    }

    const imageElements = images.map((imageUrl, index) => (
      <div key={index} className="w-full h-48 bg-gray-100 rounded overflow-hidden relative">
        <Image 
          src={imageUrl} 
          alt={`Machine image ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          onError={() => {
            // We can't directly set src with Next.js Image, so we'll handle fallback through state if needed
            // This is a placeholder for error handling
          }}
        />
      </div>
    ));

    // Layout logic based on number of images
    if (images.length === 1) {
      return (
        <div className="flex justify-center">
          <div className="w-64">
            {imageElements[0]}
          </div>
        </div>
      );
    } else if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {imageElements}
        </div>
      );
    } else if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            {imageElements[0]}
          </div>
          <div className="grid grid-rows-2 gap-2">
            {imageElements[1]}
            {imageElements[2]}
          </div>
        </div>
      );
    } else {
      // For more than 3 images, show first 3 with same layout as 3 images
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            {imageElements[0]}
          </div>
          <div className="grid grid-rows-2 gap-2">
            {imageElements[1]}
            {imageElements[2]}
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading maintenance templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="half-yearly">Half-Yearly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        {templates.map((template) => (
          <TabsContent key={template.frequency} value={template.frequency.toLowerCase()}>
            {renderMaintenanceForm(template)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
