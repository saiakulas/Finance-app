import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase-config.js';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const RecordForm = () => {
  const [name, setName] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [totalamount, setTotalamount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [records, setRecords] = useState([]);
  const [emi, setEMI] = useState(0);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const navigate = useNavigate();

  const fetchRecords = async () => {
    try {
      const recordsCollection = collection(db, 'records');
      const recordsSnapshot = await getDocs(recordsCollection);
      const recordsList = recordsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(recordsList);
    } catch (error) {
      console.error('Error fetching records: ', error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const recordsCollection = collection(db, 'records');

      if (currentRecordId) {
        const recordRef = doc(db, 'records', currentRecordId);
        await updateDoc(recordRef, {
          name,
          vehicleName,
          totalamount: parseFloat(totalamount),
          interestRate: parseFloat(interestRate),
          timePeriod: parseInt(timePeriod),
          email,
          emi: parseFloat(emi).toFixed(2),
          imageUrl
        });
        alert('Record updated successfully!');
      } else {
        const q = query(recordsCollection, where('email', '==', email));
        const existingUser = await getDocs(q);
        if (!existingUser.empty) {
          alert('Record with this email already exists!');
          return;
        }

        const newInstallments = Array(parseInt(timePeriod)).fill(false);

        await addDoc(recordsCollection, {
          name,
          vehicleName,
          totalamount: parseFloat(totalamount),
          interestRate: parseFloat(interestRate),
          timePeriod: parseInt(timePeriod),
          email,
          emi: parseFloat(emi).toFixed(2),
          imageUrl,
          installments: newInstallments
        });

        alert('Record added successfully!');
      }

      setName('');
      setVehicleName('');
      setTotalamount('');
      setInterestRate('');
      setTimePeriod('');
      setEmail('');
      setImageUrl('');
      setEMI(0);
      setCurrentRecordId(null);
      fetchRecords();
    } catch (error) {
      console.error('Error adding/updating record: ', error);
      alert('Error adding/updating record!');
    }
  };

  const handleDelete = async (id) => {
    try {
      const recordRef = doc(db, 'records', id);
      await deleteDoc(recordRef);
      alert('Record deleted successfully!');
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record: ', error);
      alert('Error deleting record!');
    }
  };

  const handleInstallmentPaid = async (recordId, installmentIndex) => {
    try {
      const recordRef = doc(db, 'records', recordId);
      const recordSnapshot = await getDoc(recordRef);
      const recordData = recordSnapshot.data();

      const updatedInstallments = [...recordData.installments];
      updatedInstallments[installmentIndex] = true;

      await updateDoc(recordRef, { installments: updatedInstallments });
      fetchRecords();
    } catch (error) {
      console.error('Error updating installment: ', error);
      alert('Error updating installment!');
    }
  };

  const calculateEMI = () => {
    const principal = parseFloat(totalamount);
    const rate = parseFloat(interestRate) / (12 * 100);
    const time = parseInt(timePeriod);

    if (principal > 0 && rate > 0 && time > 0) {
      const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
      setEMI(emi.toFixed(2));
    } else {
      setEMI(0);
    }
  };

  useEffect(() => {
    calculateEMI();
  }, [totalamount, interestRate, timePeriod]);

  const handleEdit = (record) => {
    setName(record.name);
    setVehicleName(record.vehicleName);
    setTotalamount(record.totalamount.toString());
    setInterestRate(record.interestRate.toString());
    setTimePeriod(record.timePeriod.toString());
    setEmail(record.email);
    setImageUrl(record.imageUrl);
    setEMI(record.emi);
    setCurrentRecordId(record.id);
  };

  return (
    <Container>
      <h2 className="mt-5 mb-4">{currentRecordId ? 'Update Record' : 'Add Record'}</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="name">
              <Form.Label>Name:</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="vehicleName">
              <Form.Label>Vehicle Name:</Form.Label>
              <Form.Control
                type="text"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="totalamount">
              <Form.Label>Total Amount:</Form.Label>
              <Form.Control
                type="number"
                value={totalamount}
                onChange={(e) => setTotalamount(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="interestRate">
              <Form.Label>Interest Rate (%):</Form.Label>
              <Form.Control
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="timePeriod">
              <Form.Label>Time Period (months):</Form.Label>
              <Form.Control
                type="number"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="email">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group controlId="imageUrl">
              <Form.Label>Image URL:</Form.Label>
              <Form.Control
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" variant="primary">
          {currentRecordId ? 'Update Record' : 'Add Record'}
        </Button>
      </Form>

      <h2 className="mt-5 mb-4">Records</h2>
      <Row>
        {records.map(record => (
          <Col key={record.id} md={4} className="mb-4">
            <Card style={{ height: '100%' }}>
              {record.imageUrl && (
                <Card.Img variant="top" src={record.imageUrl} alt={record.name} />
              )}
              <Card.Body>
                <Card.Title>{record.name}</Card.Title>
                <Card.Text>
                  <strong>Vehicle Name:</strong> {record.vehicleName}
                </Card.Text>
                <Card.Text>
                  <strong>Total Amount:</strong> {record.totalamount}
                </Card.Text>
                <Card.Text>
                  <strong>Installments:</strong>
                </Card.Text>
                <div className="d-flex flex-wrap">
                  {record.installments && record.installments.map((paid, index) => (
                    <Button
                      key={index}
                      variant={paid ? 'success' : 'secondary'}
                      size="sm"
                      className="m-1"
                      onClick={() => handleInstallmentPaid(record.id, index)}
                      disabled={paid}
                    >
                      {paid ? '✓' : ' '}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="warning"
                  size="sm"
                  className="mt-2 me-2"
                  onClick={() => handleEdit(record)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-2 me-2"
                  onClick={() => handleDelete(record.id)}
                >
                  Delete
                </Button>
                <Link to={`/info/${record.id}`} className="btn btn-info btn-sm mt-2">
                  Info
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default RecordForm;
