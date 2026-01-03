export interface FernRecord {
  id?: string | null;
  scientificName: string;
  authorship?: string | null;
  rank?: string | null;
  genus?: string | null;
  specificEpithet?: string | null;
  family: string;
  order?: string | null;
  class?: string | null;
  subphylum?: string | null;
  biostatus?: {
    origin?: string | null;
    occurrence?: string | null;
    endemicToNZ?: boolean | null;
  } | null;
  synonyms?: string[];
  notes?: {
    habitat?: string | null;
    distributionNZ?: string | null;
    altitudinalRange?: string | null;
    conservationStatus?: string | null;
    iNaturalistTaxonId?: string | null;
    wikidataId?: string | null;
  } | null;
  source?: {
    document?: string | null;
    publisher?: string | null;
  } | null;
  isNative?: boolean | null;
  isEndemic?: boolean | null;
  commonNames?: string[];
  conservationStatus?: string | null;
  altitudinalRange?: string | null;
  distribution?: string | null;
  habitat?: string | null;
  recognition?: string | null;
  notesText?: string | null;
  imageUrls?: string[];
  imageUrl?: string;
  links?: {
    self: string;
    collection?: string;
  };
}
