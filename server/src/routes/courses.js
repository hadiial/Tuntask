const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET /api/courses?studentId=1
router.get("/", async (req, res) => {
  try {
    const studentId = Number(req.query.studentId);
    if (!studentId) {
      return res.status(400).json({ ok: false, message: "studentId wajib disertakan." });
    }

    const [rows] = await pool.query(
      "SELECT id, student_id, course_name, course_code, lecturer_name, semester FROM courses WHERE student_id = ? ORDER BY id ASC",
      [studentId]
    );
    return res.json({ ok: true, courses: rows });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal mengambil mata kuliah.", error: err.message });
  }
});

// POST /api/courses
router.post("/", async (req, res) => {
  try {
    const { student_id, course_name, course_code, lecturer_name, semester } = req.body;
    if (!student_id || !course_name || !semester) {
      return res
        .status(400)
        .json({ ok: false, message: "student_id, nama mata kuliah, dan semester wajib diisi." });
    }

    const [result] = await pool.query(
      `INSERT INTO courses (student_id, course_name, course_code, lecturer_name, semester)
       VALUES (?, ?, ?, ?, ?)`,
      [
        Number(student_id),
        course_name.trim(),
        course_code ? course_code.trim() : null,
        lecturer_name ? lecturer_name.trim() : null,
        semester.trim(),
      ]
    );

    const [rows] = await pool.query(
      "SELECT id, student_id, course_name, course_code, lecturer_name, semester FROM courses WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({ ok: true, course: rows[0] });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal menambah mata kuliah.", error: err.message });
  }
});

// PUT /api/courses/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { student_id, course_name, course_code, lecturer_name, semester } = req.body;

    if (!student_id || !course_name || !semester) {
      return res
        .status(400)
        .json({ ok: false, message: "student_id, nama mata kuliah, dan semester wajib diisi." });
    }

    await pool.query(
      `UPDATE courses
       SET course_name = ?, course_code = ?, lecturer_name = ?, semester = ?
       WHERE id = ? AND student_id = ?`,
      [
        course_name.trim(),
        course_code ? course_code.trim() : null,
        lecturer_name ? lecturer_name.trim() : null,
        semester.trim(),
        id,
        Number(student_id),
      ]
    );

    const [rows] = await pool.query(
      "SELECT id, student_id, course_name, course_code, lecturer_name, semester FROM courses WHERE id = ?",
      [id]
    );

    return res.json({ ok: true, course: rows[0] });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal mengubah mata kuliah.", error: err.message });
  }
});

// DELETE /api/courses/:id?studentId=1
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const studentId = Number(req.query.studentId);
    if (!studentId) {
      return res.status(400).json({ ok: false, message: "studentId wajib disertakan." });
    }

    await pool.query("DELETE FROM courses WHERE id = ? AND student_id = ?", [id, studentId]);
    return res.json({ ok: true });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal menghapus mata kuliah.", error: err.message });
  }
});

module.exports = router;