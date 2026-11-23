import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { pool } = require(path.join(__dirname, "../server/src/db.js"));
const authRoutes = require(path.join(__dirname, "../server/src/routes/auth.js"));
const courseRoutes = require(path.join(__dirname, "../server/src/routes/courses.js"));
const taskRoutes = require(path.join(__dirname, "../server/src/routes/tasks.js"));

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS connected");
    res.json({ ok: true, db: rows[0]?.connected === 1 });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Gagal konek ke tuntask_db",
      error: err.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/tasks", taskRoutes);

export default app;