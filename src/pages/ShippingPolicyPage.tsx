import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import ReactMarkdown from 'react-markdown';
import { storage } from '../utils/localStorage';
import { motion } from 'motion/react';

export default function ShippingPolicyPage() {
  const [policy, setPolicy] = useState<any>(null);

  useEffect(() => {
    const policies = storage.getPolicies();
    setPolicy(policies.shipping);
  }, []);

  if (!policy) return null;

  return (
    <div className="min-h-screen bg-brand-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="section-padding max-w-4xl mx-auto"
      >
        <SectionHeader title={policy.title} subtitle="Delivery Information" />
        <div className="bg-brand-white p-8 md:p-16 border border-brand-divider shadow-sm">
          <div className="prose prose-neutral max-w-none font-sans text-brand-secondary prose-headings:font-display prose-headings:font-normal prose-headings:text-brand-black prose-a:text-brand-black hover:prose-a:text-brand-black/70 prose-strong:text-brand-black prose-p:leading-relaxed prose-li:leading-relaxed">
            <ReactMarkdown>{policy.content || ''}</ReactMarkdown>
          </div>
          
          {policy.secondaryNote && (
            <div className="mt-16 pt-10 border-t border-brand-divider">
              <p className="text-sm text-brand-secondary italic font-sans opacity-70 leading-relaxed">
                <span className="font-bold uppercase tracking-widest text-[10px] not-italic mr-3 text-brand-black">Note</span>
                {policy.secondaryNote}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
