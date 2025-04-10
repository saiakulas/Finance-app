import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase-config.js';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiEdit2, FiTrash2, FiInfo, FiDollarSign, FiCalendar, FiPercent } from 'react-icons/fi';
import { toast } from 'react-toastify';

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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
      toast.success("Logged out successfully", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error(`Logout failed: ${error.message}`, {
        position: "top-center",
      });
    }
  };

  const fetchRecords = async () => {
    setIsLoading(true);
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
      toast.error('Failed to fetch records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
        toast.success('Record updated successfully!');
      } else {
        const q = query(recordsCollection, where('email', '==', email));
        const existingUser = await getDocs(q);
        if (!existingUser.empty) {
          toast.error('Record with this email already exists!');
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

        toast.success('Record added successfully!');
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
      toast.error('Error adding/updating record!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setIsLoading(true);
      try {
        const recordRef = doc(db, 'records', id);
        await deleteDoc(recordRef);
        toast.success('Record deleted successfully!');
        fetchRecords();
      } catch (error) {
        console.error('Error deleting record: ', error);
        toast.error('Error deleting record!');
      } finally {
        setIsLoading(false);
      }
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
      toast.success(`Installment ${installmentIndex + 1} marked as paid!`);
    } catch (error) {
      console.error('Error updating installment: ', error);
      toast.error('Error updating installment!');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Floating Logout Button */}
      <motion.button
        onClick={handleLogout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl bg-gradient-to-r from-[#4a2c40] to-[#7d3780] text-white font-medium hover:shadow-2xl transition-all duration-300 group"
      >
        <FiLogOut className="w-5 h-5 group-hover:rotate-180 transition-transform" />
        <span>Logout</span>
      </motion.button>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#4a2c40]">AutoEMI Manager</h1>
            <p className="text-gray-600">Track and manage your vehicle finance installments</p>
          </div>
          <div className="flex items-center gap-2 bg-[#f5f5f7] px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {records.length} {records.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-[#4a2c40] mb-6">
            {currentRecordId ? 'Update Vehicle Record' : 'Add New Vehicle'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] transition-all"
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="vehicleName" className="block text-sm font-medium text-gray-700">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  id="vehicleName"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] transition-all"
                  required
                  placeholder="Toyota Camry 2023"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="totalamount" className="block text-sm font-medium text-gray-700">
                  Total Amount ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="totalamount"
                    value={totalamount}
                    onChange={(e) => setTotalamount(e.target.value)}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] transition-all"
                    required
                    placeholder="25000"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPercent className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    id="interestRate"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] transition-all"
                    required
                    placeholder="7.5"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700">
                  Loan Term (months)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="timePeriod"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] transition-all"
                    required
                    placeholder="36"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Customer Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] transition-all"
                  required
                  placeholder="customer@example.com"
                />
              </div>
              
              <div className="md:col-span-2 space-y-1">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Vehicle Image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] transition-all"
                  placeholder="https://example.com/vehicle.jpg"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="text-lg font-medium bg-[#f8f5fa] px-4 py-2 rounded-lg">
                <span className="text-gray-600">Monthly EMI: </span>
                <span className="text-[#7d3780] font-bold">${emi}</span>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-[#4a2c40] to-[#7d3780] text-white rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7d3780] transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {currentRecordId ? 'Update Vehicle' : 'Add Vehicle'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Records Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#4a2c40] mb-6">Vehicle Finance Records</h2>
          
          {isLoading && records.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7d3780]"></div>
            </div>
          ) : records.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-dashed border-gray-300 text-center"
            >
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No records found</h3>
              <p className="text-gray-500">Add your first vehicle finance record to get started</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {records.map(record => (
                  <motion.div
                    key={record.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    {record.imageUrl && (
                      <div className="h-48 bg-gray-100 overflow-hidden">
                        <img 
                          src={record.imageUrl} 
                          alt={record.name} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        />
                      </div>
                    )}
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-[#4a2c40]">{record.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e9bd43] text-[#4a2c40]">
                          {record.installments.filter(Boolean).length}/{record.installments.length} paid
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-[#7d3780]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span>{record.vehicleName}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-[#7d3780]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>${record.totalamount} • ${record.emi}/mo</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-[#7d3780]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span>{record.interestRate}% interest</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Progress</h4>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-[#7d3780] h-2.5 rounded-full" 
                            style={{ 
                              width: `${(record.installments.filter(Boolean).length / record.installments.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {record.installments.filter(Boolean).length} of {record.installments.length} installments paid
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Installments</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.installments.map((paid, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleInstallmentPaid(record.id, index)}
                              disabled={paid}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                                paid 
                                  ? 'bg-green-500 text-white shadow-inner' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                              }`}
                            >
                              {paid ? '✓' : index + 1}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(record)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#e9bd43] bg-opacity-20 text-[#4a2c40] rounded-lg hover:bg-opacity-30 focus:outline-none transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(record.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 focus:outline-none transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </motion.button>
                        
                        <Link
                          to={`/info/${record.id}`}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#7d3780] bg-opacity-10 text-[#7d3780] rounded-lg hover:bg-opacity-20 focus:outline-none transition-colors"
                        >
                          <FiInfo className="w-4 h-4" />
                          <span>Details</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordForm;