import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import { FernModel } from "../models/Fern.js";

dotenv.config();

const uri = process.env.URI;
const dbName = process.env.DB_NAME;
const dataPath = `${process.cwd()}/nz_ferns.json`;

async function seedFerns() {
  try {
    await mongoose.connect(uri, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    await FernModel.deleteMany({});
    await FernModel.insertMany(data);
    await mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding ferns:", err);
    process.exit(1);
  }
}

seedFerns();
