import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFkhogWOffcqV04N5tNmnvmu1i94g2aLs",
  authDomain: "filipinoemigrantsdb-prac.firebaseapp.com",
  projectId: "filipinoemigrantsdb-prac",
  storageBucket: "filipinoemigrantsdb-prac.firebasestorage.app",
  messagingSenderId: "573187061905",
  appId: "1:573187061905:web:9a56bffbf784d31c66a730"
};




const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
