import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvI2kgBxK1I_5gY9LP9q8EGzqW5i9lU9A",
  authDomain: "mmuuq-51259.firebaseapp.com",
  projectId: "mmuuq-51259",
  storageBucket: "mmuuq-51259.appspot.com", 
  messagingSenderId: "764559411354",
  appId: "1:764559411354:web:311629a108357e12baf723",
  measurementId: "G-EFWK59Q6TN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  try {
    const docRef = doc(db, "timetables", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("SUCCESS: Database connected and data exists.");
      console.log("Data size:", Object.keys(docSnap.data().items || {}).length, "items.");
    } else {
      console.log("SUCCESS: Database connected but document 'timetables/main' does not exist.");
    }
  } catch (error) {
    console.error("ERROR: Failed to connect to database or insufficient permissions.");
    console.error(error);
  }
}

testConnection();
