import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import multer from "multer";
require('dotenv').config()
// -------------------- Express Setup --------------------
const app = express();
app.use(cors());
app.use(express.json());

// -------------------- MySQL Pool --------------------
const db = mysql.createPool({
  host: "mysql-b487126-adwaitmhaske05-0fe0.b.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_hxZenU7xvSzL4eQWfbU",
  database: "mini_project",
  waitForConnections: true,
  connectionLimit: 10
});

// -------------------- Multer Setup --------------------
// On Vercel, local filesystem is ephemeral; for demo, we keep memory storage
const upload = multer({ storage: multer.memoryStorage() });

// -------------------- Helper --------------------
async function query(sql, params) {
  const [result] = await db.query(sql, params);
  return result;
}

// -------------------- ROUTES --------------------

// Add Instructor
app.post("/instructors/add", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const sql = "INSERT INTO instructors (name,email,password) VALUES (?,?,?)";
    const result = await query(sql, [name, email, password]);
    res.json({ message: "Instructor added", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// Get all instructors
app.get("/instructors", async (req, res) => {
  try {
    const results = await query("SELECT * FROM instructors");
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add Course
app.post("/courses/add", upload.single("image"), async (req, res) => {
  try {
    const { name, level, description } = req.body;
    const image = req.file ? req.file.originalname : null; // For demo, just store name
    const sql = "INSERT INTO courses (name, level, description, image) VALUES (?,?,?,?)";
    const result = await query(sql, [name, level, description, image]);
    res.json({ message: "Course added", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// Get all courses
app.get("/courses", async (req, res) => {
  try {
    const results = await query("SELECT * FROM courses");
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add Batch
app.post("/add-batch", async (req, res) => {
  try {
    const { course_id, batch_name, start_time, end_time } = req.body;
    if (!course_id || !batch_name || !start_time || !end_time)
      return res.status(400).json({ message: "All fields required" });

    const sql = "INSERT INTO batches (course_id, batch_name, start_time, end_time) VALUES (?,?,?,?)";
    const result = await query(sql, [course_id, batch_name, start_time, end_time]);
    res.json({ message: "Batch added", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// Get batches by course
app.get("/batches/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const results = await query("SELECT * FROM batches WHERE course_id = ?", [courseId]);
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Schedule Lecture
app.post("/schedule-lecture", async (req, res) => {
  try {
    const { batch_id, instructor_id, lecture_date } = req.body;
    if (!batch_id || !instructor_id || !lecture_date)
      return res.status(400).json({ message: "All fields required" });

    const sql = "INSERT INTO scheduled_lectures (batch_id, instructor_id, lecture_date) VALUES (?,?,?)";
    await query(sql, [batch_id, instructor_id, lecture_date]);
    res.json({ message: "Lecture scheduled" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Instructor already has a lecture on this date" });
    }
    console.error(err);
    res.status(500).json(err);
  }
});

// Get all lectures
app.get("/lectures", async (req, res) => {
  try {
    const sql = `
      SELECT sl.id, sl.lecture_date, b.batch_name, b.course_id, i.id AS instructor_id, i.name AS instructor_name
      FROM scheduled_lectures sl
      JOIN batches b ON sl.batch_id = b.id
      JOIN instructors i ON sl.instructor_id = i.id
    `;
    const results = await query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Instructor lectures
app.get("/instructor/:id/lectures", async (req, res) => {
  try {
    const instructorId = req.params.id;
    const sql = `
      SELECT sl.id, sl.lecture_date, b.batch_name, b.start_time, b.end_time, c.name AS course_name, c.level
      FROM scheduled_lectures sl
      JOIN batches b ON sl.batch_id = b.id
      JOIN courses c ON b.course_id = c.id
      WHERE sl.instructor_id = ?
      ORDER BY sl.lecture_date, b.start_time
    `;
    const results = await query(sql, [instructorId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Instructor login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const sql = "SELECT id, name FROM instructors WHERE email = ? AND password = ?";
    const results = await query(sql, [email, password]);

    if (results.length > 0) {
      res.json({ role: "instructor", instructor_id: results[0].id, instructor_name: results[0].name });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database errors" });
  }
});

// -------------------- EXPORT FOR VERCEL --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
