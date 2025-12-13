import React, { useState , useEffect} from 'react';
import axios from 'axios';
import './App.css';

function App() {

  const [instructor, setInstructor] = useState(false);
  const [course, setCourse] = useState(false);
  const [lecture, setLecture] = useState(false);
  const [batch, setBatch] = useState(false);

  const instructorBtn = () => {
    setInstructor(!instructor);
  }

  const courseBtn = () => {
    setCourse(!course);
  }

  const lectureBtn = () => {
     setLecture(!lecture)
}

const batchBtn = () => {
     setBatch(!batch)
}

  return (
    <div>

      <div className="header">
        <h1>Admin Section</h1>
      </div>

      <div className="sidebar">
        <input 
          value="Add Instructor" 
          className="sidebarButton" 
          onClick={instructorBtn}
          
        />

        <input 
          value="Add Courses" 
          className="sidebarButton" 
          onClick={courseBtn}
          
        />

        <input 
          value="Schedule Lectures" 
          className="sidebarButton"
          onClick={lectureBtn}
        />

       <input 
          value="Add Batches" 
          className="sidebarButton"
          onClick={batchBtn}
        />
      </div>

      <div className="contentArea">
        {instructor ? <Instructor /> : null}
        {course ? <Course /> : null}
        {batch ? <AddBatch /> : null}
        {lecture ? <ScheduleLecture /> : null}
      </div>

    </div>
  );
}



