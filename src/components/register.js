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

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'Users', user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: ''
        });
      }
      toast.success('User Registered Successfully!!', {
        position: 'top-center'
      });
      window.location.href = "/profile";
    } catch (error) {
      toast.error(error.message, {
        position: 'bottom-center'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-[#4a2c40]">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Join us today</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fname" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="fname"
                  name="fname"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] focus:z-10 sm:text-sm"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lname"
                  name="lname"
                  type="text"
                  autoComplete="family-name"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] focus:z-10 sm:text-sm"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d3780] focus:border-[#7d3780] focus:z-10 sm:text-sm"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4a2c40] hover:bg-[#5a3c50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7d3780] transition-colors duration-200"
            >
              Sign Up
            </motion.button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-[#7d3780] hover:text-[#4a2c40] transition-colors duration-200">
              Login here
            </a>
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <SignInwithGoogle />
      </motion.div>
    </motion.div>
  );
}

export default Register;