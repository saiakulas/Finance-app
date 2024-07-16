// src/components/RecordForm.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore'; // Updated to include updateDoc
import { db } from '../config/firebase-config.js';
import { Link, useNavigate } from 'react-router-dom';

const RecordForm = () => {
  const [name, setName] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [totalamount, setTotalamount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [email, setEmail] = useState('');
  const [records, setRecords] = useState([]);
  const [emi, setEMI] = useState(0); // State to hold EMI
  const navigate = useNavigate();

  // Function to fetch records from Firestore
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

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const recordsCollection = collection(db, 'records');
      const q = query(recordsCollection, where('email', '==', email));
      const existingUser = await getDocs(q);
      if (!existingUser.empty) {
        alert('Record with this email already exists!');
        return;
      }

      await addDoc(recordsCollection, {
        name,
        vehicleName,
        totalamount: parseFloat(totalamount),
        interestRate: parseFloat(interestRate),
        timePeriod: parseInt(timePeriod),
        email,
        emi: parseFloat(emi).toFixed(2), // Store emi in Firestore with 2 decimal places
      });

      alert('Record added successfully!');
      setName('');
      setVehicleName('');
      setTotalamount('');
      setInterestRate('');
      setTimePeriod('');
      setEmail('');
      setEMI(0); // Reset EMI state after adding record
      fetchRecords(); // Refresh records after adding new record
    } catch (error) {
      console.error('Error adding record: ', error);
      alert('Error adding record!');
    }
  };

  // Function to handle deletion of a record
  const handleDelete = async (id) => {
    try {
      const recordRef = doc(db, 'records', id);
      await deleteDoc(recordRef);
      alert('Record deleted successfully!');
      fetchRecords(); // Refresh records after deletion
    } catch (error) {
      console.error('Error deleting record: ', error);
      alert('Error deleting record!');
    }
  };

  // Function to calculate EMI
  const calculateEMI = () => {
    const principal = parseFloat(totalamount);
    const rate = parseFloat(interestRate) / (12 * 100); // Monthly interest rate
    const time = parseInt(timePeriod); // Time period in months

    if (principal > 0 && rate > 0 && time > 0) {
      const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
      setEMI(emi.toFixed(2)); // Set calculated EMI to state
    } else {
      setEMI(0); // Reset EMI to 0 if any input is invalid
    }
  };

  // Call calculateEMI whenever totalamount, interestRate, or timePeriod changes
  useEffect(() => {
    calculateEMI();
  }, [totalamount, interestRate, timePeriod]);

  return (
    <div>
      <h2>Add Record</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <br />
        <label>
          Vehicle Name:
          <input type="text" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} required />
        </label>
        <br />
        <label>
          Total Amount:
          <input type="number" value={totalamount} onChange={(e) => setTotalamount(e.target.value)} required />
        </label>
        <br />
        <label>
          Interest Rate (%):
          <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} required />
        </label>
        <br />
        <label>
          Time Period (months):
          <input type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} required />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Add Record</button>
      </form>

      <h2>Records</h2>
      <ul>
        {records.map(record => (
          <li key={record.id}>
            <p><strong>Name:</strong> {record.name}</p>
            <p><strong>Vehicle Name:</strong> {record.vehicleName}</p>
            <p><strong>Total Amount:</strong> {record.totalamount}</p>
            <button onClick={() => handleDelete(record.id)}>Delete</button>
            <Link to={`/info/${record.id}`}>Info</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecordForm;
