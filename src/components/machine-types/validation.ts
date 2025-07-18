import { z } from 'zod';

// Validation schemas
export const RequirementSchema = z.object({
  titleEng: z.string().min(1, 'English title is required'),
  titleVn: z.string().optional(),
  note: z.string().optional(),
});

export const RequirementGroupSchema = z.object({
  groupTitle: z.string().min(1, 'Group title is required'),
  requirements: z.array(RequirementSchema),
});

export const MaintenanceFormTemplateSchema = z.object({
  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Half-Yearly', 'Yearly']),
  groups: z.array(RequirementGroupSchema),
});

export const SpecificationSchema = z.object({
  title: z.string().min(1, 'Specification title is required'),
});

export const MachineTypeFormSchema = z.object({
  typeName: z.string().min(1, 'Type name is required').max(100, 'Type name too long'),
  machineTypeCode: z.string().min(1, 'Machine type code is required').max(50, 'Code too long'),
  description: z.string().optional(),
  specificationTemplate: z.array(SpecificationSchema),
  templates: z.array(MaintenanceFormTemplateSchema).length(5, 'Must have exactly 5 maintenance templates'),
});

export type MachineTypeFormData = z.infer<typeof MachineTypeFormSchema>;
export type RequirementType = z.infer<typeof RequirementSchema>;
export type RequirementGroupType = z.infer<typeof RequirementGroupSchema>;
export type MaintenanceFormTemplateType = z.infer<typeof MaintenanceFormTemplateSchema>;
export type SpecificationType = z.infer<typeof SpecificationSchema>;
