import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../config/firebase-config.js";
import { toast } from "react-toastify";
import SignInwithGoogle from "./signInWIthGoogle";
import { motion } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const checkAdmin = (email) => email.toLowerCase().endsWith("owner@gmail.com");
      const isAdmin = checkAdmin(userCredential.user.email);

      toast.success("Welcome back!", {
        position: "top-center",
        autoClose: 2000,
      });

      if (isAdmin) {
        window.location.href = "/record";
      } else {
        window.location.href = "/profile";
      }
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-center",
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
            className="inline-block p-4 rounded-2xl bg-purple-500/10 mb-4"
          >
             <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </motion.div>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-2">AutoEMI</h2>
          <p className="text-purple-200/60 font-medium">Elevate your mobility financing</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200/80 mb-2 ml-1">
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
              <label htmlFor="password" className="block text-sm font-medium text-purple-200/80 mb-2 ml-1">
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
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 flex justify-center items-center disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Sign In"}
            </motion.button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-purple-200/40 text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
              Request Access
            </a>
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 bg-[#0c0c0e] text-purple-200/40 font-medium tracking-widest">Secure Entry</span>
          </div>
        </div>

        <div className="flex justify-center">
            <SignInwithGoogle />
        </div>
      </motion.div>
    </div>
  );
}

export default Login;