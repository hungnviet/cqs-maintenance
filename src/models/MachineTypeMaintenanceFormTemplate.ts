import mongoose, { Schema, Document } from 'mongoose';

export interface ITypeRequirement {
  titleEng: string;
  titleVn: string;
  note?: string;
}

export interface ITypeGroup {
  groupTitle: string;
  requirements: ITypeRequirement[];
}

export interface IMachineTypeMaintenanceFormTemplate extends Document {
  machineType: mongoose.Schema.Types.ObjectId;
  frequency: string;
  groups: ITypeGroup[];
}

const MachineTypeMaintenanceFormTemplateSchema: Schema = new Schema({
  machineType: { type: mongoose.Schema.Types.ObjectId, ref: 'MachineType', required: true },
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

export default mongoose.models.MachineTypeMaintenanceFormTemplate || mongoose.model<IMachineTypeMaintenanceFormTemplate>('MachineTypeMaintenanceFormTemplate', MachineTypeMaintenanceFormTemplateSchema); 