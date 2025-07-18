import mongoose, { Schema, Document } from 'mongoose';

export interface ISparePart extends Document {
  sparePartCode: string;
  sparePartName: string;
  sparePartPrice: number;
  supplierName: string;
  supplierPhone: string;
  supplierAddress: string;
  supplierEmail: string;
  transportTime: number;
  inventoryQuantity: number;
  estimatedUsage: number;
  plant: string;
  description: string;
  lowerBoundInventory: number;
  imageUrl: string;
}

const SparePartSchema: Schema = new Schema({
  sparePartCode: { type: String, unique: true, required: true },
  sparePartName: String,
  sparePartPrice: Number,
  supplierName: String,
  supplierPhone: String,
  supplierAddress: String,
  supplierEmail: String,
  transportTime: Number,
  inventoryQuantity: Number,
  estimatedUsage: Number,
  plant: String,
  description: String,
  lowerBoundInventory: Number,
  imageUrl: String,
});

export default mongoose.models.SparePart || mongoose.model<ISparePart>('SparePart', SparePartSchema); 