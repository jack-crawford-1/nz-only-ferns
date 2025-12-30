import { FernModel } from "../models/Fern.js";

export function getHello(req, res) {
  res.send("Hello World");
}

export async function getAllFerns(req, res) {
  try {
    const ferns = await FernModel.find({}).lean();

    const fernsWithLinks = ferns.map((fern) => ({
      ...fern,
      links: {
        self: `/api/ferns/${encodeURIComponent(fern.scientificName)}`,
      },
    }));

    res.status(200).json(fernsWithLinks);
  } catch (error) {
    console.error("Error fetching ferns:", error.message);
    res.status(500).json({ error: "Failed to fetch ferns" });
  }
}

export async function getFernByName(req, res) {
  try {
    const { name } = req.params;
    const fern = await FernModel.findOne({ scientificName: name }).lean();

    if (!fern) {
      return res.status(404).json({ message: "Fern not found" });
    }

    res.status(200).json({
      ...fern,
      links: {
        self: `/api/ferns/${encodeURIComponent(fern.scientificName)}`,
        collection: "/api/ferns",
      },
    });
  } catch (error) {
    console.error("Error fetching fern:", error.message);
    res.status(500).json({ error: "Failed to fetch fern" });
  }
}
