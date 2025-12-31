import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import compression from "compression";

const app = express();

const shouldCompress = (req, res) => {
  const contentType = res.getHeader("Content-Type");
  if (typeof contentType === "string") {
    if (contentType.includes("application/geo+json")) return true;
  }
  return compression.filter(req, res);
};

app.use(compression({ filter: shouldCompress }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/api", routes);

export default app;
