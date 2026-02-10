import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase-config.js';
import { setDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import SignInwithGoogle from './signInWIthGoogle';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'Users', user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: '',
          createdAt: new Date().toISOString()
        });
      }
      toast.success('Registration complete! Welcome to AutoEMI.', {
        position: 'top-center'
      });
      window.location.href = "/profile";
    } catch (error) {
      toast.error(error.message, {
        position: 'bottom-center'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center premium-gradient py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 rounded-2xl bg-indigo-500/10 mb-4"
          >
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </motion.div>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Join AutoEMI</h2>
          <p className="text-indigo-200/60 font-medium">Create your premium financing profile</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fname" className="block text-sm font-medium text-indigo-200/80 mb-2 ml-1">
                  First Name
                </label>
                <input
                  id="fname"
                  name="fname"
                  type="text"
                  required
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  className="input-premium w-full"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lname" className="block text-sm font-medium text-indigo-200/80 mb-2 ml-1">
                  Last Name
                </label>
                <input
                  id="lname"
                  name="lname"
                  type="text"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  className="input-premium w-full"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-indigo-200/80 mb-2 ml-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium w-full"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-indigo-200/80 mb-2 ml-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-premium w-full"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex justify-center items-center disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Create Account"}
            </motion.button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-indigo-200/40 text-sm">
            Already have access?{" "}
            <a href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign In
            </a>
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 bg-[#0c0c0e] text-indigo-200/40 font-medium tracking-widest">Global Access</span>
          </div>
        </div>

        <div className="flex justify-center">
          <SignInwithGoogle />
        </div>
      </motion.div>
    </div>
  );
}

export default Register;