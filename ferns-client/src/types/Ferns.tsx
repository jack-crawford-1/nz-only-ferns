export interface FernRecord {
  isNative: boolean;
  isEndemic: boolean;
  commonNames: string[];
  scientificName: string;
  family: string;
  conservationStatus: string | null;
  imageUrl?: string;
  links?: {
    self: string;
    collection?: string;
  };
}
