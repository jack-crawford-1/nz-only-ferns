import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { GridFSBucket } from "mongodb";

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

    const stats = fs.statSync(dataPath);
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "regions",
    });

    const existing = await bucket
      .find({ filename: "nz-regions.geojson" })
      .toArray();

    for (const file of existing) {
      await bucket.delete(file._id);
    }

    await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream("nz-regions.geojson", {
        contentType: "application/geo+json",
      });
      fs.createReadStream(dataPath)
        .on("error", reject)
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    await mongoose.connection.close();

    console.log(
      `Seeded regions file (${(stats.size / 1024 / 1024).toFixed(
        2
      )} MB) from ${dataPath}`
    );
  } catch (err) {
    console.error("Error seeding regions:", err);
    process.exit(1);
  }
}

seedRegions();
