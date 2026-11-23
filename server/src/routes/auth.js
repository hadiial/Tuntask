const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");

const router = express.Router();

function sanitizeStudent(row) {
  return {
    id: row.id,
    nim: row.nim,
    full_name: row.full_name,
    major: row.major,
    faculty: row.faculty,
    university: row.university,
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { nim, full_name, major, faculty, university, password } = req.body;

    if (!nim || !full_name || !major || !faculty || !university || !password) {
      return res.status(400).json({ ok: false, message: "Semua kolom wajib diisi." });
    }

    const [existing] = await pool.query("SELECT id FROM students WHERE nim = ? LIMIT 1", [
      nim.trim(),
    ]);
    if (existing.length > 0) {
      return res.status(409).json({ ok: false, message: "NIM sudah terdaftar." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO students (nim, full_name, major, faculty, university, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nim.trim(),
        full_name.trim(),
        major.trim(),
        faculty.trim(),
        university.trim(),
        passwordHash,
      ]
    );

    const [rows] = await pool.query(
      "SELECT id, nim, full_name, major, faculty, university FROM students WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({ ok: true, student: rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Gagal mendaftar akun.", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { nim, password } = req.body;

    if (!nim || !password) {
      return res.status(400).json({ ok: false, message: "NIM dan password wajib diisi." });
    }

    const [rows] = await pool.query("SELECT * FROM students WHERE nim = ? LIMIT 1", [
      nim.trim(),
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, message: "NIM atau password salah." });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ ok: false, message: "NIM atau password salah." });
    }

    return res.json({ ok: true, student: sanitizeStudent(user) });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Gagal login.", error: err.message });
  }
});

// GET /api/auth/profile/:studentId
router.get("/profile/:studentId", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const [rows] = await pool.query(
      "SELECT id, nim, full_name, major, faculty, university FROM students WHERE id = ? LIMIT 1",
      [studentId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Mahasiswa tidak ditemukan." });
    }
    return res.json({ ok: true, student: rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Gagal memuat profil.", error: err.message });
  }
});

// PUT /api/auth/profile/:studentId
router.put("/profile/:studentId", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const { full_name, major, faculty, university } = req.body;

    if (!full_name || !major || !faculty || !university) {
      return res.status(400).json({ ok: false, message: "Semua data profil wajib diisi." });
    }

    await pool.query(
      `UPDATE students
       SET full_name = ?, major = ?, faculty = ?, university = ?
       WHERE id = ?`,
      [
        full_name.trim(),
        major.trim(),
        faculty.trim(),
        university.trim(),
        studentId,
      ]
    );

    const [rows] = await pool.query(
      "SELECT id, nim, full_name, major, faculty, university FROM students WHERE id = ? LIMIT 1",
      [studentId]
    );

    return res.json({ ok: true, student: rows[0] });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal memperbarui profil.", error: err.message });
  }
});

// POST /api/auth/profile/:studentId/verify-password
router.post("/profile/:studentId/verify-password", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const { oldPassword } = req.body;

    if (!oldPassword) {
      return res.status(400).json({ ok: false, message: "Password lama wajib diisi." });
    }

    const [rows] = await pool.query(
      "SELECT id, password_hash FROM students WHERE id = ? LIMIT 1",
      [studentId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Mahasiswa tidak ditemukan." });
    }

    const matched = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!matched) {
      return res.status(400).json({ ok: false, message: "Password lama salah." });
    }

    return res.json({ ok: true });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal memverifikasi password.", error: err.message });
  }
});

// PUT /api/auth/profile/:studentId/password
router.put("/profile/:studentId/password", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ ok: false, message: "Password lama dan password baru wajib diisi." });
    }

    const [rows] = await pool.query(
      "SELECT id, password_hash FROM students WHERE id = ? LIMIT 1",
      [studentId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Mahasiswa tidak ditemukan." });
    }

    const matched = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!matched) {
      return res.status(400).json({ ok: false, message: "Password lama salah." });
    }

    const nextHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE students SET password_hash = ? WHERE id = ?", [nextHash, studentId]);

    return res.json({ ok: true, message: "Password berhasil diperbarui." });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal mengganti password.", error: err.message });
  }
});

module.exports = router;