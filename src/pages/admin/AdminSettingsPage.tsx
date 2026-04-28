import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, ArrowRight, AlertCircle, Truck, Save, CreditCard, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { storage } from '../../utils/localStorage';
import { BackendSettings } from '../../types';
import { ALL_COUNTRIES } from '../../countries';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [backendSettings, setBackendSettings] = useState<BackendSettings | null>(null);
  const [isSavingCourier, setIsSavingCourier] = useState(false);
  const [courierMessage, setCourierMessage] = useState('');

  const [razorpaySettings, setRazorpaySettings] = useState({ keyId: '', secretKey: '', mode: 'test' });
  const [isSavingRazorpay, setIsSavingRazorpay] = useState(false);
  const [razorpayMessage, setRazorpayMessage] = useState('');

  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const [visibilityMessage, setVisibilityMessage] = useState('');

  useEffect(() => {
    setBackendSettings(storage.getBackendSettings());
    fetchRazorpaySettings();
  }, []);

  const fetchRazorpaySettings = async () => {
    try {
      const res = await fetch('/api/settings/razorpay_settings');
      const data = await res.json();
      if (data.value) {
        setRazorpaySettings(data.value);
      }
    } catch (err) {
      console.error('Failed to fetch Razorpay settings', err);
    }
  };

  const handleSaveRazorpaySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRazorpay(true);
    setRazorpayMessage('');
    try {
      const res = await fetch('/api/settings/razorpay_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: razorpaySettings })
      });
      if (res.ok) {
        setRazorpayMessage('Razorpay settings saved successfully.');
        setTimeout(() => setRazorpayMessage(''), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save Razorpay settings');
    } finally {
      setIsSavingRazorpay(false);
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (newEmail === user?.email) {
      setError('New email must be different from the current email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/request-email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate email update.');

      setMessage(data.message + (data.mockCode ? ` (Mock Code: ${data.mockCode})` : ''));
      setStep('verify');
    } catch (err: any) {
      console.error('Email update error:', err);
      setError(err.message || 'Failed to initiate email update.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify email change.');

      setMessage('Email updated successfully. Please log out and log in again with your new email.');
      setStep('request');
      setNewEmail('');
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to verify email change.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourierSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backendSettings) return;
    
    setIsSavingCourier(true);
    setCourierMessage('');
    
    try {
      storage.saveBackendSettings(backendSettings);
      setCourierMessage('Courier settings saved successfully.');
      setTimeout(() => setCourierMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save courier settings:', err);
    } finally {
      setIsSavingCourier(false);
    }
  };

  const handleSaveVisibilitySettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backendSettings) return;
    
    setIsSavingVisibility(true);
    setVisibilityMessage('');
    
    try {
      storage.saveBackendSettings(backendSettings);
      setVisibilityMessage('Visibility settings saved successfully.');
      setTimeout(() => setVisibilityMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save visibility settings:', err);
    } finally {
      setIsSavingVisibility(false);
    }
  };

  const handleCountryToggle = (countryCode: string) => {
    if (!backendSettings) return;
    const current = backendSettings.visibleCountries || [];
    const updated = current.includes(countryCode)
      ? current.filter(c => c !== countryCode)
      : [...current, countryCode];
    setBackendSettings({ ...backendSettings, visibleCountries: updated });
  };

  const handleSelectAllCountries = () => {
    if (!backendSettings) return;
    const allCodes = ALL_COUNTRIES.map(c => c.code);
    setBackendSettings({ ...backendSettings, visibleCountries: allCodes });
  };

  const handleDeselectAllCountries = () => {
    if (!backendSettings) return;
    setBackendSettings({ ...backendSettings, visibleCountries: [] });
  };

  const updateCourierSetting = (key: string, value: any) => {
    if (!backendSettings) return;
    
    setBackendSettings({
      ...backendSettings,
      courierIntegration: {
        ...backendSettings.courierIntegration,
        [key]: value
      } as any
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div>
        <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">Admin Settings</h1>
        <p className="text-brand-secondary font-sans mt-2 text-sm">Manage your master account credentials and integrations</p>
      </div>

      <div className="bg-white border border-brand-divider p-8">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="text-brand-black" size={24} />
          <h2 className="text-lg font-display uppercase tracking-widest">Account Security</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 mb-6 text-sm border border-red-100 flex items-start gap-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 p-4 mb-6 text-sm border border-green-100 flex items-start gap-3">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <div className="space-y-8 max-w-md">
          <div>
            <label className="block text-xs uppercase tracking-wider text-brand-secondary mb-2">
              Current Admin Email
            </label>
            <div className="p-4 bg-brand-bg border border-brand-divider text-brand-black font-mono text-sm">
              {user?.email || 'Loading...'}
            </div>
          </div>

          {step === 'request' ? (
            <form onSubmit={handleRequestEmailChange} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                  New Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={16} />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full border border-brand-divider p-4 pl-12 focus:outline-none focus:border-brand-black transition-colors"
                    placeholder="new-admin@luxardo.com"
                    required
                  />
                </div>
                <p className="text-xs text-brand-secondary mt-2">
                  A verification link will be sent to the new email. The change will only take effect after verification.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !newEmail} 
                className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? 'INITIATING...' : 'REQUEST EMAIL CHANGE'} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailChange} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full border border-brand-divider p-4 focus:outline-none focus:border-brand-black transition-colors text-center tracking-widest"
                  placeholder="123456"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !code} 
                className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? 'VERIFYING...' : 'VERIFY & UPDATE EMAIL'} <ArrowRight size={18} />
              </button>
              <button 
                type="button" 
                onClick={() => setStep('request')}
                className="w-full py-4 text-sm text-brand-secondary hover:text-brand-black transition-colors"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Website Visibility Section */}
      {backendSettings && (
        <div className="bg-white border border-brand-divider p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Globe className="text-brand-black" size={24} />
              <h2 className="text-lg font-display uppercase tracking-widest">Website Visibility</h2>
            </div>
            {visibilityMessage && (
              <span className="text-green-600 text-sm font-medium flex items-center gap-2">
                <ShieldCheck size={16} /> {visibilityMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveVisibilitySettings} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-brand-bg border border-brand-divider">
              <div>
                <h3 className="font-bold text-brand-black">Allowed Countries</h3>
                <p className="text-sm text-brand-secondary">Select the countries where you operate and where the website options (like shipping and billing) will be available.</p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSelectAllCountries}
                  className="px-4 py-2 bg-white/50 backdrop-blur-md border border-brand-divider text-brand-black text-xs uppercase tracking-wider font-medium hover:bg-white/80 transition-all duration-300 active:scale-95 shadow-sm rounded-xl"
                >
                  Select All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-4 border border-brand-divider">
              {ALL_COUNTRIES.map((country) => {
                const isSelected = (backendSettings.visibleCountries || []).includes(country.code);
                return (
                  <label key={country.code} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 flex items-center justify-center border transition-colors ${isSelected ? 'bg-brand-black border-brand-black' : 'border-gray-300 group-hover:border-brand-black'}`}>
                      {isSelected && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <span className={`text-sm ${isSelected ? 'text-brand-black font-medium' : 'text-brand-secondary'}`}>
                      {country.name}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => handleCountryToggle(country.code)}
                    />
                  </label>
                );
              })}
            </div>

            <div className="pt-4 border-t border-brand-divider flex justify-end">
              <button 
                type="submit" 
                disabled={isSavingVisibility} 
                className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {isSavingVisibility ? 'SAVING...' : 'SAVE VISIBILITY'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Razorpay Integration Section */}
      <div className="bg-white border border-brand-divider p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="text-brand-black" size={24} />
            <h2 className="text-lg font-display uppercase tracking-widest">Razorpay Integration</h2>
          </div>
          {razorpayMessage && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-2">
              <ShieldCheck size={16} /> {razorpayMessage}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveRazorpaySettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                Mode
              </label>
              <select
                value={razorpaySettings.mode}
                onChange={(e) => setRazorpaySettings({ ...razorpaySettings, mode: e.target.value })}
                className="w-full border border-brand-divider p-3 focus:outline-none focus:border-brand-black transition-colors bg-white"
              >
                <option value="test">Test Mode</option>
                <option value="live">Live Mode</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                Key ID
              </label>
              <input
                type="text"
                value={razorpaySettings.keyId}
                onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keyId: e.target.value })}
                className="w-full border border-brand-divider p-3 focus:outline-none focus:border-brand-black transition-colors"
                placeholder="rzp_test_..."
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                Secret Key
              </label>
              <input
                type="password"
                value={razorpaySettings.secretKey}
                onChange={(e) => setRazorpaySettings({ ...razorpaySettings, secretKey: e.target.value })}
                className="w-full border border-brand-divider p-3 focus:outline-none focus:border-brand-black transition-colors"
                placeholder="Enter Secret Key"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-brand-divider flex justify-end">
            <button 
              type="submit" 
              disabled={isSavingRazorpay} 
              className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {isSavingRazorpay ? 'SAVING...' : 'SAVE RAZORPAY SETTINGS'}
            </button>
          </div>
        </form>
      </div>

      {/* Courier Integration Section */}
      {backendSettings && (
        <div className="bg-white border border-brand-divider p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Truck className="text-brand-black" size={24} />
              <h2 className="text-lg font-display uppercase tracking-widest">Courier Integration</h2>
            </div>
            {courierMessage && (
              <span className="text-green-600 text-sm font-medium flex items-center gap-2">
                <ShieldCheck size={16} /> {courierMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCourierSettings} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-brand-bg border border-brand-divider">
              <div>
                <h3 className="font-bold text-brand-black">Enable Courier Integration</h3>
                <p className="text-sm text-brand-secondary">Activate automated shipping and tracking via third-party courier APIs.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={backendSettings.courierIntegration?.enabled || false}
                  onChange={(e) => updateCourierSetting('enabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-black"></div>
              </label>
            </div>

            {backendSettings.courierIntegration?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                    Provider
                  </label>
                  <select
                    value={backendSettings.courierIntegration.provider}
                    onChange={(e) => updateCourierSetting('provider', e.target.value)}
                    className="w-full border border-brand-divider p-3 focus:outline-none focus:border-brand-black transition-colors bg-white"
                  >
                    <option value="DTDC">DTDC</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Shiprocket">Shiprocket</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                    Environment
                  </label>
                  <select
                    value={backendSettings.courierIntegration.environment}
                    onChange={(e) => updateCourierSetting('environment', e.target.value)}
                    className="w-full border border-brand-divider p-3 focus:outline-none focus:border-brand-black transition-colors bg-white"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production (Live)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                    API Key / Token
                  </label>
                  <input
                    type="password"
                    value={backendSettings.courierIntegration.apiKey}
                    onChange={(e) => updateCourierSetting('apiKey', e.target.value)}
                    className="w-full border border-brand-divider p-3 focus:outline-none focus:border-brand-black transition-colors"
                    placeholder="Enter API Key"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                    Client ID / Account ID
                  </label>
                  <input
                    type="text"
                    value={backendSettings.courierIntegration.clientId}
                    onChange={(e) => updateCourierSetting('clientId', e.target.value)}
                    className="w-full border border-brand-divider p-3 focus:outline-none focus:border-brand-black transition-colors"
                    placeholder="Enter Client ID"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-brand-secondary">
                    Origin Pincode
                  </label>
                  <input
                    type="text"
                    value={backendSettings.courierIntegration.originPincode}
                    onChange={(e) => updateCourierSetting('originPincode', e.target.value)}
                    className="w-full border border-brand-divider p-3 focus:outline-none focus:border-brand-black transition-colors"
                    placeholder="e.g. 400001"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-brand-divider flex justify-end">
              <button 
                type="submit" 
                disabled={isSavingCourier} 
                className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {isSavingCourier ? 'SAVING...' : 'SAVE COURIER SETTINGS'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
