import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db/connection.js";

const port = process.env.PORT;

(async () => {
  try {
    await connectDB(process.env.URI, { dbName: process.env.DB_NAME });
    app.listen(port, () => {
      console.log(`Express API running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();
