import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";

dotenv.config();

const uri = process.env.URI;
const dbName = process.env.DB_NAME;

const resolveDataPath = () => {
  const candidates = [
    process.env.NZ_REGIONS_PATH,
    path.resolve(process.cwd(), "ferns-client/public/nz-regions.geojson"),
    path.resolve(process.cwd(), "../ferns-client/public/nz-regions.geojson"),
    path.resolve(process.cwd(), "nz-regions.geojson"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
};

async function seedRegions() {
  const dataPath = resolveDataPath();
  if (!dataPath) {
    console.error(
      "Could not find nz-regions.geojson. Set NZ_REGIONS_PATH to the file location."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName });

    if (!mongoose.connection?.db) {
      console.error("MongoDB connection not available.");
      process.exit(1);
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "regions",
    });

    const existing = await bucket
      .find({ filename: "nz-regions.geojson" })
      .toArray();

    for (const file of existing) {
      await bucket.delete(file._id);
    }

    const source = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    const features = Array.isArray(source?.features) ? source.features : [];

    if (!features.length) {
      console.error("No features found in nz-regions.geojson.");
      process.exit(1);
    }

    const decimals = Number(process.env.NZ_REGIONS_DECIMALS ?? "3");

    const roundValue = (value) =>
      Number.isFinite(value) ? Number(value.toFixed(decimals)) : value;

    const simplifyRing = (ring) => {
      const rounded = ring.map(([lon, lat]) => [
        roundValue(lon),
        roundValue(lat),
      ]);

      const dedup = rounded.filter((point, index) => {
        if (index === 0) return true;
        const prev = rounded[index - 1];
        return point[0] !== prev[0] || point[1] !== prev[1];
      });

      if (dedup.length >= 4) {
        const first = dedup[0];
        const last = dedup[dedup.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          dedup.push(first);
        }
        return dedup;
      }

      return ring;
    };

    const simplifyGeometry = (geometry) => {
      if (geometry.type === "Polygon") {
        return {
          type: "Polygon",
          coordinates: geometry.coordinates.map(simplifyRing),
        };
      }

      return {
        type: "MultiPolygon",
        coordinates: geometry.coordinates.map((polygon) =>
          polygon.map(simplifyRing)
        ),
      };
    };

    const simplified = {
      type: "FeatureCollection",
      features: features
        .filter(
          (feature) =>
            feature?.properties?.REGC2013_N !== "Area Outside Region"
        )
        .map((feature) => ({
          type: "Feature",
          properties: feature.properties,
          geometry: simplifyGeometry(feature.geometry),
        })),
    };

    if (!simplified.features.length) {
      console.error("No usable region features found to seed.");
      process.exit(1);
    }

    const payload = JSON.stringify(simplified);

    await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream("nz-regions.geojson", {
        contentType: "application/geo+json",
      });
      Readable.from([payload])
        .on("error", reject)
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    await mongoose.connection.close();

    console.log(
      `Seeded regions file (${(payload.length / 1024 / 1024).toFixed(
        2
      )} MB) from ${dataPath}`
    );
  } catch (err) {
    console.error("Error seeding regions:", err);
    process.exit(1);
  }
}

seedRegions();
