import mongoose, { Document, Schema } from "mongoose";
import { NurseryType } from "../types/nursery.type";

const nurseryMongoSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: false },
    description: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    imageUrl: { type: String, required: false },
    rating: { type: Number, required: false, min: 0, max: 5 },
    tags: { type: [String], default: [] },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coords: number[]) =>
            Array.isArray(coords) && coords.length === 2,
          message: "Coordinates must be [lng, lat]",
        },
      },
    },
  },
  { timestamps: true }
);

nurseryMongoSchema.index({ location: "2dsphere" });

export interface INursery extends NurseryType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const NurseryModel = mongoose.model<INursery>(
  "Nursery",
  nurseryMongoSchema
);
