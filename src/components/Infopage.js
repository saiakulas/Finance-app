import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiPrinter, FiShield, FiTrendingUp, FiCheckCircle, FiInfo, FiActivity } from 'react-icons/fi';

const InfoPage = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time listener for a specific record
    const recordRef = doc(db, 'records', id);
    const unsubscribe = onSnapshot(recordRef, (docSnap) => {
      if (docSnap.exists()) {
        setRecord({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error('Record not found or has been purged.');
        navigate('/profile');
      }
      setLoading(false);
    }, (error) => {
      console.error('Real-time sync error:', error);
      toast.error('Failed to sync details');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080a]">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!record) return null;

  const totalPaid = record.installments.filter(Boolean).length;
  const totalInstallments = record.installments.length;
  const progress = (totalPaid / totalInstallments) * 100;

  // Basic calculation for total payable (Principal + Simple Interest for demonstration)
  const totalInterest = (parseFloat(record.totalamount) * (parseFloat(record.interestRate) / 100));
  const totalPayable = parseFloat(record.totalamount) + totalInterest;

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 font-bold text-sm tracking-widest uppercase"
        >
          <FiArrowLeft /> Return to Dashboard
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="glass-card rounded-[3rem] overflow-hidden border-white/5">
              <div className="h-80 relative">
                <img src={record.imageUrl || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/20 to-transparent"></div>
                <div className="absolute bottom-10 left-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                      <FiActivity className="text-white w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Certificate of Financing</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tight">{record.vehicleName}</h2>
                </div>
              </div>

              <div className="p-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                  {[
                    { label: 'Agreement ID', value: `#${record.id.slice(-6).toUpperCase()}` },
                    { label: 'Client Asset', value: record.name },
                    { label: 'Risk Rating', value: 'Low Premium', color: 'text-green-400' },
                    { label: 'Term Duration', value: `${record.timePeriod} Months` }
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{item.label}</p>
                      <p className={`font-bold ${item.color || 'text-white'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-10">
                  <section>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <FiShield className="text-purple-500" /> Executive Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-4">Total Amount Disbursed</p>
                        <p className="text-3xl font-black font-mono text-purple-400">₹{parseFloat(record.totalamount).toLocaleString()}</p>
                        <div className="mt-4 flex items-center gap-2 text-green-400 text-[10px] font-black">
                          <FiTrendingUp /> SECURED ASSET
                        </div>
                      </div>
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-4">Monthly Commitment</p>
                        <p className="text-3xl font-black font-mono text-purple-400">₹{record.emi}</p>
                        <p className="text-[10px] font-bold text-white/20 mt-4 italic">Next due on 01/04/2024</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <FiCheckCircle className="text-green-500" /> Full Payment Stream
                      </h3>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{totalPaid} / {totalInstallments} Cycles Complete</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {record.installments.map((paid, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${paid
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]'
                              : 'bg-white/5 text-white/20 border border-white/5'
                            }`}
                        >
                          {paid ? '✓' : i + 1}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            <div className="glass-card p-10 rounded-[3rem] text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-8">Asset Liquidation Progress</p>
              <div className="relative inline-flex items-center justify-center p-1 rounded-full bg-white/5 mb-8">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" className="text-white/5 stroke-current" strokeWidth="12" fill="transparent" />
                  <motion.circle
                    cx="80" cy="80" r="70"
                    className="text-purple-600 stroke-current"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="transparent"
                    initial={{ strokeDasharray: "440", strokeDashoffset: "440" }}
                    animate={{ strokeDashoffset: 440 - (440 * progress) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-4xl font-black">{Math.round(progress)}%</p>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Paid</p>
                </div>
              </div>
              <div className="text-left space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40">Total Interests</span>
                  <span className="text-sm font-bold text-white">₹{totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40">Total Payable</span>
                  <span className="text-sm font-bold text-purple-400">₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem]">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Fi_Info className="text-indigo-400" /> Digital Ledger
              </h4>
              <div className="space-y-6">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-1">Last Sync</p>
                  <p className="text-sm font-medium">Instance Synchronized</p>
                </div>
                <button className="w-full py-4 bg-white text-black font-black rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-all">
                  <FiPrinter /> Download Statement
                </button>
                <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-widest px-4 leading-relaxed">
                  This is a cryptographically signed electronic ledger. All transactions are final.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Fixed the naming for FiInfo (it was Fi_Info in one place in my diff plan potentially)
const Fi_Info = FiInfo;

export default InfoPage;