import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
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

export async function getRegions(req, res) {
  try {
    if (!mongoose.connection?.db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "regions",
    });

    const files = await bucket
      .find({ filename: "nz-regions.geojson" })
      .limit(1)
      .toArray();

    if (!files.length) {
      return res.status(404).json({ error: "No regions available" });
    }

    const [file] = files;
    const etagValue = file?.md5 || file?._id?.toString();
    const etag = etagValue ? `"${etagValue}"` : null;
    const lastModified =
      file?.uploadDate instanceof Date
        ? file.uploadDate.toUTCString()
        : null;

    res.setHeader(
      "Content-Type",
      file?.contentType || "application/geo+json"
    );
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
    if (etag) res.setHeader("ETag", etag);
    if (lastModified) res.setHeader("Last-Modified", lastModified);

    const ifNoneMatch = req.headers["if-none-match"];
    if (etag && typeof ifNoneMatch === "string") {
      const matches = ifNoneMatch
        .split(",")
        .map((value) => value.trim())
        .includes(etag);
      if (matches) {
        return res.status(304).end();
      }
    }

    const ifModifiedSince = req.headers["if-modified-since"];
    if (!ifNoneMatch && lastModified && typeof ifModifiedSince === "string") {
      const since = new Date(ifModifiedSince);
      if (!Number.isNaN(since.getTime())) {
        const updatedAt = new Date(lastModified);
        if (since >= updatedAt) {
          return res.status(304).end();
        }
      }
    }

    const stream = bucket.openDownloadStreamByName("nz-regions.geojson");

    stream.on("error", (streamError) => {
      console.error("Error streaming regions:", streamError.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to fetch regions" });
      } else {
        res.end();
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Error fetching regions:", error.message);
    res.status(500).json({ error: "Failed to fetch regions" });
  }
}
