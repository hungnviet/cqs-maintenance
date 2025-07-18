import mongoose, { Schema, Document } from 'mongoose';

export interface IMachineType extends Document {
  typeName: string;
  machineTypeCode: string;
  specificationTemplate: { title: string }[];
  totalMachines: number;
  description?: string;
}

const MachineTypeSchema: Schema = new Schema({
  typeName: { type: String, unique: true, required: true },
  machineTypeCode: { type: String, unique: true, required: true },
  specificationTemplate: [{ title: String }],
  totalMachines: { type: Number, default: 0 },
  description: { type: String },
});

export default mongoose.models.MachineType || mongoose.model<IMachineType>('MachineType', MachineTypeSchema); 