export interface FernRecord {
  isNative: boolean;
  isEndemic: boolean;
  commonNames: string[];
  scientificName: string;
  family: string;
  conservationStatus: string | null;
  biostatus?: string | null;
  altitudinalRange?: string | null;
  distribution?: string | null;
  habitat?: string | null;
  recognition?: string | null;
  notes?: string | null;
  imageUrls?: string[];
  imageUrl?: string;
  links?: {
    self: string;
    collection?: string;
  };
}
