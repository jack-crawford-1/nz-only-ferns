import { FernModel } from "../models/Fern.js";

export function getHello(req, res) {
  res.send("Hello World");
}

export async function getAllFerns(req, res) {
  try {
    const ferns = await FernModel.find({});
    res.status(200).json(ferns);
  } catch (error) {
    console.error("Error fetching ferns:", error.message);
    res.status(500).json({ error: "Failed to fetch ferns" });
  }
}

export async function getFernByName(req, res) {
  try {
    const { name } = req.params;
    const fern = await FernModel.findOne({ scientificName: name });

    if (!fern) {
      return res.status(404).json({ message: "Fern not found" });
    }

    res.status(200).json(fern);
  } catch (error) {
    console.error("Error fetching fern:", error.message);
    res.status(500).json({ error: "Failed to fetch fern" });
  }
}
