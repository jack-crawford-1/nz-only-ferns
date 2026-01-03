import { useEffect, useMemo, useState } from "react";
import { fetchRegions } from "../api/fetchRegions";

type Position = [number, number];
type LinearRing = Position[];
type PolygonCoordinates = LinearRing[];
type MultiPolygonCoordinates = PolygonCoordinates[];

type PolygonGeometry = {
  type: "Polygon";
  coordinates: PolygonCoordinates;
};

type MultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: MultiPolygonCoordinates;
};

type GeoFeature = {
  type: "Feature";
  properties: {
    REGC2013_N: string;
  };
  geometry: PolygonGeometry | MultiPolygonGeometry;
};

type GeoCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

type DistributionMapProps = {
  distributionText?: string | null;
};

const REGION_ALIASES: Array<{ alias: string; regions: string[] }> = [
  { alias: "northland", regions: ["Northland Region"] },
  { alias: "auckland", regions: ["Auckland Region"] },
  { alias: "waikato", regions: ["Waikato Region"] },
  { alias: "bay of plenty", regions: ["Bay of Plenty Region"] },
  { alias: "gisborne", regions: ["Gisborne Region"] },
  { alias: "taranaki", regions: ["Taranaki Region"] },
  { alias: "hawkes bay", regions: ["Hawke's Bay Region"] },
  { alias: "hawke s bay", regions: ["Hawke's Bay Region"] },
  { alias: "manawatu whanganui", regions: ["Manawatu-Wanganui Region"] },
  { alias: "manawatu wanganui", regions: ["Manawatu-Wanganui Region"] },
  { alias: "manawatu", regions: ["Manawatu-Wanganui Region"] },
  { alias: "whanganui", regions: ["Manawatu-Wanganui Region"] },
  { alias: "wanganui", regions: ["Manawatu-Wanganui Region"] },
  { alias: "wellington", regions: ["Wellington Region"] },
  { alias: "tasman", regions: ["Tasman Region"] },
  { alias: "nelson", regions: ["Nelson Region"] },
  { alias: "marlborough", regions: ["Marlborough Region"] },
  { alias: "west coast", regions: ["West Coast Region"] },
  { alias: "westland", regions: ["West Coast Region"] },
  { alias: "canterbury", regions: ["Canterbury Region"] },
  { alias: "otago", regions: ["Otago Region"] },
  { alias: "southland", regions: ["Southland Region"] },
  { alias: "fiordland", regions: ["Southland Region"] },
  { alias: "stewart island", regions: ["Southland Region"] },
  {
    alias: "southern north island",
    regions: [
      "Wellington Region",
      "Manawatu-Wanganui Region",
      "Hawke's Bay Region",
    ],
  },
  {
    alias: "volcanic plateau",
    regions: ["Waikato Region", "Bay of Plenty Region"],
  },
  {
    alias: "sounds nelson",
    regions: ["Tasman Region", "Nelson Region", "Marlborough Region"],
  },
  {
    alias: "western nelson",
    regions: ["Tasman Region", "Nelson Region"],
  },
  {
    alias: "marlborough sounds",
    regions: ["Marlborough Region"],
  },
];

const NORTH_ISLAND_REGIONS = [
  "Northland Region",
  "Auckland Region",
  "Waikato Region",
  "Bay of Plenty Region",
  "Gisborne Region",
  "Hawke's Bay Region",
  "Taranaki Region",
  "Manawatu-Wanganui Region",
  "Wellington Region",
];

const SOUTH_ISLAND_REGIONS = [
  "Tasman Region",
  "Nelson Region",
  "Marlborough Region",
  "West Coast Region",
  "Canterbury Region",
  "Otago Region",
  "Southland Region",
];

