import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import bigLogo from '../assets/icons/big_logo.png';
import googleIcon from '../assets/icons/google.png';

export default function Login() {
  const { currentUser, loginWithPhone, verifyOtp, loginWithGoogle, setupRecaptcha } = useAuth();
  const navigate = useNavigate();
  const recaptchaInitialized = useRef(false);
  
  const [step, setStep] = useState('phone'); // phone, otp
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    if (currentUser) {
      navigate('/feed'); // Redirect to feed if logged in
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Only setup reCAPTCHA once when component mounts
    if (!recaptchaInitialized.current) {
      setupRecaptcha('recaptcha-container');
      recaptchaInitialized.current = true;
    }
    
    // Cleanup function
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
        recaptchaInitialized.current = false;
      }
    };
  }, []); // Empty dependency array - run only once

  const handlePhoneSubmit = async () => {
    if (!phoneNumber) {
      alert("אנא הזן מספר טלפון");
      return;
    }
    
    // Basic validation for Israeli phone numbers
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    if (!cleanPhone.startsWith('+') && (cleanPhone.length < 9 || cleanPhone.length > 10)) {
      alert("מספר טלפון לא תקין. אנא הזן מספר תקף");
      return;
    }
    
    setLoading(true);
    try {
      await loginWithPhone(phoneNumber);
      setStep('otp');
    } catch (error) {
      console.error('Phone login error:', error);
      
      let errorMessage = "שגיאה בשליחת הקוד. אנא נסה שוב.";
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "מספר טלפון לא תקין";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) {
      alert("אנא הזן קוד אימות");
      return;
    }
    
    if (otp.length !== 6) {
      alert("קוד האימות חייב להכיל 6 ספרות");
      return;
    }
    
    setLoading(true);
    try {
      await verifyOtp(otp, phoneNumber, name);
      navigate('/feed');
    } catch (error) {
      console.error('OTP verification error:', error);
      
      let errorMessage = "קוד אימות שגוי";
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "קוד אימות שגוי. אנא נסה שוב";
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "הקוד פג תוקף. אנא בקש קוד חדש";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        await loginWithGoogle();
        navigate('/feed');
    } catch (error) {
        alert("Google login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E9F4FF] via-[#E9F4FF] to-[#E9F4FF] flex flex-col items-center p-4 text-right" dir="rtl">
       {/* Gradient Mock: Flutter code has a complex gradient, approximating with solid/linear for now */}
       
       <div className="w-full max-w-md flex flex-col items-center mt-10">
          <img src={bigLogo} alt="Logo" className="w-1/2 mb-4" />
          <h1 className="text-[#04478E] text-xl font-bold mb-6">ברוכים הבאים לתניא המחולק</h1>
          
          <div className="w-full space-y-4">
             <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="מה שמך? (אפשר גם כינוי)"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-right bg-white text-black" 
                />
             </div>
             
             <div className="relative">
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="מספר פלאפון?"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-right bg-white text-black" 
                />
             </div>

             {step === 'otp' && (
                <div className="relative">
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="קוד אימות"
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-right bg-white text-black" 
                    />
                </div>
             )}
             
             <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="px-3 text-gray-500">או</span>
                <div className="flex-grow h-px bg-gray-300"></div>
             </div>

             <button 
                onClick={handleGoogleLogin}
                className="w-full p-3 border border-gray-300 rounded bg-transparent text-black flex items-center justify-center space-x-2 hover:bg-gray-50 transition"
             >
                <img src={googleIcon} alt="G" className="w-5 h-5 ml-2" />
                <span>התחבר/י באמצעות Google</span>
             </button>
             
             <div className="flex-grow"></div> 
             {/* Spacer equivalent */}
             
             <div className="mt-10 mb-4 flex items-center justify-center text-sm text-[#262626]">
                 <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="ml-2 accent-[#04478E]"
                 />
                 <span>קראתי ואני מאשר/ת את </span>
                 <a href="#" className="underline mr-1 color-[#262626]">מדיניות ותנאי השימוש</a>
             </div>

             <button 
               onClick={step === 'phone' ? handlePhoneSubmit : handleOtpSubmit}
               disabled={!isChecked || loading}
               className="w-full p-3 rounded bg-[#027EC5] text-white font-bold text-lg disabled:opacity-50"
             >
                {loading ? 'טוען...' : (step === 'phone' ? 'בואו נתחיל' : 'אמת קוד')}
             </button>
          </div>
          
          <div id="recaptcha-container"></div>
       </div>
    </div>
  );
}
