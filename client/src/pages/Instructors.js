

import React, { useEffect, useState } from "react";
import axios from "axios";

function InstructorDashboard() {
  const [lectures, setLectures] = useState([]);

  // instructor id stored during login
  const instructorId = localStorage.getItem("instructor_id");

  useEffect(() => {
    if (!instructorId) return;

    axios
      .get(`https://backend1234-orcin.vercel.app/instructor/${instructorId}/lectures`)
      .then((res) => {
        setLectures(res.data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load lectures");
      });
  }, [instructorId]);

  return (
    <div style={{
      maxWidth: "900px",
      margin: "40px auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        My Scheduled Lectures
      </h2>

      {lectures.length === 0 && (
        <p style={{ textAlign: "center", color: "#666" }}>
          No lectures assigned yet.
        </p>
      )}

      {lectures.map((lec) => (
        <div
          key={lec.id}
          style={{
            padding: "15px 20px",
            marginBottom: "15px",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          {/* Left Side */}
          <div>
            <h4 style={{ margin: "0", color: "#222" }}>
              {lec.course_name}
            </h4>
            <p style={{ margin: "5px 0", color: "#555" }}>
              Level: {lec.level}
            </p>
            <p style={{ margin: "5px 0", color: "#555" }}>
              Batch: {lec.batch_name}
            </p>
          </div>

          {/* Right Side */}
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0", fontWeight: "bold", color: "#007bff" }}>
              {new Date(lec.lecture_date).toLocaleDateString()}
            </p>
            <p style={{ margin: "5px 0", color: "#333" }}>
              {lec.start_time} – {lec.end_time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InstructorDashboard;