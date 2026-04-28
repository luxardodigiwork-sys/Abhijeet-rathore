import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, Shield, Settings } from 'lucide-react';
import { storage } from '../../utils/localStorage';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export default function AdminPrimeContentPage() {
  const [content, setContent] = useState(storage.getPrimeContent());
  const [globalSettings, setGlobalSettings] = useState(storage.getPrimeGlobalSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    setContent(storage.getPrimeContent());
    setGlobalSettings(storage.getPrimeGlobalSettings());
  }, []);

  const handleSave = () => {
    storage.savePrimeContent(content);
    storage.savePrimeGlobalSettings(globalSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    storage.resetPrimeContent();
    setContent(storage.getPrimeContent());
    // Also reset global settings to default
    const defaultGlobal = { isLive: true, offlineMessage: 'Prime Member access is currently unavailable. Please check back soon.' };
    storage.savePrimeGlobalSettings(defaultGlobal);
    setGlobalSettings(defaultGlobal);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setIsResetModalOpen(false);
  };

  const updateBenefit = (index: number, field: 'title' | 'desc' | 'details', value: string) => {
    const newBenefits = [...content.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setContent({ ...content, benefits: newBenefits });
  };

  const addBenefit = () => {
    setContent({
      ...content,
      benefits: [...content.benefits, { title: 'New Benefit', desc: 'Description of the new benefit.', details: 'Detailed explanation of the benefit.' }]
    });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = content.benefits.filter((_, i) => i !== index);
    setContent({ ...content, benefits: newBenefits });
  };

  const toggleSetting = (key: keyof typeof content.settings) => {
    setContent({
      ...content,
      settings: {
        ...content.settings,
        [key]: !content.settings[key]
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-display mb-2">Prime Membership Content</h1>
          <p className="text-brand-secondary font-sans">Customize the public Prime Membership page and global service availability.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 border border-brand-divider hover:border-brand-black transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-brand-black text-brand-white hover:bg-brand-secondary transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <Save size={16} /> {isSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {/* Global Settings */}
        <div className="bg-white p-8 border border-brand-divider space-y-8">
          <div className="flex items-center gap-3 border-b border-brand-divider pb-4">
            <Settings size={20} />
            <h3 className="text-xl font-display">Global Service Settings</h3>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-brand-black text-brand-white rounded-sm mb-6">
            <div>
              <h4 className="text-lg font-display">Prime Membership Page Status</h4>
              <p className="text-xs text-brand-white/70 font-sans mt-1">Turn off to hide the entire page and show "Coming Soon"</p>
            </div>
            <button
              onClick={() => setGlobalSettings({ ...globalSettings, isLive: !globalSettings.isLive })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                globalSettings.isLive ? 'bg-green-500' : 'bg-brand-secondary'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  globalSettings.isLive ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'salesEnabled', label: 'Prime Member Sales Enabled', desc: 'Allow new customers to purchase membership' },
              { id: 'bespokeEnabled', label: 'Bespoke Requests Enabled', desc: 'Global toggle for custom tailoring service' },
              { id: 'consultationEnabled', label: 'Style Consultation Enabled', desc: 'Global toggle for expert styling sessions' },
              { id: 'fabricLibraryEnabled', label: 'Fabric Library Enabled', desc: 'Global toggle for exclusive fabric access' },
              { id: 'prioritySupportEnabled', label: 'Priority Support Enabled', desc: 'Global toggle for dedicated concierge' }
            ].map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 bg-brand-bg border border-brand-divider rounded-sm">
                <div>
                  <h4 className="text-sm font-medium text-brand-black">{setting.label}</h4>
                  <p className="text-[10px] text-brand-secondary uppercase tracking-wider">{setting.desc}</p>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id as any)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    content.settings?.[setting.id as keyof typeof content.settings] 
                      ? 'bg-brand-black' 
                      : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      content.settings?.[setting.id as keyof typeof content.settings] 
                        ? 'translate-x-6' 
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white p-8 border border-brand-divider space-y-8">
          <h3 className="text-xl font-display border-b border-brand-divider pb-4">Hero Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Heading</label>
              <input 
                type="text" 
                value={content.hero.heading}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, heading: e.target.value } })}
                className="w-full border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">CTA Label</label>
              <input 
                type="text" 
                value={content.hero.ctaLabel}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaLabel: e.target.value } })}
                className="w-full border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Subheading</label>
              <textarea 
                rows={2}
                value={content.hero.subheading}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, subheading: e.target.value } })}
                className="w-full border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Price (₹)</label>
              <input 
                type="number" 
                value={content.hero.price}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, price: parseInt(e.target.value) || 0 } })}
                className="w-full border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Hero Image URL</label>
              <input 
                type="text" 
                value={content.hero.imageUrl}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, imageUrl: e.target.value } })}
                className="w-full border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
          </div>
        </div>

        {/* Member Welcome */}
        <div className="bg-white p-8 border border-brand-divider space-y-8">
          <h3 className="text-xl font-display border-b border-brand-divider pb-4">Member Welcome Section</h3>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Welcome Text (for active members)</label>
            <textarea 
              rows={3}
              value={content.welcomeText}
              onChange={(e) => setContent({ ...content, welcomeText: e.target.value })}
              className="w-full border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black"
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white p-8 border border-brand-divider space-y-8">
          <div className="flex justify-between items-center border-b border-brand-divider pb-4">
            <h3 className="text-xl font-display">Membership Benefits</h3>
            <button 
              onClick={addBenefit}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-black hover:opacity-60 transition-opacity"
            >
              <Plus size={14} /> Add Benefit
            </button>
          </div>
          
          <div className="space-y-6">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="p-6 border border-brand-divider bg-brand-bg relative group">
                <button 
                  onClick={() => removeBenefit(index)}
                  className="absolute top-4 right-4 text-brand-secondary hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Benefit Title</label>
                    <input 
                      type="text" 
                      value={benefit.title}
                      onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                      className="w-full border border-brand-divider p-3 font-sans focus:outline-none focus:border-brand-black bg-white"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Short Description</label>
                    <input 
                      type="text" 
                      value={benefit.desc}
                      onChange={(e) => updateBenefit(index, 'desc', e.target.value)}
                      className="w-full border border-brand-divider p-3 font-sans focus:outline-none focus:border-brand-black bg-white"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Detailed Description (Shown on click)</label>
                    <textarea 
                      rows={3}
                      value={benefit.details || ''}
                      onChange={(e) => updateBenefit(index, 'details', e.target.value)}
                      className="w-full border border-brand-divider p-3 font-sans focus:outline-none focus:border-brand-black bg-white resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting Note */}
        <div className="bg-white p-8 border border-brand-divider space-y-8">
          <h3 className="text-xl font-display border-b border-brand-divider pb-4">Supporting Note</h3>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Note Text</label>
            <textarea 
              rows={3}
              value={content.supportingNote}
              onChange={(e) => setContent({ ...content, supportingNote: e.target.value })}
              className="w-full border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black"
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset Prime Content"
        message="Are you sure you want to reset to default content? This action cannot be undone."
        confirmText="Reset"
        onConfirm={confirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
