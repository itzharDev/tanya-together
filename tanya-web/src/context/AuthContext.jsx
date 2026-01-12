import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from "firebase/auth";
import { auth } from '../services/firebase';
import Parse from '../services/parse';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationId, setVerificationId] = useState(null);

  useEffect(() => {
    // Check for existing Parse user session
    const checkUser = async () => {
      try {
        const user = await Parse.User.currentAsync();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error checking current user:", error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const setupRecaptcha = (elementId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const loginWithPhone = async (phoneNumber) => {
    try {
      if (!window.recaptchaVerifier) {
        throw new Error("Recaptcha not initialized. Call setupRecaptcha first.");
      }
      // Format number for Israel if not already formatted (based on Flutter logic hint)
      // The logic in Flutter hardcoded a number? `+972534261676`. waiting for dynamic input.
      // Assuming input is passed correctly.
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setVerificationId(confirmationResult);
      return true;
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  };

  const verifyOtp = async (otp, phoneNumber, userName) => {
    if (!verificationId) throw new Error("No verification ID found");
    
    try {
      const result = await verificationId.confirm(otp);
      const user = result.user; // Firebase User

      // Sync with Parse
      // Logic from AuthCubit: create user with phone as username/password/email(dummy)
      const parseUser = new Parse.User();
      parseUser.set("username", phoneNumber);
      parseUser.set("password", phoneNumber); // WARNING: This pattern from Flutter app is insecure but replicating strictly.
      parseUser.set("email", `${phoneNumber}@socialtanya.com`);
      
      try {
        await parseUser.signUp();
      } catch (error) {
        // If already exists, login
        if (error.code === 202) { // Account already exists
           await Parse.User.logIn(phoneNumber, phoneNumber);
        } else {
             // Try login anyway if signup failed for other reasons or proceed
             await Parse.User.logIn(phoneNumber, phoneNumber);
        }
      }
      
      const currentUser = await Parse.User.current();
      if (userName) {
          currentUser.set('displayName', userName);
          await currentUser.save();
      }
      
      setCurrentUser(currentUser);
      return currentUser;

    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const email = user.email;
      const password = user.uid; // Use Firebase UID as password
      
      console.log('Attempting Google login for:', email);
      
      let parseUser;
      
      // Try to signup first
      try {
        parseUser = new Parse.User();
        parseUser.set("username", email);
        parseUser.set("password", password);
        parseUser.set("email", email);
        parseUser.set('displayName', user.displayName);
        parseUser.set('photoUrl', user.photoURL);
        parseUser.set('googleId', user.uid);
        
        await parseUser.signUp();
        console.log('New user created successfully');
      } catch (signupError) {
        // Signup failed - user probably already exists, try to login
        console.log('Signup failed, attempting login...', signupError.message);
        
        try {
          parseUser = await Parse.User.logIn(email, password);
          console.log('Login successful');
        } catch (loginError) {
          console.error('Login also failed:', loginError);
          
          // If the user exists but password is wrong, they likely signed up via phone
          // Suggest using phone login instead
          alert('המשתמש קיים במערכת.\n\nאנא התחבר/י באמצעות מספר הטלפון שלך.');
          throw new Error('User exists - use phone login');
        }
      }
      
      // Get current user and update profile
      parseUser = await Parse.User.current();
      if (parseUser) {
        parseUser.set('displayName', user.displayName);
        parseUser.set('email', user.email);
        parseUser.set('photoUrl', user.photoURL);
        parseUser.set('googleId', user.uid);
        await parseUser.save();
      }
      
      setCurrentUser(parseUser);
      return parseUser;

    } catch (error) {
      console.error("Error with Google Login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Parse.User.logOut();
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    currentUser,
    loading,
    setupRecaptcha,
    loginWithPhone,
    verifyOtp,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
