import React, { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/login";
import SignUp from "./components/register";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./components/profile";
import { auth } from "./config/firebase-config.js";
import InfoPage from "./components/Infopage";
import RecordForm from "./components/RecordForm";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App dark">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/profile" /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/profile" /> : <SignUp />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/info/:id" element={user ? <InfoPage /> : <Navigate to="/login" />} />
          <Route path="/record" element={user ? <RecordForm /> : <Navigate to="/login" />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          theme="dark"
          toastStyle={{ backgroundColor: "#1e1e24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "#eee" }}
          progressStyle={{ background: "linear-gradient(to right, #9333ea, #4f46e5)" }}
        />
      </div>
    </Router>
  );
}

export default App;
