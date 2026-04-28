import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, Loader2, ArrowLeft, ShieldCheck, KeyRound, Globe, Lock } from 'lucide-react';

export function CustomerAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptchaResolved, setIsCaptchaResolved] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Clear any existing recaptcha instance to reliably render the new normal-sized one
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.error(e);
      }
      window.recaptchaVerifier = undefined;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'customer-recaptcha-container', {
        size: 'normal',
        callback: () => {
          setIsCaptchaResolved(true);
        },
        'expired-callback': () => {
          setError('CAPTCHA expired. Please verify again.');
          setIsCaptchaResolved(false);
          setIsLoading(false);
        }
      });
      window.recaptchaVerifier.render();
    } catch (e) {
      console.error("Recaptcha init error:", e);
    }
    
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined;
        } catch (e) {}
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid global mobile number.');
      return;
    }
    if (!isCaptchaResolved) {
      setError('Please complete the CAPTCHA verification.');
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
      setError(err.message || 'Failed to send OTP. Please check your network.');
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.render().then((widgetId: any) => {
            if ((window as any).grecaptcha) {
              (window as any).grecaptcha.reset(widgetId);
            }
            setIsCaptchaResolved(false);
          });
        } catch (e) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      if (!confirmationResult) throw new Error('Session lost. Please request a new code.');
      
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Update users collection
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          phoneNumber: user.phoneNumber,
          role: 'customer',
          createdAt: serverTimestamp()
        });
      }
      
      navigate(from === '/login' || from === '/register' ? '/' : from, { replace: true });

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check the code and try again.');
      } else {
        setError('Verification failed. Please try again or request a new code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm md:max-w-md mx-auto p-8 bg-brand-bg rounded-3xl md:shadow-2xl md:border border-brand-black/5 relative transition-all duration-300">
      <div className="relative z-10">
        
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-brand-black opacity-80" />
            <span className="font-display text-sm uppercase tracking-widest text-brand-black">Luxardo Customer Portal</span>
          </div>
          
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-black shadow-[0_8px_32px_rgba(0,0,0,0.08)] mb-4 border border-brand-black/5">
             <ShieldCheck size={22} className="stroke-[1.5]" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-display font-medium text-brand-black">Client Login</h2>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-brand-secondary">
              <Lock size={10} className="opacity-70" />
              <p className="text-[9px] font-sans uppercase tracking-[0.2em]">
                Secured with 2-Factor Auth & CAPTCHA
              </p>
            </div>
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
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-black block">
                  Mobile Number
                </label>
                <PhoneInput
                  country={'in'}
                  value={phoneNumber}
                  onChange={(phone) => setPhoneNumber(phone)}
                  enableSearch={true}
                  disableSearchIcon={true}
                  inputProps={{ name: 'phone', required: true, autoFocus: true }}
                  containerClass="!w-full font-sans shadow-sm"
                  inputClass="!w-full !h-[54px] !pl-16 !bg-white !border !border-brand-black/20 focus:!border-brand-black transition-colors !rounded-xl !text-lg !text-brand-black !font-medium"
                  buttonClass="!bg-white !border-0 !border-r !border-brand-black/20 !rounded-l-xl hover:!bg-brand-black/5 !w-12"
                  dropdownClass="!bg-brand-bg !shadow-2xl !border !border-brand-divider !rounded-xl text-sm"
                  searchClass="!bg-brand-black/5 !border-none !rounded-md !px-4 !py-2 !w-full"
                />
                
                <div className="h-4">
                  {phoneNumber.length > 3 ? (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-brand-secondary animate-pulse italic">
                      Confirming number for authentication...
                    </motion.p>
                  ) : (
                    <p className="text-[10px] text-brand-secondary/60">
                      Enter your registered mobile number excluding country code.
                    </p>
                  )}
                </div>
              </div>
              
              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-xs flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100/50">
                  <div className="w-1 h-4 bg-red-500 rounded-full mt-0.5 shrink-0" /> {error}
                </motion.p>
              )}

              <div id="customer-recaptcha-container" className="flex justify-center mb-4 min-h-[78px]"></div>

              <button
                type="submit"
                disabled={isLoading || !isCaptchaResolved}
                className="w-full h-14 px-6 bg-brand-black text-brand-white text-[11px] uppercase tracking-[0.2em] font-bold rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:bg-brand-black/90 transition-all flex justify-between items-center group disabled:opacity-50"
              >
                <span>CONTINUE to Verify</span>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-black">Security Code</label>
                  <button type="button" onClick={() => setStep('phone')} disabled={isLoading} className="text-[10px] text-brand-secondary hover:underline uppercase flex items-center gap-1">
                    <ArrowLeft size={10} /> Change Number
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-secondary w-5 h-5" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    className="w-full bg-white border border-brand-black/20 focus:border-brand-black pl-14 pr-4 h-[54px] text-2xl tracking-[0.4em] font-medium font-sans text-brand-black rounded-xl outline-none shadow-sm"
                    autoFocus
                  />
                </div>
                <div className="h-4">
                     <p className="text-[10px] text-brand-secondary/60">
                      We sent a 6-digit verification code to <span className="font-bold text-brand-black">+{phoneNumber}</span>
                    </p>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-xs flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100/50">
                  <div className="w-1 h-4 bg-red-500 rounded-full mt-0.5 shrink-0" /> {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-14 px-6 bg-brand-black text-brand-white text-[11px] uppercase tracking-[0.2em] font-bold rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:bg-brand-black/90 transition-all flex justify-between items-center group disabled:opacity-50"
              >
                <span>Verify & Login</span>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
