import mongoose, { Schema, Document } from 'mongoose';

export interface IAssetEvent extends Document {
  assetId: mongoose.Types.ObjectId;
  eventType: 'LOST' | 'FOUND' | 'DEPOSITED' | 'RECOVERED';
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  extractedTags: string[];
  eventTimestamp: Date;
  transactionTime: Date;
  piiRedacted: boolean;
  secretKey?: string; // Used for "LOST" items specifically for zero-trust
  imageUrl?: string; // Path to securely blurred vault image
  trustPenaltyApplied?: boolean;
}

const AssetEventSchema: Schema = new Schema({
  assetId: { type: Schema.Types.ObjectId, required: true, auto: true },
  eventType: { 
    type: String, 
    required: true, 
    enum: ['LOST', 'FOUND', 'DEPOSITED', 'RECOVERED'] 
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  extractedTags: [{ type: String }],
  eventTimestamp: { type: Date, required: true, index: -1 },
  transactionTime: { type: Date, default: Date.now },
  piiRedacted: { type: Boolean, default: false },
  secretKey: { type: String },
  imageUrl: { type: String },
  trustPenaltyApplied: { type: Boolean, default: false }
});

// Configure MongoDB 2dsphere index for Spatiotemporal querying
AssetEventSchema.index({ location: '2dsphere', extractedTags: 1 });
AssetEventSchema.index({ eventTimestamp: -1 });

// Partial Indexing for DPDP compliance (e.g., query unredacted docs quickly)
AssetEventSchema.index({ piiRedacted: 1 }, { partialFilterExpression: { piiRedacted: false }});

export const AssetEvent = mongoose.model<IAssetEvent>('AssetEvent', AssetEventSchema);