const RANGE_CONNECTORS = ["to", "through", "thru"];
const FULL_COVERAGE_HINTS = [
  "throughout",
  "widespread",
  "across",
  "entire",
  "whole",
];
const NATIONWIDE_HINTS = [
  "throughout new zealand",
  "throughout nz",
  "across new zealand",
  "across nz",
  "widespread throughout new zealand",
  "widespread across new zealand",
  "throughout the country",
  "across the country",
  "north and south island",
  "north and south islands",
  "both islands",
  "both main islands",
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NORMALIZED_ALIASES = REGION_ALIASES.map((entry) => ({
  ...entry,
  normalized: normalizeText(entry.alias),
}));

const REGION_INDEX = new Map<string, { list: string[]; index: number }>();

const addRegionIndex = (list: string[]) => {
  list.forEach((region, index) => {
    REGION_INDEX.set(region, { list, index });
  });
};

addRegionIndex(NORTH_ISLAND_REGIONS);
addRegionIndex(SOUTH_ISLAND_REGIONS);

const addRangeRegions = (
  startRegion: string,
  endRegion: string,
  regions: Set<string>
) => {
  const startInfo = REGION_INDEX.get(startRegion);
  const endInfo = REGION_INDEX.get(endRegion);

  if (!startInfo || !endInfo || startInfo.list !== endInfo.list) {
    regions.add(startRegion);
    regions.add(endRegion);
    return;
  }

  const list = startInfo.list;
  const [from, to] =
    startInfo.index <= endInfo.index
      ? [startInfo.index, endInfo.index]
      : [endInfo.index, startInfo.index];

  list.slice(from, to + 1).forEach((region) => regions.add(region));
};

const addRegions = (list: string[], regions: Set<string>) => {
  list.forEach((region) => regions.add(region));
};

const getIslandSegments = (
  normalized: string,
  islandName: string,
  otherIsland: string
) => {
  const segments: string[] = [];
  let index = normalized.indexOf(islandName);

  while (index !== -1) {
    const nextOther = normalized.indexOf(otherIsland, index + islandName.length);
    const end = nextOther === -1 ? normalized.length : nextOther;
    segments.push(normalized.slice(index, end));
    index = normalized.indexOf(islandName, index + islandName.length);
  }

  return segments;
};

const hasFullCoverageHint = (segment: string) =>
  FULL_COVERAGE_HINTS.some((hint) => segment.includes(hint));

const extractRegions = (text?: string | null) => {
  if (!text) return new Set<string>();
  const normalized = normalizeText(text);
  const padded = ` ${normalized} `;
  const regions = new Set<string>();

  for (const entry of NORMALIZED_ALIASES) {
    if (padded.includes(` ${entry.normalized} `)) {
      entry.regions.forEach((region) => regions.add(region));
    }
  }

  const rangeAliases = NORMALIZED_ALIASES.filter(
    (entry) => entry.regions.length === 1
  );

  for (const connector of RANGE_CONNECTORS) {
    for (const start of rangeAliases) {
      if (!padded.includes(` ${start.normalized} ${connector} `)) continue;
      for (const end of rangeAliases) {
        if (start === end) continue;
        if (
          padded.includes(
            ` ${start.normalized} ${connector} ${end.normalized} `
          )
        ) {
          addRangeRegions(start.regions[0], end.regions[0], regions);
        }
      }
    }
  }

  if (NATIONWIDE_HINTS.some((hint) => normalized.includes(hint))) {
    addRegions(NORTH_ISLAND_REGIONS, regions);
    addRegions(SOUTH_ISLAND_REGIONS, regions);
    return regions;
  }

  const northSegments = getIslandSegments(
    normalized,
    "north island",
    "south island"
  );
  if (northSegments.some(hasFullCoverageHint)) {
    addRegions(NORTH_ISLAND_REGIONS, regions);
  }

  const southSegments = getIslandSegments(
    normalized,
    "south island",
    "north island"
  );
  if (southSegments.some(hasFullCoverageHint)) {
    addRegions(SOUTH_ISLAND_REGIONS, regions);
  }

  return regions;
};

const forEachCoordinate = (
  geometry: GeoFeature["geometry"],
  callback: (lon: number, lat: number) => void
) => {
  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring) => {
      ring.forEach(([lon, lat]) => callback(lon, lat));
    });
  } else {
    geometry.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach(([lon, lat]) => callback(lon, lat));
      });
    });
  }
};

