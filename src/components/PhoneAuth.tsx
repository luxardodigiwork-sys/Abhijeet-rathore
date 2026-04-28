import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, Loader2, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';

export function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Initialize reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved automatically
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
          setIsLoading(false);
        }
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid global phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = '+' + phoneNumber;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please check your network and try again.');
      
      // Reset recaptcha if failed so user can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          (window.grecaptcha as any).reset(widgetId);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      if (!confirmationResult) throw new Error('No OTP confirmation found. Please request a new code.');
      
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Ensure user document exists in standard users collection
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          phoneNumber: user.phoneNumber,
          role: 'customer',
          createdAt: serverTimestamp()
        });
      }

      // Role-Based Redirect: Check if the user is in the 'admins' collection
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (adminDoc.exists()) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from === '/login' || from === '/register' ? '/' : from, { replace: true });
      }

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check the code and try again.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-brand-black/5 border border-brand-black/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-brand-secondary/20 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-black rounded-full flex items-center justify-center text-brand-white shadow-lg">
             <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-brand-black">Secure Login</h2>
            <p className="text-xs font-sans text-brand-secondary uppercase tracking-widest">{step === 'phone' ? 'Global Authentication' : 'Verification'}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.form
              key="phone-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary block">
                  Mobile Number
                </label>
                
                {/* Global Phone Input with IP-based Country Detection */}
                <PhoneInput
                  country={'auto'}
                  value={phoneNumber}
                  onChange={(phone) => setPhoneNumber(phone)}
                  enableSearch={true}
                  disableSearchIcon={true}
                  inputProps={{
                    name: 'phone',
                    required: true,
                    autoFocus: true
                  }}
                  containerClass="!w-full font-sans"
                  inputClass="!w-full !h-[50px] !pl-14 !bg-transparent !border-b !border-0 !border-brand-black/20 focus:!border-brand-black transition-colors !rounded-none !text-lg !text-brand-black"
                  buttonClass="!bg-transparent !border-0 !border-b !border-brand-black/20 !rounded-none hover:!bg-brand-black/5"
                  dropdownClass="!bg-brand-bg !shadow-2xl !border !border-brand-divider !rounded-xl !overflow-hidden"
                  searchClass="!bg-brand-black/5 !border-none !mx-2 !my-2 !rounded-lg !px-4 !py-2"
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-sans flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                  <span className="w-1 h-4 bg-red-500 rounded-full" /> {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative px-6 py-4 bg-brand-black text-brand-white text-[11px] uppercase tracking-[0.25em] font-bold rounded-full shadow-xl transition-all duration-300 flex justify-between items-center group disabled:opacity-70 disabled:cursor-not-allowed hover:bg-black/80 hover:shadow-2xl"
              >
                <span>Send Security Code</span>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary flex items-center justify-between">
                  <span>Enter 6-Digit Code</span>
                  <button type="button" onClick={() => setStep('phone')} className="text-brand-black hover:underline flex items-center gap-1">
                    <ArrowLeft size={10} /> Change Number
                  </button>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/50 w-5 h-5" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    className="w-full bg-brand-white/50 border-0 border-b border-brand-black/20 px-12 py-4 text-2xl tracking-[0.5em] focus:outline-none focus:border-brand-black focus:ring-0 transition-colors font-sans text-brand-black placeholder:text-brand-black/20 rounded-none bg-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-sans flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                  <span className="w-1 h-4 bg-red-500 rounded-full" /> {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full relative px-6 py-4 bg-brand-black text-brand-white text-[11px] uppercase tracking-[0.25em] font-bold rounded-full shadow-xl transition-all duration-300 flex justify-between items-center group disabled:opacity-70 disabled:cursor-not-allowed hover:bg-black/80 hover:shadow-2xl"
              >
                <span>Verify & Login</span>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Invisible Recaptcha Container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

// Ensure type augmentation for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: any;
    grecaptcha: any;
  }
}
