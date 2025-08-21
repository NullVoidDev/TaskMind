import mongoose, { Document, Schema } from 'mongoose';
import { IBoard } from '../types';

export interface IBoardDocument extends IBoard, Document {}

const boardSchema = new Schema<IBoardDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  lists: [{
    type: Schema.Types.ObjectId,
    ref: 'List',
  }],
}, {
  timestamps: true,
});

// Index for better query performance
boardSchema.index({ owner: 1 });
boardSchema.index({ members: 1 });

export const Board = mongoose.model<IBoardDocument>('Board', boardSchema);