import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface IIncident extends Document {
  incidentId: string;
  timestamp: Date;
  videoSource: string;
  frameNumber: number;
  confidence: number;
  category: 'Accident' | 'Non-Accident';
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  frameSnapshotPath?: string;
  status: string;
  createdAt: Date;
}

const IncidentSchema = new Schema<IIncident>({
  incidentId: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  videoSource: {
    type: String,
    required: true
  },
  frameNumber: {
    type: Number,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Accident', 'Non-Accident'],
    required: true
  },
  boundingBox: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  frameSnapshotPath: {
    type: String
  },
  status: {
    type: String,
    default: 'Detected'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Incident: Model<IIncident> = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);

export default Incident;
export type { IIncident as IncidentType };
