import mongoose, { Schema, Document } from 'mongoose';

export interface IMachineRequirement {
  titleEng: string;
  titleVn: string;
}

export interface IMachineGroup {
  groupTitle: string;
  requirements: IMachineRequirement[];
}

export interface IMachineMaintenanceFormTemplate extends Document {
  machine: mongoose.Schema.Types.ObjectId;
  frequency: string;
  groups: IMachineGroup[];
}

const MachineMaintenanceFormTemplateSchema: Schema = new Schema({
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Half-Yearly', 'Yearly'], required: true },
  groups: [
    {
      groupTitle: String,
      requirements: [
        {
          titleEng: String,
          titleVn: String,
        },
      ],
    },
  ],
});

export default mongoose.models.MachineMaintenanceFormTemplate || mongoose.model<IMachineMaintenanceFormTemplate>('MachineMaintenanceFormTemplate', MachineMaintenanceFormTemplateSchema); 