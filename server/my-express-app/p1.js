const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ------------------ FILE UPLOAD SETUP ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ------------------ MYSQL CONNECTION ------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Adwait2006",
  database: "scheduling_app",
});

db.connect((err) =>{
if(err){
console.log(err)
}
else{
console.log("connection enstablished")
}
}
)
// ------------------ INSTRUCTORS ------------------
app.post("/instructors/add", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const q = "INSERT INTO instructors (name,email,password) VALUES (?,?,?)";
  db.query(q, [name, email, password], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Instructor added", id: result.insertId });
  });
});

app.get("/instructors", (req, res) => {
  db.query("SELECT * FROM instructors", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ------------------ COURSES ------------------
app.post("/courses/add", upload.single("image"), (req, res) => {
  const { name, level, description } = req.body;
  const image = req.file ? req.file.filename : null;

  const q =
    "INSERT INTO courses (name, level, description, image) VALUES (?,?,?,?)";

  db.query(q, [name, level, description, image], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Course added", id: result.insertId });
  });
});

app.get("/courses", (req, res) => {
  db.query("SELECT * FROM courses", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ------------------ BATCHES ------------------
app.post("/add-batch", (req, res) => {
  const { course_id, batch_name, start_time, end_time } = req.body;

  if (!course_id || !batch_name || !start_time || !end_time) {
    return res.status(400).json({ message: "All fields required" });
  }

  const q =
    "INSERT INTO batches (course_id, batch_name, start_time, end_time) VALUES (?,?,?,?)";

  db.query(q, [course_id, batch_name, start_time, end_time], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Batch added", id: result.insertId });
  });
});

app.get("/batches/course/:courseId", (req, res) => {
  const { courseId } = req.params;
  const q = "SELECT * FROM batches WHERE course_id = ?";

  db.query(q, [courseId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ------------------ SCHEDULED LECTURES ------------------
app.get("/lectures", (req, res) => {
  const q = `
    SELECT 
      sl.id,
      sl.lecture_date,
      b.batch_name,
      b.course_id,
      i.id AS instructor_id,
      i.name AS instructor_name
    FROM scheduled_lectures sl
    JOIN batches b ON sl.batch_id = b.id
    JOIN instructors i ON sl.instructor_id = i.id
  `;

  db.query(q, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post("/schedule-lecture", (req, res) => {
  const { batch_id, instructor_id, lecture_date } = req.body;

  if (!batch_id || !instructor_id || !lecture_date) {
    return res.status(400).json({ message: "All fields required" });
  }

  const q =
    "INSERT INTO scheduled_lectures (batch_id, instructor_id, lecture_date) VALUES (?,?,?)";

  db.query(q, [batch_id, instructor_id, lecture_date], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ message: "Instructor already has a lecture on this date" });
      }
      return res.status(500).json(err);
    }
    res.json({ message: "Lecture scheduled", id: result.insertId });
  });
});

// ------------------ INSTRUCTOR PAGE ------------------
app.get("/instructor/:id/lectures", (req, res) => {
  const instructorId = req.params.id;
  console.log(instructorId)
  const query = `
    SELECT 
      sl.id,
      sl.lecture_date,
      b.batch_name,
      b.start_time,
      b.end_time,
      c.name AS course_name,
      c.level
    FROM scheduled_lectures sl
    JOIN batches b ON sl.batch_id = b.id
    JOIN courses c ON b.course_id = c.id
    WHERE sl.instructor_id = ?
    ORDER BY sl.lecture_date, b.start_time
  `;

  db.query(query, [instructorId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ------------------ LOGIN ------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const query =
    "SELECT id, name FROM instructors WHERE email = ? AND password = ?";

  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.json({
        role: "instructor",
        instructor_id: results[0].id,
        instructor_name: results[0].name,
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  });
});


// ------------------ START SERVER ------------------
app.listen(5000, () => console.log("Server running on port 5000"));
