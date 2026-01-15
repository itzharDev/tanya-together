import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBnELeq1-eMVIK2y8vhZ0fBswxtoh7zigk",
  authDomain: "socialtanya-2d181.firebaseapp.com",
  databaseURL: "https://socialtanya-2d181.firebaseio.com",
  projectId: "socialtanya-2d181",
  storageBucket: "socialtanya-2d181.appspot.com",
  messagingSenderId: "217335510648",
  appId: "1:217335510648:web:be672e43cb962fea5adf8d",
  measurementId: "G-DTS5FQYEGM"
};

// reCAPTCHA Enterprise site key for phone authentication
export const RECAPTCHA_SITE_KEY = "6LejgkssAAAAAO699KVOlxl_EnasETBB53-8aSwF";

// Only initialize Firebase in the browser
let app = null;
let auth = null;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };

// Initialize Analytics only if supported (not in SSR)
let analytics = null;
if (typeof window !== 'undefined' && app) {
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
export default app;
