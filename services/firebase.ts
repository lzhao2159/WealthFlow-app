// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0ra_pqsLrWHyF9NgJ4BWIupBkvRbhm8o",
  authDomain: "fir-1-a35fb.firebaseapp.com",
  projectId: "fir-1-a35fb",
  storageBucket: "fir-1-a35fb.firebasestorage.app",
  messagingSenderId: "1016764678940",
  appId: "1:1016764678940:web:d885f601528e2ff3b630d9",
  measurementId: "G-4P5KQRJYQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);