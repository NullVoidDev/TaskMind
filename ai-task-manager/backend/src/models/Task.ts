import mongoose, { Document, Schema } from 'mongoose';
import { ITask } from '../types';

export interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  list: {
    type: Schema.Types.ObjectId,
    ref: 'List',
    required: true,
  },
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  labels: [{
    type: Schema.Types.ObjectId,
    ref: 'Label',
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: null,
  },
  actualHours: {
    type: Number,
    min: 0,
    default: null,
  },
  position: {
    type: Number,
    required: true,
    default: 0,
  },
  aiSuggestions: {
    suggestedPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
    },
    suggestedDueDate: {
      type: Date,
    },
    improvedDescription: {
      type: String,
      maxlength: 2000,
    },
    estimatedComplexity: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
taskSchema.index({ list: 1, position: 1 });
taskSchema.index({ board: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ labels: 1 });

// Text search index
taskSchema.index({
  title: 'text',
  description: 'text',
});

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);