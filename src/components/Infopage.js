import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const InfoPage = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

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
      toast.error('Failed to load record data', {
        position: 'bottom-center'
      });
      throw error;
    }
  };

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const markers = await getMarkers();
        const foundRecord = markers.find(marker => marker.id === id);

        if (foundRecord) {
          setRecord(foundRecord);
        } else {
          toast.error('Record not found', {
            position: 'bottom-center'
          });
        }
      } catch (error) {
        console.error('Error fetching record:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#4a2c40] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#4a2c40] mb-4">Record Not Found</h2>
          <p className="text-gray-600 mb-6">The requested record could not be loaded.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-[#4a2c40] text-white rounded-md hover:bg-[#5a3c50] transition-colors"
            onClick={() => window.history.back()}
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header Section with Image */}
          <div className="relative bg-gradient-to-r from-[#4a2c40] to-[#7d3780] p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {record.imageUrl && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0"
                >
                  <img 
                    src={record.imageUrl} 
                    alt={record.name} 
                    className="w-full h-full object-cover rounded-lg border-4 border-white shadow-md"
                  />
                </motion.div>
              )}
              <div className="flex-1">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl font-bold mb-2"
                >
                  {record.name}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-gray-100 mb-1"
                >
                  <span className="font-medium">Vehicle:</span> {record.vehicleName}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-100"
                >
                  <span className="font-medium">Email:</span> {record.email}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Loan Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200"
              >
                <h3 className="text-xl font-semibold text-[#4a2c40] mb-4 pb-2 border-b border-gray-200">
                  Loan Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Total Amount:</span>
                    <span className="text-[#4a2c40] font-semibold">₹{record.totalamount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Interest Rate:</span>
                    <span className="text-[#4a2c40] font-semibold">{record.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Time Period:</span>
                    <span className="text-[#4a2c40] font-semibold">{record.timePeriod} months</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Monthly EMI:</span>
                    <span className="text-xl text-[#7d3780] font-bold">₹{record.emi}</span>
                  </div>
                </div>
              </motion.div>

              {/* Payment Schedule */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200"
              >
                <h3 className="text-xl font-semibold text-[#4a2c40] mb-4 pb-2 border-b border-gray-200">
                  Payment Overview
                </h3>
                <div className="space-y-4">
                  <div className="bg-[#f5f0f5] p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 font-medium">Total Payable</p>
                        <p className="text-sm text-gray-500">Principal + Interest</p>
                      </div>
                      <span className="text-[#4a2c40] font-semibold">
                        ₹{(parseFloat(record.totalamount) + (parseFloat(record.totalamount) * (parseFloat(record.interestRate)/100))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#f5f0f5] p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 font-medium">Total Interest</p>
                        <p className="text-sm text-gray-500">Over loan term</p>
                      </div>
                      <span className="text-[#4a2c40] font-semibold">
                        ₹{(parseFloat(record.totalamount) * (parseFloat(record.interestRate)/100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 text-center">
                      First payment due on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-[#f9f5f9] px-6 py-4 border-t border-gray-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-white text-[#4a2c40] border border-[#4a2c40] rounded-md hover:bg-gray-50 transition-colors"
                >
                  Print Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-[#4a2c40] text-white rounded-md hover:bg-[#5a3c50] transition-colors"
                  onClick={() => window.history.back()}
                >
                  Back to Records
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InfoPage;