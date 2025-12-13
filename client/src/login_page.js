import React, { useState } from "react";
import axios from "axios";
import "./App.css";
export default function LoginPage({ setAdminLoggedIn, setInstructorLoggedIn, setInstructorId }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = () => {
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  if (email === "admin@gmail.com" && password === "admin123") {
    alert("Admin Login Successful");
    window.location.href = "/admin";
    return;
  }

  axios.post("https://backend1234-orcin.vercel.app/api/login", {
        email: email.trim(),
        password: password.trim()
  });

    .then(res => {
      if (res.data.role === "instructor") {
        alert("Instructor Login Successful");
        localStorage.setItem("instructor_id", res.data.instructor_id);
        window.location.href = "/Instructors";
      } else {
        alert("Invalid role or credentials");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Invalid email or password");
    });
};


  return (
    <div className="boxStyle" style={{position:"absolute",left:"500px",height:"400px",width:"600px"}}>
      <h1 style={{ textAlign: "center" }}>Login</h1><br/>

      <label style={{ fontWeight: "bold" }}>Email</label><br/>
      <input
        type="email"
        value={email}
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          margin: "5px 0 15px 0",
          border: "1px solid #aaa",
          borderRadius: "5px"
        }}
      />

      <label style={{ fontWeight: "bold" }}>Password</label>
      <input
        type="password"
        value={password}
        placeholder="Enter Password"
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          margin: "5px 0 20px 0",
          border: "1px solid #aaa",
          borderRadius: "5px"
        }}
      /><br/><br/>

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "black",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Login
      </button>
    </div>
  );
}