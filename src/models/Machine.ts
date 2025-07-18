import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecification {
  title: string;
  value: string;
}

export interface ISparePartMaintenance {
  frequencies: string[]; // Array of frequencies e.g. ['Daily', 'Weekly', 'Monthly']
  sparePart: mongoose.Schema.Types.ObjectId;
  quantity: number;
}

export interface IMaintenanceSchedule {
  frequency: string;
  plannedDate: Date;
  actualDate?: Date | null;
  completedForm?: mongoose.Schema.Types.ObjectId;
}

export interface IMachine extends Document {
  machineName: string;
  machineCode: string;
  machineType: mongoose.Schema.Types.ObjectId;
  purchaseDate: Date;
  plant: string;
  status: string;
  images: string[];
  description: string;
  specifications: ISpecification[];
  sparePartMaintenance: ISparePartMaintenance[];
  maintenanceSchedule: IMaintenanceSchedule[];
  maintenanceForms: mongoose.Schema.Types.ObjectId[];
}

const MachineSchema: Schema = new Schema({
  machineName: String,
  machineCode: { type: String, unique: true },
  machineType: { type: mongoose.Schema.Types.ObjectId, ref: 'MachineType' },
  purchaseDate: Date,
  plant: String,
  status: { type: String, enum: ['Active', 'Inactive', 'Under Maintenance'] },
  images: [String],
  description: String,
  specifications: [{ title: String, value: String }],
  sparePartMaintenance: [
    {
      frequencies: [{ type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Half-Yearly', 'Yearly'] }],
      sparePart: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart' },
      quantity: Number,
    },
  ],
  maintenanceSchedule: [
    {
      frequency: String,
      plannedDate: Date,
      actualDate: Date,
      completedForm: { type: mongoose.Schema.Types.ObjectId, ref: 'CompletedMaintenanceForm' },
    },
  ],
  maintenanceForms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MachineMaintenanceFormTemplate' }],
});

export default mongoose.models.Machine || mongoose.model<IMachine>('Machine', MachineSchema); 