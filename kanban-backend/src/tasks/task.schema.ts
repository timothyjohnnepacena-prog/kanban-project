import { Schema, Document } from 'mongoose';

export interface Task extends Document {
  title: string;
  status: string;
  position: number; // Add this line
}

export const TaskSchema = new Schema({
  title: { type: String, required: true },
  status: { type: String, default: 'todo' },
  position: { type: Number, default: 0 }, // Add this line
}, { timestamps: true });