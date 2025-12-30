import { Schema, model } from "mongoose";

const FernSchema = new Schema({
  isNative: { type: Boolean, required: true },
  isEndemic: { type: Boolean, required: true },
  commonNames: { type: [String], default: [] },
  scientificName: { type: String, required: true, unique: true, index: true },
  family: { type: String, required: true },
  conservationStatus: { type: String, default: null },
  biostatus: { type: String, default: null },
  altitudinalRange: { type: String, default: null },
  distribution: { type: String, default: null },
  habitat: { type: String, default: null },
  recognition: { type: String, default: null },
  notes: { type: String, default: null },
  imageUrls: { type: [String], default: [] },
  imageUrl: { type: String, default: null },
});

export const FernModel = model("Fern", FernSchema);
