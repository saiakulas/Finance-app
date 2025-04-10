import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase-config.js";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { motion } from "framer-motion";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [infoPageData, setInfoPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "Users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser(userData);

            const infoDocRef = doc(db, "records", id);
            const infoDocSnap = await getDoc(infoDocRef);

            if (infoDocSnap.exists()) {
              const recordData = infoDocSnap.data();
              if (recordData.email === userData.email) {
                setInfoPageData(recordData);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id]);

  async function handleLogout() {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid #f3f3f3",
            borderTop: "5px solid #7d3780",
            borderRadius: "50%"
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <Container className="py-5">
        {/* Header Section */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="d-flex justify-content-between align-items-center mb-5"
        >
          <div>
            <h1 style={{ color: "#4a2c40", fontWeight: "700" }}>
              {user ? `Welcome, ${user.email}!` : "Dashboard"}
            </h1>
            <p className="text-muted">Your vehicle financing dashboard</p>
          </div>
          <Button
            onClick={handleLogout}
            style={{
              backgroundColor: "#4a2c40",
              borderColor: "#4a2c40",
              padding: "8px 20px",
              borderRadius: "8px"
            }}
            className="shadow-sm"
          >
            Logout
          </Button>
        </motion.div>

        {/* Dashboard Cards */}
        <Row className="g-4">
          <Col md={6}>
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-100 border-0 shadow-sm rounded-lg overflow-hidden">
                <Card.Body style={{ backgroundColor: "#fff" }}>
                  <div className="d-flex align-items-center mb-3">
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(122, 55, 128, 0.1)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "15px"
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#7d3780"/>
                        <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#7d3780"/>
                      </svg>
                    </div>
                    <h5 className="mb-0" style={{ color: "#4a2c40" }}>Your Profile</h5>
                  </div>
                  {user && (
                    <div className="mt-3">
                      <p><strong>Email:</strong> {user.email}</p>
                      {infoPageData && (
                        <>
                          <p><strong>Vehicle:</strong> {infoPageData.vehicleModel || "Not specified"}</p>
                          <p><strong>Loan Amount:</strong> ${infoPageData.loanAmount || "0"}</p>
                        </>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          <Col md={6}>
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-100 border-0 shadow-sm rounded-lg overflow-hidden">
                <Card.Body style={{ backgroundColor: "#fff" }}>
                  <div className="d-flex align-items-center mb-3">
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(122, 55, 128, 0.1)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "15px"
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#7d3780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 12H16" stroke="#7d3780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16V8" stroke="#7d3780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h5 className="mb-0" style={{ color: "#4a2c40" }}>Quick Apply</h5>
                  </div>
                  <p className="text-muted">Start a new financing application in just a few clicks.</p>
                  <Button 
                    variant="primary" 
                    style={{ 
                      backgroundColor: "#7d3780", 
                      borderColor: "#7d3780",
                      borderRadius: "8px",
                      padding: "8px 20px"
                    }}
                    className="mt-2"
                  >
                    Apply Now
                  </Button>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mt-5"
        >
          <h3 style={{ color: "#4a2c40", fontWeight: "600" }} className="mb-4">Our Financing Solutions</h3>
          
          <Row className="g-4">
            <Col md={4}>
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-100 border-0 shadow-sm rounded-lg overflow-hidden">
                  <Card.Body style={{ backgroundColor: "#fff" }}>
                    <div className="text-center mb-3">
                      <div style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "rgba(122, 55, 128, 0.1)",
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "15px"
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 1V23" stroke="#7d3780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#7d3780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h5 style={{ color: "#4a2c40" }}>Flexible Rates</h5>
                    </div>
                    <p className="text-center text-muted">
                      Rates as low as 3.5% APR with flexible terms tailored to your budget.
                    </p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            <Col md={4}>
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-100 border-0 shadow-sm rounded-lg overflow-hidden">
                  <Card.Body style={{ backgroundColor: "#fff" }}>
                    <div className="text-center mb-3">
                      <div style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "rgba(122, 55, 128, 0.1)",
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "15px"
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#7d3780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 8V12L15 15" stroke="#7d3780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h5 style={{ color: "#4a2c40" }}>Quick Approval</h5>
                    </div>
                    <p className="text-center text-muted">
                      Get pre-approved in minutes with our streamlined application process.
                    </p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            <Col md={4}>
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-100 border-0 shadow-sm rounded-lg overflow-hidden">
                  <Card.Body style={{ backgroundColor: "#fff" }}>
                    <div className="text-center mb-3">
                      <div style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "rgba(122, 55, 128, 0.1)",
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "15px"
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#7d3780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h5 style={{ color: "#4a2c40" }}>No Hidden Fees</h5>
                    </div>
                    <p className="text-center text-muted">
                      Transparent pricing with no hidden fees or surprise charges.
                    </p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-5 py-5 px-4 rounded-lg text-center"
          style={{ backgroundColor: "rgba(122, 55, 128, 0.05)" }}
        >
          <h3 style={{ color: "#4a2c40" }} className="mb-3">Ready to get started?</h3>
          <p className="text-muted mb-4">Join thousands of satisfied customers who found their perfect financing solution with us.</p>
          <Button 
            variant="primary" 
            style={{ 
              backgroundColor: "#7d3780", 
              borderColor: "#7d3780",
              borderRadius: "8px",
              padding: "10px 30px",
              fontWeight: "500"
            }}
            className="shadow"
          >
            Apply for Financing
          </Button>
        </motion.div>
      </Container>
    </motion.div>
  );
}

export default Profile;