function ScheduleLecture() {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [existingLectures, setExistingLectures] = useState([]);

  // Load courses, instructors, and existing lectures
  useEffect(() => {
    axios.get("https://backend1234-orcin.vercel.app/courses")
      .then(res => setCourses(res.data))
      .catch(err => console.log(err));

    axios.get("https://backend1234-orcin.vercel.app/instructors")
      .then(res => setInstructors(res.data))
      .catch(err => console.log(err));

    axios.get("https://backend1234-orcin.vercel.app/lectures")
      .then(res => setExistingLectures(res.data))
      .catch(err => console.log(err));
  }, []);

  // Load batches for selected course
  useEffect(() => {
    if (selectedCourse) {
      axios.get(`https://backend1234-orcin.vercel.app/batches/course/${selectedCourse}`)
        .then(res => setBatches(res.data))
        .catch(err => console.log(err));
      setSelectedBatch(""); // reset batch when course changes
    } else {
      setBatches([]);
      setSelectedBatch("");
    }
  }, [selectedCourse]);

  const handleSchedule = () => {
    if (!selectedCourse || !selectedBatch || !selectedInstructor || !selectedDate) {
      alert("Please select all fields");
      return;
    }

    // Simple clash check: same instructor cannot have lecture on same date
    const clash = existingLectures.find(
      lec => lec.instructor_id === parseInt(selectedInstructor) &&
             lec.lecture_date === selectedDate
    );

    if (clash) {
      alert("This instructor already has a lecture on this date");
      return;
    }

    const newLecture = {
      batch_id: selectedBatch,
      instructor_id: selectedInstructor,
      lecture_date: selectedDate
    };

    axios.post("https://backend1234-orcin.vercel.app/schedule-lecture", newLecture)
      .then(() => {
        alert("Lecture scheduled successfully!");
        setSelectedCourse("");
        setSelectedBatch("");
        setSelectedInstructor("");
        setSelectedDate("");
      })
      .catch(err => {
        console.error(err);
        alert("Error scheduling lecture");
      });
  };

  return (
    <div className="boxStyle">
      <h3 style={{ textAlign: "center" }}>Schedule Lecture</h3>

      {/* Course */}
      <label>Select Course</label>
      <select
        value={selectedCourse}
        onChange={e => setSelectedCourse(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      >
        <option value="">-- Select Course --</option>
        {courses.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Batch */}
      <label>Select Batch</label>
      <select
        value={selectedBatch}
        onChange={e => setSelectedBatch(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        disabled={!selectedCourse}
      >
        <option value="">-- Select Batch --</option>
        {batches.map(b => (
          <option key={b.id} value={b.id}>{b.batch_name}</option>
        ))}
      </select>

      {/* Instructor */}
      <label>Select Instructor</label>
      <select
        value={selectedInstructor}
        onChange={e => setSelectedInstructor(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      >
        <option value="">-- Select Instructor --</option>
        {instructors.map(i => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))}
      </select>

      {/* Date */}
      <label>Select Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
      />

      <button
        onClick={handleSchedule}
        style={{
          width: "100%",
          padding: "10px",
          background: "black",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Schedule
      </button>
    </div>
  );
}





 function Instructor() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post("https://backend1234-orcin.vercel.app/instructors/add", {
        name,
        email,
        password,
      });

      alert("Instructor added");

      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      alert("Error adding instructor");
    }
  };

  return (
    <div className="boxStyle">
      <h2 style={{ textAlign: "center", marginBottom: "15px" }}>
        Add Instructor
      </h2>

      <form onSubmit={handleSubmit}>
        
        <div style={{ marginBottom: "15px" }}>
          <label><b>Name *</b></label>
          <input
            type="text"
            placeholder="Enter instructor name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><b>Email *</b></label>
          <input
            type="email"
            placeholder="Enter instructor email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><b>Password *</b></label>
          <input
            type="password"
            placeholder="Set password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add Instructor
        </button>

      </form>
    </div>
  );
}



function Course() {

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [desc, setDescription] = useState("");

  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState("");

  const chooseImg = (e) => {
    let f = e.target.files[0];
    setImg(f);

    if (f) {
      setPreview(URL.createObjectURL(f));
    }
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("level", level);
    formData.append("description", desc);
    if (img) formData.append("image", img);

    try {
      await axios.post("https://backend1234-orcin.vercel.app/courses/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Course added!");
      setName(""); setLevel(""); setDescription(""); setImg(null);
    } catch (err) {
      console.error(err);
      alert("Error adding course");
    }
  };

  return (
    <div className="boxStyle">

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Add Course</h2>

     <form onSubmit={handleSubmit}>

  <div style={{ marginBottom: "15px" }}>
    <label><b>Course Name *</b></label>
    <input 
      type="text"
      value={name}
      placeholder="Enter course name"
      onChange={(e) => setName(e.target.value)}
      style={{ width: "100%", padding: "8px", marginTop: "5px" }}
    />
  </div>

  <div style={{ marginBottom: "15px" }}>
    <label><b>Level *</b></label>
    <select 
      value={level}
      onChange={(e) => setLevel(e.target.value)}
      style={{ width: "100%", padding: "8px", marginTop: "5px" }}
    >
      <option value="">Select Level</option>
      <option value="Beginner">Beginner</option>
      <option value="Intermediate">Intermediate</option>
      <option value="Advanced">Advanced</option>
    </select>
  </div>

  <div style={{ marginBottom: "15px" }}>
    <label><b>Description *</b></label>
    <textarea 
      value={desc}
      placeholder="Enter course description"
      onChange={(e) => setDescription(e.target.value)}
      style={{ width: "100%", padding: "8px", marginTop: "5px", height: "80px" }}
    />
  </div>

  <div style={{ marginBottom: "15px" }}>
    <label><b>Course Image</b></label>
    <input 
      type="file"
      onChange={chooseImg}
      style={{ marginTop: "5px" }}
    />

    {preview && (
      <img 
        src={preview}
        alt="preview"
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          borderRadius: "8px",
          marginTop: "10px"
        }}
      />
    )}
  </div>

  <button 
    type="submit"
    style={{
      width: "100%",
      padding: "10px",
      background: "#4CAF50",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer"
    }}
  >
    Add Course
  </button>

</form>

    </div>
  );
}




function AddBatch() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    axios.get("https://backend1234-orcin.vercel.app/courses")
      .then(res => setCourses(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleAddBatch = () => {
    if (!courseId || !batchName || !startTime || !endTime) {
      alert("Please fill all fields");
      return;
    }

    const newBatch = {
      course_id: courseId,
      batch_name: batchName,
      start_time: startTime,
      end_time: endTime
    };

    axios.post("https://backend1234-orcin.vercel.app/add-batch", newBatch)
      .then(res => {
        alert("Batch Added Successfully!");
        setBatchName("");
        setStartTime("");
        setEndTime("");
      })
      .catch(err => {
        console.log(err);
        alert("Failed to add batch");
      });
  };

  return (
    <div className="boxStyle">
      <h3>Add Batch</h3>

      {/* Select Course */}
      <label>Select Course</label>
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      >
        <option value="">-- Select Course --</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>

      {/* Batch Name */}
      <label>Batch Name</label>
      <input
        type="text"
        placeholder="e.g., Morning Batch"
        value={batchName}
        onChange={(e) => setBatchName(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {/* Start Time */}
      <label>Start Time</label>
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {/* End Time */}
      <label>End Time</label>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
      />

      <button
        onClick={handleAddBatch}
        style={{
          width: "100%",
          padding: "10px",
          background: "black",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Add Batch
      </button>
    </div>
  );
}



export default App;


