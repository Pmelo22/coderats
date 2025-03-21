//https://coderats-9eaf5.firebaseapp.com/__/auth/handler
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDPlVpp02Bc0VQ0E5UK_hycWt2_lApuKPg",
    authDomain: "coderats-9eaf5.firebaseapp.com",
    projectId: "coderats-9eaf5",
    storageBucket: "coderats-9eaf5.firebasestorage.app",
    messagingSenderId: "169192332632",
    appId: "1:169192332632:web:da9a9f6adf2031e06cd92d",
    measurementId: "G-Z5CY1L8VWV"
  };

const app = initializeApp(firebaseConfig);

// Configura autenticação e o provedor GitHub
export const auth = getAuth(app);
export const githubProvider = new GithubAuthProvider();

// Configura o Firestore
export const db = getFirestore(app);
