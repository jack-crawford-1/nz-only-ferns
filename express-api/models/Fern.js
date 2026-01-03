import { Schema, model } from "mongoose";

const FernSchema = new Schema({
  id: { type: String, default: null },
  scientificName: { type: String, required: true, unique: true, index: true },
  authorship: { type: String, default: null },
  rank: { type: String, default: null },
  genus: { type: String, default: null },
  specificEpithet: { type: String, default: null },
  family: { type: String, required: true },
  order: { type: String, default: null },
  class: { type: String, default: null },
  subphylum: { type: String, default: null },
  biostatus: {
    origin: { type: String, default: null },
    occurrence: { type: String, default: null },
    endemicToNZ: { type: Boolean, default: null },
  },
  synonyms: { type: [String], default: [] },
  notes: {
    habitat: { type: String, default: null },
    distributionNZ: { type: String, default: null },
    altitudinalRange: { type: String, default: null },
    conservationStatus: { type: String, default: null },
    iNaturalistTaxonId: { type: String, default: null },
    wikidataId: { type: String, default: null },
  },
  source: {
    document: { type: String, default: null },
    publisher: { type: String, default: null },
  },
  isNative: { type: Boolean, default: null },
  isEndemic: { type: Boolean, default: null },
  commonNames: { type: [String], default: [] },
  conservationStatus: { type: String, default: null },
  altitudinalRange: { type: String, default: null },
  distribution: { type: String, default: null },
  habitat: { type: String, default: null },
  recognition: { type: String, default: null },
  notesText: { type: String, default: null },
  imageUrls: { type: [String], default: [] },
  imageUrl: { type: String, default: null },
});

export const FernModel = model("Fern", FernSchema);
