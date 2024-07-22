import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase-config.js";
import { doc, getDoc } from "firebase/firestore";
import Data from "./data.js";
import { useParams } from "react-router-dom";

function Profile() {
  const { id } = useParams();
  const [userEmail, setUserEmail] = useState(null);
  const [infoPageData, setInfoPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "Users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserEmail(userData.email);

            // Fetch record based on user's email
            const infoDocRef = doc(db, "records", userData.email);
            const infoDocSnap = await getDoc(infoDocRef);
            console.log(recordData.email)
            if (infoDocSnap.exists()) {
              const recordData = infoDocSnap.data();
             
              // Check if record's email matches user's email
              if (recordData.email === userData.email) {
                setInfoPageData(recordData);
              } else {
                console.log("Record email does not match user's email.");
                setInfoPageData(null);
              }
            } else {
              setInfoPageData(null);
              console.log("No record found for this user.");
            }
          } else {
            console.error("No such user document!");
          }
        } else {
          console.error("No user logged in.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Finance Dashboard</h1>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button className="btn btn-primary" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {userEmail && <p>Logged in as: {userEmail}</p>}
        {infoPageData ? (
          <Data record={infoPageData} />
        ) : (
          <p>No data found for this user.</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
