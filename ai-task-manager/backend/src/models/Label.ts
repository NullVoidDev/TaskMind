import mongoose, { Document, Schema } from 'mongoose';
import { ILabel } from '../types';

export interface ILabelDocument extends ILabel, Document {}

const labelSchema = new Schema<ILabelDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  color: {
    type: String,
    required: true,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  },
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
}, {
  timestamps: true,
});

// Unique constraint for name within a board
labelSchema.index({ name: 1, board: 1 }, { unique: true });

export const Label = mongoose.model<ILabelDocument>('Label', labelSchema);