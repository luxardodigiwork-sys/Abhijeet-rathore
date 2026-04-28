import React from 'react';

export const SectionHeader: React.FC<{ title: React.ReactNode; subtitle?: string; dark?: boolean }> = ({ title, subtitle, dark }) => (
  <div className={`mb-16 md:mb-24 text-center ${dark ? 'text-brand-white' : 'text-brand-black'}`}>
    {subtitle && <p className="text-[13px] uppercase tracking-[0.25em] mb-6 text-brand-secondary font-bold">{subtitle}</p>}
    <h2 className="text-5xl md:text-7xl font-display">{title}</h2>
  </div>
);
