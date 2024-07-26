import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../config/firebase-config.js";
import { toast } from "react-toastify";
import SignInwithGoogle from "./signInWIthGoogle";
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

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
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <h3 className="text-center mb-4">Login</h3>

            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mt-3">
              Submit
            </Button>

            <p className="text-center mt-3">
              New user <a href="/register">Register Here</a>
            </p>

            <SignInwithGoogle />
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
