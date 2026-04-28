import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  
  const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || '+917976672811';

  useEffect(() => {
    if (isAuthReady && user) {
      if (user.phoneNumber === ADMIN_PHONE || ['super_admin', 'admin'].includes(user.role)) {
        navigate('/admin/dashboard');
      } else if (user.phoneNumber) {
        navigate('/account');
      }
    }
  }, [user, isAuthReady, navigate, ADMIN_PHONE]);

  useEffect(() => {
    // Check if reCAPTCHA URL has changed explicitly or component mounted
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'admin-recaptcha', {
        size: 'invisible',
        callback: () => {
          // Solved
        },
        'expired-callback': () => {
          setError('Security check expired. Please reload.');
          setIsLoading(false);
        }
      });
    }
    
    // Cleanup URL query params if there's an unauthorized error
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'unauthorized') {
      setError('Unauthorized: Your number does not have Admin access.');
      window.history.replaceState({}, document.title, "/admin/login");
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid global mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = '+' + phoneNumber;
      if (formattedPhone !== ADMIN_PHONE) {
         // Optionally you can reject right here or let them OTP check and deny later.
         // Rejecting here is safer from abuse, but the prompt says "after OTP verification, add a strict check"
         // Let's do it after OTP for strict compliance to prompt.
      }
      
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please check your network.');
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha.reset(widgetId);
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
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      if (!confirmationResult) throw new Error('Session lost. Please request a new code.');
      
      const result = await confirmationResult.confirm(otp);
      const authenticatedUser = result.user;

      // STRICT VALIDATION
      if (authenticatedUser.phoneNumber !== ADMIN_PHONE) {
        await auth.signOut();
        window.location.href = '/login-error?reason=unauthorized';
        return;
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check the code and try again.');
      } else {
        setError('Verification failed. Please request a new code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-black/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl p-10 border border-brand-black/10 shadow-2xl rounded-3xl relative z-10 transition-all duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-black rounded-3xl mb-6 shadow-xl shadow-brand-black/20">
            <ShieldCheck size={32} className="text-brand-white stroke-[1.5]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display uppercase tracking-widest text-brand-black font-medium">Luxardo Admin Access</h1>
          <p className="text-brand-secondary text-xs uppercase tracking-[0.2em] mt-3 font-semibold">
            {step === 'phone' ? 'Strict Identity Verification' : 'Final Step Authorized Entry'}
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 p-4 mb-8 text-xs font-sans border border-red-100 rounded-xl flex items-start gap-3">
             <div className="w-1 h-4 bg-red-500 rounded-full mt-0.5 shrink-0" />
            {error}
          </motion.div>
        )}

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
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-black">
                  Authorized Phone Number
                </label>
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
                  containerClass="!w-full font-sans shadow-sm"
                  inputClass="!w-full !h-[54px] !pl-16 !bg-transparent !border !border-brand-black/20 focus:!border-brand-black transition-colors !rounded-xl !text-lg !text-brand-black !font-medium outline-none"
                  buttonClass="!bg-transparent !border-0 !border-r !border-brand-black/20 !rounded-l-xl hover:!bg-brand-black/5 !w-12"
                  dropdownClass="!bg-white !shadow-2xl !border !border-brand-divider !rounded-xl text-sm"
                  searchClass="!bg-brand-black/5 !border-none !mx-2 !my-2 !rounded-md !px-4 !py-2"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 relative px-6 bg-brand-black text-brand-white text-[11px] uppercase tracking-[0.2em] font-bold rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-brand-black/90 transition-all duration-300 flex justify-between items-center group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Request OTP</span>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-black">
                    Security Policy Code
                  </label>
                  <button type="button" onClick={() => setStep('phone')} disabled={isLoading} className="text-[10px] text-brand-secondary hover:text-brand-black hover:underline uppercase tracking-wide flex items-center gap-1 transition-colors">
                    <ArrowLeft size={10} /> Back
                  </button>
                </div>
                
                <div className="relative">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-secondary w-5 h-5" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    className="w-full bg-transparent border border-brand-black/20 focus:border-brand-black pl-14 pr-4 h-[54px] text-2xl tracking-[0.4em] font-medium font-sans text-brand-black placeholder:text-brand-black/20 rounded-xl outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-14 relative px-6 bg-brand-black text-brand-white text-[11px] uppercase tracking-[0.2em] font-bold rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-brand-black/90 transition-all duration-300 flex justify-between items-center group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Authorize & Login</span>
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
      <div id="admin-recaptcha"></div>
    </div>
  );
}
