import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase-config.js';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiEdit2, FiTrash2, FiInfo, FiPlus, FiGrid, FiActivity, FiDollarSign, FiCalendar, FiPercent } from 'react-icons/fi';
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
      toast.success("Safe travels! Logged out successfully.");
    } catch (error) {
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const recordsCollection = collection(db, 'records');

    // Real-time listener
    const unsubscribe = onSnapshot(recordsCollection, (snapshot) => {
      const recordsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(recordsList);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching records: ', error);
      toast.error('Failed to sync records');
      setIsLoading(false);
    });

    return () => unsubscribe();
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
        toast.success('Record updated elegantly');
        setIsFormOpen(false);
      } else {
        const q = query(recordsCollection, where('email', '==', email));
        const existingUsers = await onSnapshot(q, (snapshot) => {
          // This is a one-time check usually, but for real-time we should be careful
        });
        // Simplification for now: keep existing logic for addDoc
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
          installments: newInstallments,
          createdAt: new Date().toISOString()
        });

        toast.success('New vehicle finance record established');
        setIsFormOpen(false);
      }

      // Reset form
      setName('');
      setVehicleName('');
      setTotalamount('');
      setInterestRate('');
      setTimePeriod('');
      setEmail('');
      setImageUrl('');
      setEMI(0);
      setCurrentRecordId(null);
    } catch (error) {
      toast.error('Synthesis failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to terminate this record?')) {
      try {
        const recordRef = doc(db, 'records', id);
        await deleteDoc(recordRef);
        toast.success('Record purged successfully');
      } catch (error) {
        toast.error('Purge failed: ' + error.message);
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
      toast.success(`Installment ${installmentIndex + 1} finalized`);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const calculateEMI = () => {
    const principal = parseFloat(totalamount);
    const rate = parseFloat(interestRate) / (12 * 100);
    const time = parseInt(timePeriod);

    if (principal > 0 && rate > 0 && time > 0) {
      const emiVal = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
      setEMI(emiVal.toFixed(2));
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
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      {/* Sidebar/Top Nav simulation */}
      <nav className="border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <FiActivity className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AutoEMI <span className="text-purple-500">Admin</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
              <FiLogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Records', value: records.length, icon: <FiGrid />, color: 'purple' },
            { label: 'Active Loans', value: records.filter(r => r.installments.some(i => !i)).length, icon: <FiActivity />, color: 'blue' },
            { label: 'Growth', value: '+12%', icon: <FiPlus />, color: 'green' }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="glass-card p-6 rounded-3xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/40 text-sm font-medium mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Finance Management</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 rounded-2xl font-bold shadow-lg shadow-purple-500/20"
          >
            <FiPlus /> {isFormOpen ? 'Close Editor' : 'Create New Record'}
          </motion.button>
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="glass-card p-8 rounded-3xl border-purple-500/20 bg-purple-500/5">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60 ml-1">Customer Name</label>
                      <input value={name} onChange={e => setName(e.target.value)} className="input-premium w-full" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60 ml-1">Vehicle Model</label>
                      <input value={vehicleName} onChange={e => setVehicleName(e.target.value)} className="input-premium w-full" placeholder="Tesla Model 3" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60 ml-1">Total Principal (₹)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">₹</div>
                        <input type="number" value={totalamount} onChange={e => setTotalamount(e.target.value)} className="input-premium w-full pl-10" placeholder="50000" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60 ml-1">Interest Rate (%)</label>
                      <div className="relative">
                        <FiPercent className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="input-premium w-full pl-10" placeholder="4.5" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60 ml-1">Term (Months)</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input type="number" value={timePeriod} onChange={e => setTimePeriod(e.target.value)} className="input-premium w-full pl-10" placeholder="60" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60 ml-1">Customer Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-premium w-full" placeholder="customer@email.com" required />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 space-y-2">
                      <label className="text-sm font-medium text-white/60 ml-1">Thumbnail URL</label>
                      <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="input-premium w-full" placeholder="https://..." />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-white/5">
                    <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-4">
                      <span className="text-white/40 font-medium">Monthly Assessment:</span>
                      <span className="text-2xl font-bold text-purple-400 font-mono tracking-tighter">₹{emi}</span>
                    </div>
                    <button type="submit" disabled={isLoading} className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-all disabled:opacity-50 min-w-[200px]">
                      {currentRecordId ? 'Update Sequence' : 'Commit Record'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Records Grid */}
        {isLoading && records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p>Syncing encrypted database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {records.map((record, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={record.id}
                className="glass-card rounded-[2.5rem] overflow-hidden group border-white/5 hover:border-purple-500/30 transition-all duration-500"
              >
                <div className="h-48 relative overflow-hidden">
                  <img src={record.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] uppercase font-black tracking-widest text-white/80 border border-white/10">
                      {record.installments.filter(Boolean).length} / {record.installments.length} PAID
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{record.name}</h3>
                      <p className="text-white/40 text-sm">{record.vehicleName}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-purple-400 font-bold">₹{record.emi}</p>
                      <p className="text-[10px] text-white/20 uppercase tracking-tighter">per month</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(record.installments.filter(Boolean).length / record.installments.length) * 100}%` }}
                        className="bg-purple-500 h-full rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 font-bold tracking-widest uppercase">
                      <span>Principal: ₹{record.totalamount}</span>
                      <span>{record.interestRate}% APR</span>
                    </div>
                  </div>

                  {/* Installment Bubbles */}
                  <div className="flex flex-wrap gap-2 mb-8 h-18 overflow-y-auto custom-scrollbar grayscale group-hover:grayscale-0 transition-all duration-500">
                    {record.installments.map((paid, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleInstallmentPaid(record.id, idx)}
                        disabled={paid}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${paid
                          ? 'bg-green-500/20 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                          : 'bg-white/5 text-white/30 border border-white/5 hover:border-purple-500/50 hover:text-white'
                          }`}
                      >
                        {paid ? '✓' : idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-white/5">
                    <button
                      onClick={() => handleEdit(record)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="w-12 h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center transition-all border border-red-500/10"
                    >
                      <FiTrash2 />
                    </button>
                    <Link
                      to={`/info/${record.id}`}
                      className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center transition-all border border-white/5"
                    >
                      <FiInfo />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RecordForm;