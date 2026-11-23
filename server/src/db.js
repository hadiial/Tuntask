const mysql = require("mysql2/promise");
require("dotenv").config();

const host = process.env.DB_HOST || "127.0.0.1";
const isLocalHost = host === "127.0.0.1" || host === "localhost";
const useSsl =
  process.env.DB_SSL === "true" || (!isLocalHost && process.env.DB_SSL !== "false");

const pool = mysql.createPool({
  host,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tuntask_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  ...(useSsl
    ? {
        ssl: {
          minVersion: "TLSv1.2",
          rejectUnauthorized: true,
        },
      }
    : {}),
});

module.exports = { pool };