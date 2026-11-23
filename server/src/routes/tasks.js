const express = require("express");
const { pool } = require("../db");

const router = express.Router();

function normalizeDeadline(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed} 23:59:59`;
  }
  return trimmed.replace("T", " ");
}

// GET /api/tasks?studentId=1
router.get("/", async (req, res) => {
  try {
    const studentId = req.query.studentId ? Number(req.query.studentId) : null;
    const baseSql = `
      SELECT
        t.id,
        t.student_id,
        t.course_id,
        c.course_name,
        t.task_title,
        t.task_desc,
        DATE_FORMAT(t.assigned_date, '%Y-%m-%d') AS assigned_date,
        DATE_FORMAT(t.created_at, '%Y-%m-%d') AS created_at,
        DATE_FORMAT(t.deadline, '%Y-%m-%d') AS deadline,
        t.submission_link,
        t.status
      FROM tasks t
      JOIN courses c ON c.id = t.course_id
    `;

    const [rows] = studentId
      ? await pool.query(`${baseSql} WHERE t.student_id = ? ORDER BY t.deadline ASC`, [studentId])
      : await pool.query(`${baseSql} ORDER BY t.deadline ASC`);

    return res.json({ ok: true, tasks: rows });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal mengambil daftar tugas.", error: err.message });
  }
});

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
    const {
      student_id,
      course_id,
      task_title,
      task_desc,
      assigned_date,
      deadline,
      submission_link,
      status,
    } = req.body;

    if (!student_id || !course_id || !task_title || !deadline) {
      return res.status(400).json({
        ok: false,
        message: "student_id, course_id, task_title, dan deadline wajib diisi.",
      });
    }

    const formattedDeadline = normalizeDeadline(deadline);

    const [result] = await pool.query(
      `INSERT INTO tasks
        (student_id, course_id, task_title, task_desc, assigned_date, deadline, submission_link, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(student_id),
        Number(course_id),
        task_title.trim(),
        task_desc ? task_desc.trim() : null,
        assigned_date || null,
        formattedDeadline,
        submission_link ? submission_link.trim() : null,
        status || "Belum Selesai",
      ]
    );

    const [rows] = await pool.query(
      `SELECT
        t.id,
        t.student_id,
        t.course_id,
        c.course_name,
        t.task_title,
        t.task_desc,
        DATE_FORMAT(t.assigned_date, '%Y-%m-%d') AS assigned_date,
        DATE_FORMAT(t.created_at, '%Y-%m-%d') AS created_at,
        DATE_FORMAT(t.deadline, '%Y-%m-%d') AS deadline,
        t.submission_link,
        t.status
       FROM tasks t
       JOIN courses c ON c.id = t.course_id
       WHERE t.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ ok: true, task: rows[0] });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal menambah tugas.", error: err.message });
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      course_id,
      task_title,
      task_desc,
      assigned_date,
      deadline,
      submission_link,
      status,
    } = req.body;

    if (!course_id || !task_title || !deadline) {
      return res
        .status(400)
        .json({ ok: false, message: "course_id, task_title, dan deadline wajib diisi." });
    }

    await pool.query(
      `UPDATE tasks
       SET course_id = ?, task_title = ?, task_desc = ?, assigned_date = ?,
           deadline = ?, submission_link = ?, status = ?
       WHERE id = ?`,
      [
        Number(course_id),
        task_title.trim(),
        task_desc ? task_desc.trim() : null,
        assigned_date || null,
        normalizeDeadline(deadline),
        submission_link ? submission_link.trim() : null,
        status || "Belum Selesai",
        id,
      ]
    );

    const [rows] = await pool.query(
      `SELECT
        t.id,
        t.student_id,
        t.course_id,
        c.course_name,
        t.task_title,
        t.task_desc,
        DATE_FORMAT(t.assigned_date, '%Y-%m-%d') AS assigned_date,
        DATE_FORMAT(t.created_at, '%Y-%m-%d') AS created_at,
        DATE_FORMAT(t.deadline, '%Y-%m-%d') AS deadline,
        t.submission_link,
        t.status
       FROM tasks t
       JOIN courses c ON c.id = t.course_id
       WHERE t.id = ?`,
      [id]
    );

    return res.json({ ok: true, task: rows[0] });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal mengupdate tugas.", error: err.message });
  }
});

// PATCH /api/tasks/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!["Belum Selesai", "Selesai", "Terlambat"].includes(status)) {
      return res.status(400).json({ ok: false, message: "Status tugas tidak valid." });
    }

    await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);
    return res.json({ ok: true, status });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal mengubah status tugas.", error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, message: "Gagal menghapus tugas.", error: err.message });
  }
});

module.exports = router;