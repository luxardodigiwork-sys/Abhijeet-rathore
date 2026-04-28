import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { ArrowRight, Loader2, ArrowLeft, ShieldCheck, KeyRound, AlertTriangle } from 'lucide-react';

export function AdminAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const navigate = useNavigate();
  const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || '+917976672811';

  // Real-time strict validation check
  const isInputValid = `+${phoneNumber}` === ADMIN_PHONE;

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'admin-auth-recaptcha', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          setError('Security verify expired. Please reload.');
          setIsLoading(false);
        }
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // STRICT FRONTEND LOCKDOWN
    if (`+${phoneNumber}` !== ADMIN_PHONE) {
      setError('Access Denied: Unauthorized Admin Number');
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
      setError(err.message || 'Failed to send OTP. Check your network.');
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
      const user = result.user;

      if (user.phoneNumber !== ADMIN_PHONE) {
        await auth.signOut();
        setError('Access Denied: You do not have super administrator privileges.');
        return;
      }
      
      navigate('/admin/dashboard', { replace: true });
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
    <div className="w-full max-w-sm md:max-w-md mx-auto p-8 bg-brand-bg md:bg-white/40 md:backdrop-blur-2xl rounded-3xl md:shadow-2xl md:border border-brand-black/5 relative transition-all duration-300">
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-brand-black/10">
          <div className="w-12 h-12 bg-brand-black rounded-full flex items-center justify-center text-brand-white shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
             <ShieldCheck size={22} className="stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-medium text-brand-black uppercase tracking-widest">Admin Portal</h2>
            <p className="text-[10px] font-sans text-brand-secondary uppercase tracking-[0.2em] mt-1">
              Restricted Secure Entry
            </p>
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
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-black flex items-center justify-between">
                  <span>Authorized Identity Number</span>
                </label>
                <PhoneInput
                  country={'auto'}
                  value={phoneNumber}
                  onChange={(phone) => {
                    setPhoneNumber(phone);
                    // Clear error when user changes input to fix it
                    if (error === 'Access Denied: Unauthorized Admin Number') setError('');
                  }}
                  enableSearch={true}
                  disableSearchIcon={true}
                  inputProps={{ name: 'phone', required: true, autoFocus: true }}
                  containerClass="!w-full font-sans shadow-sm"
                  inputClass="!w-full !h-[54px] !pl-16 !bg-transparent !border !border-brand-black/20 focus:!border-brand-black transition-colors !rounded-xl !text-lg !text-brand-black !font-medium"
                  buttonClass="!bg-transparent !border-0 !border-r !border-brand-black/20 !rounded-l-xl hover:!bg-brand-black/5 !w-12"
                  dropdownClass="!bg-brand-bg !shadow-2xl !border !border-brand-divider !rounded-xl text-sm"
                  searchClass="!bg-brand-black/5 !border-none !rounded-md !px-4 !py-2 !w-full"
                />
              </div>

              {/* Dynamic error display */}
              {!isInputValid && phoneNumber.length > 5 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-xs flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100/50">
                  <AlertTriangle className="w-4 h-4" /> Access Denied: Unauthorized Admin Number
                </motion.p>
              )}
              
              {error && error !== 'Access Denied: Unauthorized Admin Number' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-xs flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100/50">
                  <div className="w-1 h-4 bg-red-500 rounded-full mt-0.5 shrink-0" /> {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading || (!isInputValid && phoneNumber.length > 5)}
                className="w-full h-14 px-6 bg-brand-black text-brand-white text-[11px] uppercase tracking-[0.2em] font-bold rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:bg-brand-black/90 transition-all flex justify-between items-center group disabled:opacity-50 disabled:bg-gray-400"
              >
                <span>Request OTP</span>
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
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-black">Admin Clearance Code</label>
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
                    className="w-full bg-transparent border border-brand-black/20 focus:border-brand-black pl-14 pr-4 h-[54px] text-2xl tracking-[0.4em] font-medium font-sans text-brand-black rounded-xl outline-none"
                    autoFocus
                  />
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
                <span>Verify & Authorize</span>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      <div id="admin-auth-recaptcha"></div>
    </div>
  );
}
