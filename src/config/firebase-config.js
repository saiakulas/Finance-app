// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKACHo3_MuTeSvQV_ApSkS0rspZE_nO9k",
  authDomain: "finance-records-f58ae.firebaseapp.com",
  projectId: "finance-records-f58ae",
  storageBucket: "finance-records-f58ae.appspot.com",
  messagingSenderId: "908134612134",
  appId: "1:908134612134:web:1ab2da8b646e7934b6c867",
  measurementId: "G-6700LZ4W60"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app); // Exporting Auth instance
export const db = getFirestore(app); // Exporting Firestore instance
export default app;
