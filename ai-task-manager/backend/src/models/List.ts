import mongoose, { Document, Schema } from 'mongoose';
import { IList } from '../types';

export interface IListDocument extends IList, Document {}

const listSchema = new Schema<IListDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task',
  }],
  position: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for better query performance
listSchema.index({ board: 1, position: 1 });

export const List = mongoose.model<IListDocument>('List', listSchema);