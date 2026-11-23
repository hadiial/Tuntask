const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { pool } = require("../server/src/db");

const authRoutes = require("../server/src/routes/auth");
const courseRoutes = require("../server/src/routes/courses");
const taskRoutes = require("../server/src/routes/tasks");

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

module.exports = app;