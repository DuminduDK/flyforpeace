import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, Timestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUYiJA2nbUj8HOwG7GBZFBAzoSxrPsh18",
  authDomain: "flyforpeace-1c5f4.firebaseapp.com",
  projectId: "flyforpeace-1c5f4",
  storageBucket: "flyforpeace-1c5f4.firebasestorage.app",
  messagingSenderId: "840883005521",
  appId: "1:840883005521:web:73e73cc73f46a3fbaf3070"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, collection, addDoc, getDocs, orderBy, query, Timestamp, doc, updateDoc, deleteDoc, signInWithEmailAndPassword, onAuthStateChanged, signOut };
