// src/components/InfoPage.js

import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const InfoPage = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);

  const getMarkers = async () => {
    try {
      const eventsCollection = collection(db, 'records');
      const querySnapshot = await getDocs(eventsCollection);
      const markers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      return markers;
    } catch (error) {
      console.error('Error fetching markers:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const markers = await getMarkers();
        console.log('Fetched markers:', markers); // Log markers for debugging

        const foundRecord = markers.find(marker => marker.id === id);
        console.log('Found record:', foundRecord); // Log the found record for debugging

        if (foundRecord) {
          setRecord(foundRecord);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching record:', error);
      }
    };

    fetchRecord();
  }, [id]);

  if (!record) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Record Details</h2>
      <p><strong>Name:</strong> {record.name}</p>
      <p><strong>Total Amount:</strong> {record.totalamount}</p>
      <p><strong>Email:</strong> {record.email}</p>
      <p><strong>Interest Rate:</strong> {record.interestRate}%</p>
            <p><strong>Time Period:</strong> {record.timePeriod} months</p>
            <p><strong>Email:</strong> {record.email}</p>
            <p><strong>Monthly EMI:</strong> {record.emi}</p> {/* Display EMI */}
    </div>
  );
};

export default InfoPage;
