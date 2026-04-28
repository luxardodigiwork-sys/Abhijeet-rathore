import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/localStorage';
import { Save, CheckCircle2, RotateCcw, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

// Reusable components for consistent styling
const FormSection = ({ title, children, description, index }: { title: string; children: React.ReactNode; description?: string; index: number }) => (
  <section className="bg-white border border-brand-divider p-8 md:p-16 space-y-12 relative overflow-hidden group">
    {/* Decorative Index Number */}
    <div className="absolute -top-4 -right-4 p-4 opacity-[0.02] pointer-events-none transition-opacity group-hover:opacity-[0.05]">
      <span className="text-[12rem] font-display font-bold leading-none select-none">{index + 1}</span>
    </div>
    
    <div className="space-y-4 relative z-10">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-full bg-brand-bg border border-brand-divider flex items-center justify-center text-[11px] font-bold text-brand-black/40">
          {String(index + 1).padStart(2, '0')}
        </div>
        <h3 className="text-3xl font-display uppercase tracking-tight text-brand-black">{title}</h3>
      </div>
      {description && (
        <p className="text-brand-secondary font-sans text-sm max-w-2xl leading-relaxed opacity-80">
          {description}
        </p>
      )}
      <div className="h-px bg-brand-divider w-full mt-8" />
    </div>
    
    <div className="space-y-12 relative z-10">
      {children}
    </div>
  </section>
);

const FormField = ({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) => (
  <div className="space-y-4">
    <div className="flex flex-col gap-1">
      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-brand-black flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-brand-black rounded-full" />
        {label}
      </label>
      {description && <p className="text-[11px] text-brand-secondary font-sans italic">{description}</p>}
    </div>
    <div className="relative group">
      {children}
      <div className="absolute inset-0 border border-brand-black opacity-0 group-focus-within:opacity-10 pointer-events-none transition-opacity" />
    </div>
  </div>
);

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full border border-brand-divider p-5 font-sans text-base focus:outline-none focus:border-brand-black transition-all bg-brand-bg/30 hover:bg-brand-bg/50 placeholder:text-brand-secondary/30 ${className || ''}`}
  />
);

const TextArea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full border border-brand-divider p-8 font-sans text-base leading-relaxed focus:outline-none focus:border-brand-black transition-all bg-brand-bg/30 hover:bg-brand-bg/50 resize-y min-h-[200px] placeholder:text-brand-secondary/30 ${className || ''}`}
  />
);

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    const fetchPolicies = () => {
      const data = storage.getPolicies();
      setPolicies(data);
      setIsLoading(false);
      
      // Check for last saved in localStorage if we want to be fancy
      const savedTime = localStorage.getItem('luxardo_policies_last_saved');
      if (savedTime) setLastSaved(savedTime);
    };
    fetchPolicies();
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    storage.savePolicies(policies);
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem('luxardo_policies_last_saved', now);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setLastSaved(now);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleReset = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    localStorage.removeItem('luxardo_policies');
    const data = storage.getPolicies();
    setPolicies(data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setIsResetModalOpen(false);
  };

  const updatePolicy = (key: string, field: string, value: string) => {
    setPolicies((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  if (isLoading) return null;

  return (
    <div className="max-w-6xl mx-auto pb-32 px-4 md:px-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-divider -mx-4 px-6 py-8 mb-16 transition-all shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex w-14 h-14 bg-brand-black text-brand-white items-center justify-center rounded-sm shadow-lg shadow-brand-black/10">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-display uppercase tracking-tight text-brand-black">Store Policies</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-brand-secondary text-[10px] uppercase tracking-[0.2em] font-bold">Legal & Operational Framework</p>
                {lastSaved && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-brand-divider" />
                    <p className="text-[10px] text-brand-secondary/60 font-sans italic">Last saved at {lastSaved}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={handleReset}
              className="btn-outline flex-1 md:flex-none flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-3 min-w-[200px]"
            >
              {showSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {isSaving ? 'Processing...' : showSuccess ? 'Changes Saved' : 'Save All Policies'}
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-24"
      >
        <AnimatePresence mode="wait">
          {Object.entries(policies).map(([key, policy]: [string, any], index) => (
            <FormSection 
              key={key} 
              index={index}
              title={policy.title}
              description={`Define the legal terms and operational procedures for your ${policy.title.toLowerCase()}. This content is rendered as Markdown on the storefront.`}
            >
              <div className="space-y-12">
                <FormField 
                  label="Policy Heading" 
                  description="The primary title displayed at the top of the policy page."
                >
                  <Input
                    type="text"
                    value={policy.title}
                    onChange={(e) => updatePolicy(key, 'title', e.target.value)}
                    placeholder="e.g. Shipping & Delivery Policy"
                  />
                </FormField>
                
                <FormField 
                  label="Main Policy Content" 
                  description="Detailed legal text. Supports Markdown formatting for lists, bold text, and links."
                >
                  <TextArea
                    rows={18}
                    value={policy.content}
                    onChange={(e) => updatePolicy(key, 'content', e.target.value)}
                    placeholder="Write the full policy text here..."
                    className="min-h-[500px] font-sans text-lg"
                  />
                </FormField>

                <FormField 
                  label="Secondary Note" 
                  description="An optional brief summary or disclaimer displayed in italics at the bottom of the page."
                >
                  <TextArea
                    rows={4}
                    value={policy.secondaryNote || ''}
                    onChange={(e) => updatePolicy(key, 'secondaryNote', e.target.value)}
                    placeholder="Add a brief summary or a secondary note..."
                    className="min-h-[140px] italic text-brand-secondary"
                  />
                </FormField>
              </div>
            </FormSection>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Footer Save Prompt */}
      <div className="mt-32 p-16 border border-dashed border-brand-divider bg-brand-white/50 flex flex-col items-center text-center space-y-8">
        <div className="space-y-3">
          <h4 className="text-2xl font-display uppercase tracking-tight text-brand-black">Finalize Updates</h4>
          <p className="text-brand-secondary font-sans text-sm max-w-md mx-auto leading-relaxed">
            Please review all sections carefully. Once saved, these policies will be immediately live for all customers.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-3 px-16 py-5 bg-brand-black text-brand-white hover:bg-brand-secondary transition-all text-[11px] font-bold uppercase tracking-[0.25em] disabled:opacity-50 shadow-2xl shadow-brand-black/20 group"
        >
          <Save size={18} className="group-hover:scale-110 transition-transform" />
          {isSaving ? 'Saving Changes...' : 'Confirm & Publish All Policies'}
        </button>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset Policies"
        message="Are you sure you want to reset all policies to defaults? This cannot be undone."
        confirmText="Reset"
        onConfirm={confirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
