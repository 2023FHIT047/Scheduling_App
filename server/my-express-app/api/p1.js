import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- MySQL Pool --------------------
const db = mysql.createPool({
  host: "mysql-b487126-adwaitmhaske05-0fe0.b.aivencloud.com",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// -------------------- Multer (Memory Storage) --------------------
const upload = multer({ storage: multer.memoryStorage() });

// -------------------- Helper --------------------
async function query(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows;
}

// -------------------- ROUTES --------------------

// Add Instructor
app.post("/instructors/add", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const sql = "INSERT INTO instructors (name,email,password) VALUES (?,?,?)";
    const result = await db.query(sql, [name, email, password]);
    res.json({ message: "Instructor added", id: result[0].insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get Instructors
app.get("/instructors", async (req, res) => {
  try {
    const data = await query("SELECT * FROM instructors");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Add Course
app.post("/courses/add", upload.single("image"), async (req, res) => {
  try {
    const { name, level, description } = req.body;
    const image = req.file ? req.file.originalname : null;

    const sql =
      "INSERT INTO courses (name, level, description, image) VALUES (?,?,?,?)";
    const result = await db.query(sql, [name, level, description, image]);

    res.json({ message: "Course added", id: result[0].insertId });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get Courses
app.get("/courses", async (req, res) => {
  try {
    const data = await query("SELECT * FROM courses");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Add Batch
app.post("/add-batch", async (req, res) => {
  try {
    const { course_id, batch_name, start_time, end_time } = req.body;
    if (!course_id || !batch_name || !start_time || !end_time)
      return res.status(400).json({ message: "All fields required" });

    const sql =
      "INSERT INTO batches (course_id, batch_name, start_time, end_time) VALUES (?,?,?,?)";
    const result = await db.query(sql, [
      course_id,
      batch_name,
      start_time,
      end_time
    ]);

    res.json({ message: "Batch added", id: result[0].insertId });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get Batches by Course
app.get("/batches/course/:courseId", async (req, res) => {
  try {
    const data = await query(
      "SELECT * FROM batches WHERE course_id = ?",
      [req.params.courseId]
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Schedule Lecture
app.post("/schedule-lecture", async (req, res) => {
  try {
    const { batch_id, instructor_id, lecture_date } = req.body;

    const sql =
      "INSERT INTO scheduled_lectures (batch_id, instructor_id, lecture_date) VALUES (?,?,?)";

    await query(sql, [batch_id, instructor_id, lecture_date]);

    res.json({ message: "Lecture scheduled" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Instructor already has lecture on this date" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// Instructor Lectures
app.get("/instructor/:id/lectures", async (req, res) => {
  try {
    const sql = `
      SELECT sl.id, sl.lecture_date, b.batch_name, b.start_time, b.end_time,
             c.name AS course_name, c.level
      FROM scheduled_lectures sl
      JOIN batches b ON sl.batch_id = b.id
      JOIN courses c ON b.course_id = c.id
      WHERE sl.instructor_id = ?
      ORDER BY sl.lecture_date, b.start_time
    `;

    const data = await query(sql, [req.params.id]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const sql =
      "SELECT id, name FROM instructors WHERE email = ? AND password = ?";
    const result = await query(sql, [email, password]);

    if (result.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    res.json({
      role: "instructor",
      instructor_id: result[0].id,
      instructor_name: result[0].name
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------- EXPORT (VERY IMPORTANT) --------------------
export default app;

