import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBnELeq1-eMVIK2y8vhZ0fBswxtoh7zigk",
  authDomain: "socialtanya-2d181.firebaseapp.com",
  databaseURL: "https://socialtanya-2d181.firebaseio.com",
  projectId: "socialtanya-2d181",
  storageBucket: "socialtanya-2d181.appspot.com",
  messagingSenderId: "217335510648",
  appId: "1:217335510648:web:be672e43cb962fea5adf8d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
