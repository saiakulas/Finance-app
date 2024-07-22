import React from 'react';

const Data = ({ record }) => {
  if (!record) {
    return <p>No data</p>;
  }

  return (
    <div>
      <h2>Record Details</h2>
      <p><strong>Name:</strong> {record.name}</p>
      <p><strong>Total Amount:</strong> {record.totalamount}</p>
      <p><strong>Email:</strong> {record.email}</p>
      <p><strong>Interest Rate:</strong> {record.interestRate}%</p>
      <p><strong>Time Period:</strong> {record.timePeriod} months</p>
      <p><strong>Monthly EMI:</strong> {record.emi}</p>
    </div>
  );
};

export default Data;
