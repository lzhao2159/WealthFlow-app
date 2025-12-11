import * as firebase from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { AppState } from "../types";

// Firebase configuration
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
export const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper functions
export const initializeUserData = async (uid: string, email: string): Promise<AppState> => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as AppState;
    } else {
      const newUserState: AppState = {
        user: {
          name: email.split('@')[0],
          email: email,
        },
        accounts: [],
        transactions: [],
        stocks: []
      };
      await setDoc(userDocRef, newUserState);
      return newUserState;
    }
  } catch (error) {
    console.error("Error initializing user data:", error);
    return {
      user: { name: email.split('@')[0], email },
      accounts: [],
      transactions: [],
      stocks: []
    };
  }
};

export const saveStateToFirebase = async (uid: string, state: Partial<AppState>) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, state, { merge: true });
  } catch (error) {
    console.error("Error saving state to Firebase:", error);
  }
};