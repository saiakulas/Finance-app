import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase-config.js";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiActivity, FiCreditCard, FiAward, FiArrowRight, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';

function Profile() {
  const [user, setUser] = useState(null);
  const [userRecords, setUserRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creditScore, setCreditScore] = useState(600);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "Users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUser(userDocSnap.data());
          }

          // Real-time listener for this user's records
          const recordsRef = collection(db, "records");
          const q = query(recordsRef, where("email", "==", currentUser.email));

          const unsubscribeRecords = onSnapshot(q, (snapshot) => {
            const records = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setUserRecords(records);

            // Dynamic Credit Score Calculation
            if (records.length > 0) {
              let totalInst = 0;
              let paidInst = 0;
              records.forEach(r => {
                totalInst += r.installments.length;
                paidInst += r.installments.filter(Boolean).length;
              });
              const ratio = paidInst / totalInst;
              const calculatedScore = Math.floor(600 + (ratio * 300));
              setCreditScore(calculatedScore);
            } else {
              setCreditScore(600);
            }

            setLoading(false);
          });

          return () => unsubscribeRecords();
        } catch (error) {
          console.error("Discovery error:", error);
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  async function handleLogout() {
    try {
      await auth.signOut();
      navigate("/login");
      toast.info("Securely logged out.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const getScoreRating = (score) => {
    if (score >= 800) return "Excellent";
    if (score >= 700) return "Good";
    if (score >= 600) return "Fair";
    return "Average";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080a]">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      {/* Premium Header */}
      <header className="border-b border-white/5 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FiActivity className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AutoEMI</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Active Member</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5"
            >
              <FiLogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-black mb-2 tracking-tight">Dashboard</h2>
          <p className="text-white/40 font-medium">Welcome back, {user?.firstName || 'Valued Member'}. Your financing overview is synchronized.</p>
        </motion.div>

        {userRecords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-20 rounded-[3rem] text-center border-dashed border-white/10"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white/20">
              <FiCreditCard className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Active Subscriptions</h3>
            <p className="text-white/40 max-w-sm mx-auto mb-8">It looks like you don't have any active vehicle financing records yet.</p>
            <button className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform">
              Apply for Financing
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stats Column */}
            <div className="lg:col-span-2 space-y-8">
              {userRecords.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-[2.5rem] overflow-hidden group border-white/5"
                >
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-1/3 h-64 md:h-auto relative">
                      <img src={record.imageUrl || 'https://images.unsplash.com/photo-1542362567-b058c02b9ac8?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c0c0e]/80 hidden md:block"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e]/80 to-transparent md:hidden"></div>
                    </div>
                    <div className="md:w-2/3 p-10 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-2 block">Premium Vehicle</span>
                          <h3 className="text-3xl font-black mb-1">{record.vehicleName}</h3>
                          <p className="text-white/40 font-medium">Agreement #{record.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/40 uppercase font-black tracking-widest mb-1">Monthly</p>
                          <p className="text-3xl font-black text-purple-400 font-mono">₹{record.emi}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
                            <span>Payment Progress</span>
                            <span className="text-white">{Math.round((record.installments.filter(Boolean).length / record.installments.length) * 100)}% Complete</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-3 p-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(record.installments.filter(Boolean).length / record.installments.length) * 100}%` }}
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)] shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="bg-white/5 px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
                            <FiCheckCircle className="text-green-400" />
                            <span className="text-sm font-bold">{record.installments.filter(Boolean).length} Paid</span>
                          </div>
                          <div className="bg-white/5 px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
                            <FiClock className="text-yellow-400" />
                            <span className="text-sm font-bold">{record.installments.filter(i => !i).length} Remaining</span>
                          </div>
                          <Link
                            to={`/info/${record.id}`}
                            className="ml-auto bg-white text-black px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-purple-500 hover:text-white transition-all"
                          >
                            Details <FiArrowRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 rounded-[2.5rem] bg-indigo-600/10 border-indigo-500/20"
              >
                <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <FiAward className="text-indigo-400" /> Credit Score
                </h4>
                <div className="text-center py-6">
                  <p className="text-6xl font-black text-white mb-2 tracking-tighter">{creditScore}</p>
                  <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px]">{getScoreRating(creditScore)}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-white/40 text-xs font-medium leading-relaxed">Your credit health is {getScoreRating(creditScore).toLowerCase()}. This affects your eligibility for future finance applications.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-[2.5rem]"
              >
                <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <FiCalendar className="text-purple-400" /> Payment Schedule
                </h4>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-xs font-bold text-white/40 uppercase mb-1">Due Date</p>
                        <p className="text-sm font-bold">Mar {20 + i}, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-400 font-mono">₹{userRecords[0]?.emi || '0'}</p>
                        <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">PENDING</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;