import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../config/firebase-config.js";
import { toast } from "react-toastify";
import SignInwithGoogle from "./signInWIthGoogle";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");

      // Check if the user is an admin
      const isAdmin = await checkAdmin(userCredential.user.email); // Replace with your admin check logic

      if (isAdmin) {
        window.location.href = "/record"; // Redirect to admin page
      } else {
        window.location.href = "/profile"; // Redirect to regular profile page
      }

      toast.success("User logged in Successfully", {
        position: "top-center",
      });
    } catch (error) {
      console.log(error.message);

      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  // Example function to check if the user is an admin based on email domain
  const checkAdmin = async (email) => {
    // Replace with your admin check logic, e.g., checking email domain or roles
    // Example: Check if the email ends with your admin domain
    return email.endsWith("sai@gmail.com"); // Replace with your admin domain
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Login</h3>

      <div className="mb-3">
        <label>Email address</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
      <p className="forgot-password text-right">
        New user <a href="/register">Register Here</a>
      </p>
      <SignInwithGoogle />
    </form>
  );
}

export default Login;
