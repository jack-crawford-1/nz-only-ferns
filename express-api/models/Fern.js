import { Schema, model } from "mongoose";

const FernSchema = new Schema({
  isNative: { type: Boolean, required: true },
  isEndemic: { type: Boolean, required: true },
  commonNames: { type: [String], default: [] },
  scientificName: { type: String, required: true, unique: true, index: true },
  family: { type: String, required: true },
  conservationStatus: { type: String, default: null },
  imageUrl: { type: String, default: null },
});

export const FernModel = model("Fern", FernSchema);
