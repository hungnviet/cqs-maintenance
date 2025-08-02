import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceRequest extends Document {
  _id: string;
  serialNumber: string; // Auto-generated serial number like 000001
  area: string;
  plant: string;
  machine: mongoose.Types.ObjectId;
  machineNumber: string;
  date: Date;
  shift: string;
  partsName: string;
  partsNumber: string;
  operatorName: string;
  operatorNumber: string;
  breakdownStartTime: Date;
  priority: 'Normal' | 'High';
  serviceRequestForm: 'Machine Maintenance' | 'Mold Maintenance';
  problemDescription: string;
  requestedBy: string;
  receivedBy: string;
  
  // Fields for completion
  correctiveActionTaken?: string;
  breakdownFinishedDate?: Date;
  doneBy?: string;
  breakdownEndTime?: Date;
  totalStopHours?: number;
  maintenanceStatus?: 'Rectified' | 'Not Rectified';
  breakdownReviewedAndClosed?: boolean;
  comments?: string;
  others?: string;
  reviewedAndClosedBy?: string;
  
  // Department approvals
  engineering?: boolean;
  quality?: boolean;
  moldShopMaintenance?: boolean;
  production?: boolean;
  
  // Status and timestamps
  status: 'Pending' | 'In Progress' | 'Completed' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>({
  serialNumber: {
    type: String,
    unique: true
  },
  area: {
    type: String,
    required: true
  },
  plant: {
    type: String,
    required: true
  },
  machine: {
    type: Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  machineNumber: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  shift: {
    type: String,
    required: true
  },
  partsName: {
    type: String,
    required: true
  },
  partsNumber: {
    type: String,
    required: true
  },
  operatorName: {
    type: String,
    required: true
  },
  operatorNumber: {
    type: String,
    required: true
  },
  breakdownStartTime: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['Normal', 'High'],
    required: true,
    default: 'Normal'
  },
  serviceRequestForm: {
    type: String,
    enum: ['Machine Maintenance', 'Mold Maintenance'],
    required: true
  },
  problemDescription: {
    type: String,
    required: true
  },
  requestedBy: {
    type: String,
    required: true
  },
  receivedBy: {
    type: String,
    required: true
  },
  
  // Completion fields
  correctiveActionTaken: {
    type: String
  },
  breakdownFinishedDate: {
    type: Date
  },
  doneBy: {
    type: String
  },
  breakdownEndTime: {
    type: Date
  },
  totalStopHours: {
    type: Number
  },
  maintenanceStatus: {
    type: String,
    enum: ['Rectified', 'Not Rectified']
  },
  breakdownReviewedAndClosed: {
    type: Boolean,
    default: false
  },
  comments: {
    type: String
  },
  others: {
    type: String
  },
  reviewedAndClosedBy: {
    type: String
  },
  
  // Department approvals
  engineering: {
    type: Boolean,
    default: false
  },
  quality: {
    type: Boolean,
    default: false
  },
  moldShopMaintenance: {
    type: Boolean,
    default: false
  },
  production: {
    type: Boolean,
    default: false
  },
  
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Closed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Auto-generate serial number
MaintenanceRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.serialNumber) {
    try {
      const count = await mongoose.model('MaintenanceRequest').countDocuments();
      this.serialNumber = String(count + 1).padStart(6, '0');
    } catch (error) {
      console.error('Error generating serial number:', error);
      // Fallback to timestamp-based serial number
      this.serialNumber = String(Date.now()).slice(-6);
    }
  }
  next();
});

export default mongoose.models.MaintenanceRequest || mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);