const buildPath = (
  geometry: GeoFeature["geometry"],
  project: (lon: number, lat: number) => [number, number]
) => {
  const renderRing = (ring: LinearRing) =>
    ring
      .map(([lon, lat], index) => {
        const [x, y] = project(lon, lat);
        return `${index === 0 ? "M" : "L"}${x} ${y}`;
      })
      .join(" ") + " Z";

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map(renderRing).join(" ");
  }

  return geometry.coordinates
    .map((polygon) => polygon.map(renderRing).join(" "))
    .join(" ");
};

export default function DistributionMap({
  distributionText,
}: DistributionMapProps) {
  const [geoData, setGeoData] = useState<GeoCollection | null>(null);
  const hasDistribution = Boolean(distributionText?.trim());

  useEffect(() => {
    let isActive = true;

    fetchRegions()
      .then((data: GeoCollection) => {
        if (isActive) setGeoData(data);
      })
      .catch(() => {
        if (isActive) setGeoData(null);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const highlightedRegions = useMemo(
    () => (hasDistribution ? extractRegions(distributionText) : new Set()),
    [distributionText, hasDistribution]
  );

  const paths = useMemo(() => {
    if (!geoData) return [];
    const features = geoData.features.filter(
      (feature) => feature.properties.REGC2013_N !== "Area Outside Region"
    );

    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    features.forEach((feature) => {
      forEachCoordinate(feature.geometry, (lon, lat) => {
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    });

    const width = 320;
    const height = 420;
    const padding = 12;
    const scaleX = (width - padding * 2) / (maxLon - minLon);
    const scaleY = (height - padding * 2) / (maxLat - minLat);
    const scale = Math.min(scaleX, scaleY);
    const offsetX =
      padding + (width - padding * 2 - (maxLon - minLon) * scale) / 2;
    const offsetY =
      padding + (height - padding * 2 - (maxLat - minLat) * scale) / 2;

    const project = (lon: number, lat: number): [number, number] => [
      (lon - minLon) * scale + offsetX,
      (maxLat - lat) * scale + offsetY,
    ];

    return features.map((feature) => ({
      name: feature.properties.REGC2013_N,
      path: buildPath(feature.geometry, project),
    }));
  }, [geoData]);

  if (!geoData) {
    return (
      <div className="rounded-2xl bg-[#f3f7f4] p-4 text-xs text-gray-500 shadow-inner">
        Loading map...
      </div>
    );
  }

  const inactiveFill = "#e5e7eb";
  const inactiveStroke = "#cbd5e1";
  const activeFill = "#e6efe9";
  const activeStroke = "#c6d3ca";

  return (
    <div className="rounded-2xl bg-[#f3f7f4] p-4 shadow-inner">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        <span>Regional map</span>
        <span
          className={`rounded-full px-2 py-1 text-[10px] shadow-sm ${
            hasDistribution
              ? "bg-white text-[#1f4d3a]"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {hasDistribution ? "Approximate" : "No data"}
        </span>
      </div>
      <svg
        viewBox="0 0 320 420"
        className={`mt-3 h-54 w-full ${hasDistribution ? "" : "opacity-70"}`}
        role="img"
        aria-label="New Zealand regions map"
        preserveAspectRatio="xMidYMid meet"
      >
        {paths.map((feature) => {
          const isHighlighted = highlightedRegions.has(feature.name);
          const fillColor = hasDistribution
            ? isHighlighted
              ? "#41a17a"
              : activeFill
            : inactiveFill;
          const strokeColor = hasDistribution
            ? isHighlighted
              ? "#143324"
              : activeStroke
            : inactiveStroke;
          return (
            <path
              key={feature.name}
              d={feature.path}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={1}
            />
          );
        })}
      </svg>
      {!hasDistribution ? (
        <p className="mt-3 text-xs text-gray-500">Distribution not recorded.</p>
      ) : null}
    </div>
  );
}
