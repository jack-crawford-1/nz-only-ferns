import { useEffect, useMemo, useState } from "react";
import { fetchRegions } from "../api/fetchRegions";

type GeoFeature = {
  type: "Feature";
  properties: {
    REGC2013_N: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
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

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractRegions = (text?: string | null) => {
  if (!text) return new Set<string>();
  const normalized = normalizeText(text);
  const padded = ` ${normalized} `;
  const regions = new Set<string>();

  for (const entry of REGION_ALIASES) {
    const alias = normalizeText(entry.alias);
    if (padded.includes(` ${alias} `)) {
      entry.regions.forEach((region) => regions.add(region));
    }
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
  const renderRing = (ring: number[][]) =>
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
    () => extractRegions(distributionText),
    [distributionText]
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
      <div className="rounded-2xl bg-[#f3f6ff] p-4 text-xs text-gray-500 shadow-inner">
        Loading map...
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#f3f6ff] p-4 shadow-inner">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        <span>Regional map</span>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] text-[#1e60d4] shadow-sm">
          Approximate
        </span>
      </div>
      <svg
        viewBox="0 0 320 420"
        className="mt-3 h-64 w-full"
        role="img"
        aria-label="New Zealand regions map"
        preserveAspectRatio="xMidYMid meet"
      >
        {paths.map((feature) => {
          const isHighlighted = highlightedRegions.has(feature.name);
          return (
            <path
              key={feature.name}
              d={feature.path}
              fill={isHighlighted ? "#1e60d4" : "#e7edf8"}
              stroke={isHighlighted ? "#0f4fa4" : "#c6d4ef"}
              strokeWidth={1}
            />
          );
        })}
      </svg>
      <p className="mt-2 text-[11px] text-gray-500">
        Highlighted regions match named areas in the distribution notes.
      </p>
    </div>
  );
}
