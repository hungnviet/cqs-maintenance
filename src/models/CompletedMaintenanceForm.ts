import mongoose, { Schema, Document } from 'mongoose';

export interface ICompletedRequirement {
  titleEng: string;
  titleVn: string;
  accepted: boolean;
  note: string;
}

export interface ICompletedGroup {
  groupTitle: string;
  requirements: ICompletedRequirement[];
}

export interface ICompletedMaintenanceForm extends Document {
  machine: mongoose.Schema.Types.ObjectId;
  frequency: string;
  date: Date;
  maintenanceStartTime: Date;
  maintenanceEndTime: Date;
  maintenanceOperatorNumber: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  remarks: string;
  filledBy?: mongoose.Schema.Types.ObjectId;
  filledAt: Date;
  groups: ICompletedGroup[];
}

const CompletedMaintenanceFormSchema: Schema = new Schema({
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
  frequency: String,
  date: Date,
  maintenanceStartTime: Date,
  maintenanceEndTime: Date,
  maintenanceOperatorNumber: String,
  preparedBy: String,
  checkedBy: String,
  approvedBy: String,
  remarks: String,
  filledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  filledAt: Date,
  groups: [
    {
      groupTitle: String,
      requirements: [
        {
          titleEng: String,
          titleVn: String,
          accepted: Boolean,
          note: String,
        },
      ],
    },
  ],
});

export default mongoose.models.CompletedMaintenanceForm || mongoose.model<ICompletedMaintenanceForm>('CompletedMaintenanceForm', CompletedMaintenanceFormSchema); 