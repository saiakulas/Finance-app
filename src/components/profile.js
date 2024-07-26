import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase-config.js";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css'; // Import the CSS file for additional styling

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [infoPageData, setInfoPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Used for navigation

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "Users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser(userData);

            // Log the user's data for debugging
            console.log("User Data:", userData);

            // Fetch record based on the user's email
            const infoDocRef = doc(db, "records", id); // Use id to fetch the record
            const infoDocSnap = await getDoc(infoDocRef);

            if (infoDocSnap.exists()) {
              const recordData = infoDocSnap.data();
              console.log("Record Data:", recordData);

              // Check if record's email matches user's email
              if (recordData.email === userData.email) {
                setInfoPageData(recordData);
              } else {
                console.log("Record email does not match user's email.");
                setInfoPageData(null);
              }
            } else {
              setInfoPageData(null);
              console.log("No record found with this ID.");
            }
          } else {
            console.error("No such user document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error.message);
        } finally {
          setLoading(false);
        }
      } else {
        console.error("No user logged in.");
        setLoading(false);
        // Optionally, redirect to login or show an error message
      }
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [id]);

  async function handleLogout() {
    try {
      await auth.signOut();
      navigate("/login"); // Use navigate for redirect
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="profile-container d-flex flex-column min-vh-100">
      <div className="profile-content flex-grow-1 d-flex flex-column justify-content-center">
        <Row className="mb-4">
          <Col>
            {user ? (
              <p className="text-center" style={{ fontSize: "18px", fontWeight: "bold", color: "black" }}>
                Hi, {user.firstName}!
              </p>
            ) : (
              <p className="text-center" style={{ fontSize: "18px", fontWeight: "bold", color: "black" }}>
                Not logged in
              </p>
            )}
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title className="text-dark">About Us</Card.Title>
                <Card.Text className="text-dark">
                  Welcome to our vehicle finance company! We offer competitive financing solutions for your vehicle purchases. Our services include:
                  <ul>
                    <li>Flexible financing options</li>
                    <li>Low-interest rates starting from 3.5%</li>
                    <li>Quick and easy application process</li>
                    <li>Personalized loan terms to suit your needs</li>
                  </ul>
                  Partner with us for your vehicle financing needs and enjoy a seamless experience with transparent terms.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title className="text-dark">Finance with Us</Card.Title>
                <Card.Text className="text-dark">
                  Ready to finance your dream vehicle? Our finance options are designed to make your purchase easy and affordable. Here's what you can expect:
                  <ul>
                    <li>Competitive interest rates</li>
                    <li>Flexible repayment terms</li>
                    <li>Expert financial advice</li>
                    <li>Transparent loan agreements</li>
                  </ul>
                  Contact us today to discuss your financing options and get started on your vehicle purchase journey.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col className="text-center">
            <Button variant="primary" onClick={handleLogout}>
              Logout
            </Button>
          </Col>
        </Row>
      </div>
    </Container>
  );
}

export default Profile;
