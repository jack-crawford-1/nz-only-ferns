import type { FernRecord } from "../types/Ferns";

export const titleCase = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export const formatBiostatus = (
  biostatus: FernRecord["biostatus"] | string | null | undefined
): string => {
  if (!biostatus) return "Not recorded";
  if (typeof biostatus === "string") return biostatus;

  const parts: string[] = [];
  if (biostatus.origin) parts.push(titleCase(biostatus.origin));
  if (biostatus.occurrence) parts.push(titleCase(biostatus.occurrence));
  if (biostatus.endemicToNZ === true) parts.push("Endemic");
  if (biostatus.endemicToNZ === false) parts.push("Not endemic");

  return parts.length ? parts.join(" · ") : "Not recorded";
};

export const formatYesNo = (value: boolean | null | undefined) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Unknown";
};

export const formatFactValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "–";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) {
    const joined = value.filter(Boolean).join(", ");
    return joined || "–";
  }
  if (typeof value === "object")
    return formatBiostatus(value as FernRecord["biostatus"]);
  return String(value);
};

/* ---- Field accessors (top-level field with notes.* fallback) ---- */

export const statusOf = (fern: FernRecord): string | null =>
  fern.conservationStatus ?? fern.notes?.conservationStatus ?? null;

export const distributionOf = (fern: FernRecord): string | null =>
  fern.distribution ?? fern.notes?.distributionNZ ?? null;

export const habitatOf = (fern: FernRecord): string | null =>
  fern.habitat ?? fern.notes?.habitat ?? null;

export const altitudeOf = (fern: FernRecord): string | null =>
  fern.altitudinalRange ?? fern.notes?.altitudinalRange ?? null;

export const commonNamesOf = (fern: FernRecord): string =>
  fern.commonNames && fern.commonNames.length > 0
    ? fern.commonNames.join(", ")
    : "";

export const primaryImageOf = (fern: FernRecord): string | null =>
  fern.imageUrl ?? fern.imageUrls?.[0] ?? null;

export const galleryOf = (fern: FernRecord): string[] =>
  fern.imageUrls && fern.imageUrls.length > 0
    ? fern.imageUrls
    : fern.imageUrl
    ? [fern.imageUrl]
    : [];

/* ---- Conservation status → compact code + tier ---- */

export type StatusTier = "threatened" | "at-risk" | "stable" | "unknown";

export type StatusMeta = {
  label: string;
  code: string;
  tier: StatusTier;
};

export const getStatusMeta = (status: string | null | undefined): StatusMeta => {
  const label = status?.trim() || "Not assessed";
  const s = label.toLowerCase();

  const tier = (t: StatusTier, code: string): StatusMeta => ({
    label,
    code,
    tier: t,
  });

  if (s.includes("critical")) return tier("threatened", "NC");
  if (s.includes("endangered")) return tier("threatened", "NE");
  if (s.includes("vulnerable")) return tier("threatened", "NV");
  if (s.includes("declining")) return tier("at-risk", "DC");
  if (s.includes("relict")) return tier("at-risk", "RL");
  if (s.includes("naturally uncommon") || s.includes("uncommon"))
    return tier("at-risk", "NU");
  if (s.includes("not threatened")) return tier("stable", "NT");
  if (s.includes("data deficient")) return tier("unknown", "DD");
  if (s.includes("indistinct")) return tier("unknown", "TI");
  if (s.includes("vagrant")) return tier("unknown", "VG");
  if (s.includes("at risk")) return tier("at-risk", "AR");
  if (s.includes("threatened")) return tier("threatened", "TH");
  return tier("unknown", "–");
};

export const TIER_RANK: Record<StatusTier, number> = {
  threatened: 0,
  "at-risk": 1,
  stable: 2,
  unknown: 3,
};
