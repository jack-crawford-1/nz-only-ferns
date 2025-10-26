import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async (uri, options = {}) => {
  try {
    await mongoose.connect(uri, options);
    console.log("MongoDB successfully connected.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};
