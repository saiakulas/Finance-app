import React from "react";
import { auth } from "../config/firebase-config.js";

function Profile() {
  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login"; // Redirect to login page after logout
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Finance Dashboard</h1>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button className="btn btn-primary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;