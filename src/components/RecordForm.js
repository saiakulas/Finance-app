import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore'; // Added getDoc import
import { db } from '../config/firebase-config.js';
import { Link, useNavigate } from 'react-router-dom';

const RecordForm = () => {
  const [name, setName] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [totalamount, setTotalamount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // State to hold image URL
  const [records, setRecords] = useState([]);
  const [emi, setEMI] = useState(0); // State to hold EMI
  const [currentRecordId, setCurrentRecordId] = useState(null); // State to hold the ID of the record being edited
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

      if (currentRecordId) {
        // If there is a current record ID, update the existing record
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
        // Otherwise, add a new record
        const q = query(recordsCollection, where('email', '==', email));
        const existingUser = await getDocs(q);
        if (!existingUser.empty) {
          alert('Record with this email already exists!');
          return;
        }

        const newInstallments = Array(parseInt(timePeriod)).fill(false); // Create an array for installments

        await addDoc(recordsCollection, {
          name,
          vehicleName,
          totalamount: parseFloat(totalamount),
          interestRate: parseFloat(interestRate),
          timePeriod: parseInt(timePeriod),
          email,
          emi: parseFloat(emi).toFixed(2), // Store emi in Firestore with 2 decimal places
          imageUrl, // Store imageUrl in Firestore
          installments: newInstallments // Store installments in Firestore
        });

        alert('Record added successfully!');
      }

      setName('');
      setVehicleName('');
      setTotalamount('');
      setInterestRate('');
      setTimePeriod('');
      setEmail('');
      setImageUrl(''); // Reset imageUrl state after adding record
      setEMI(0); // Reset EMI state after adding record
      setCurrentRecordId(null); // Reset current record ID after adding/updating record
      fetchRecords(); // Refresh records after adding/updating record
    } catch (error) {
      console.error('Error adding/updating record: ', error);
      alert('Error adding/updating record!');
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

  // Function to handle marking an installment as paid
  const handleInstallmentPaid = async (recordId, installmentIndex) => {
    try {
      const recordRef = doc(db, 'records', recordId);
      const recordSnapshot = await getDoc(recordRef);
      const recordData = recordSnapshot.data();

      const updatedInstallments = [...recordData.installments];
      updatedInstallments[installmentIndex] = true;

      await updateDoc(recordRef, { installments: updatedInstallments });
      fetchRecords(); // Refresh records after updating installment
    } catch (error) {
      console.error('Error updating installment: ', error);
      alert('Error updating installment!');
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

  // Function to handle editing a record
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
    <div>
      <h2>{currentRecordId ? 'Update Record' : 'Add Record'}</h2>
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
        <label>
          Image URL:
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </label>
        <br />
        <button type="submit">{currentRecordId ? 'Update Record' : 'Add Record'}</button>
      </form>

      <h2>Records</h2>
      <ul>
        {records.map(record => (
          <li key={record.id}>
            <p><strong>Name:</strong> {record.name}</p>
            <p><strong>Vehicle Name:</strong> {record.vehicleName}</p>
            <p><strong>Total Amount:</strong> {record.totalamount}</p>
            {record.imageUrl && <img src={record.imageUrl} alt={record.name} style={{ width: '100px', height: '100px' }} />}
            <p><strong>Installments:</strong></p>
            <div style={{ display: 'flex', gap: '5px' }}>
              {record.installments && record.installments.map((paid, index) => (
                <button
                  key={index}
                  style={{ width: '20px', height: '20px', backgroundColor: paid ? 'green' : 'red' }}
                  onClick={() => handleInstallmentPaid(record.id, index)}
                  
                  disabled={paid}
                >
                  {paid ? '✓' : ' '}
                </button>
              ))}
            </div>
            <button onClick={() => handleEdit(record)}>Edit</button>
            <button onClick={() => handleDelete(record.id)}>Delete</button>
            <Link to={`/info/${record.id}`}>Info</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecordForm;
