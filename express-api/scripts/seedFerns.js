import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import { FernModel } from "../models/Fern.js";
import { fetchFernImages } from "./fetchFernImages.js";

dotenv.config();

const uri = process.env.URI;
const dbName = process.env.DB_NAME;
const dataPath = `${process.cwd()}/nz_ferns2025.json`;

async function seedFerns() {
  try {
    await mongoose.connect(uri, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    for (const fern of data) {
      const images = await fetchFernImages(fern.scientificName);
      fern.imageUrls = images;
      fern.imageUrl = images[0] || null;
      console.log(
        ` ${fern.scientificName}: ${images.length > 0 ? images.length : "none"}`
      );
    }

    await FernModel.deleteMany({});
    await FernModel.insertMany(data);
    await mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding ferns:", err);
    process.exit(1);
  }
}

seedFerns();
