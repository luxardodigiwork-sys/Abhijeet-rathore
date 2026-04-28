import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { motion } from 'motion/react';
import { Globe, ArrowRight, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { storage } from '../utils/localStorage';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function WholesalePage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const siteContent = storage.getSiteContent();
  const [content, setContent] = useState(siteContent.wholesale);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updatedSiteContent = storage.getSiteContent();
    setContent(updatedSiteContent.wholesale);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    let imageBase64 = '';
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      try {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } catch (err) {
        console.error('Failed to read image', err);
      }
    }

    const data = {
      id: Date.now(),
      full_name: formData.get('full_name'),
      company_name: formData.get('company_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      country: formData.get('country'),
      city: formData.get('city'),
      retail_type: formData.get('retail_type'),
      monthly_volume: formData.get('monthly_volume'),
      message: formData.get('message'),
      image: imageBase64,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      storage.addWholesaleInquiry(data);
      
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('A network error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 pb-20 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-brand-white border border-brand-divider p-12 md:p-20 text-center space-y-12">
          <div className="w-20 h-20 bg-brand-black text-brand-white rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display">Application Received</h2>
            <p className="font-sans text-brand-secondary text-lg leading-relaxed">
              Thank you for your interest in partnering with Luxardo. Our global partnership team will review your application and contact you within 3-5 business days.
            </p>
          </div>
          <button onClick={() => setSubmitted(false)} className="text-[11px] uppercase tracking-widest font-bold text-brand-black hover:opacity-60 transition-opacity">
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-black">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-brand-black">
        <div className="absolute inset-0 opacity-30">
          <img 
            src={content.hero.imageUrl} 
            alt="Luxardo Global Partnerships" 
            className="w-full h-full object-cover "
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/40 via-brand-black/60 to-brand-black" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] uppercase tracking-[0.4em] font-bold text-brand-white/70"
          >
            {content.hero.subtitle}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-display tracking-wide text-brand-white"
          >
            {content.hero.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl md:text-2xl font-sans text-brand-white/80 max-w-2xl mx-auto leading-relaxed font-light"
          >
            {content.hero.description}
          </motion.p>
        </div>
      </section>

      {/* Premium Trust Section */}
      <section className="py-32 bg-brand-white border-b border-brand-divider">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary">Established Reach</p>
                <h2 className="text-4xl md:text-5xl font-display tracking-tight leading-tight">
                  {content.trust.heading}
                </h2>
              </div>
              <p className="text-xl font-sans text-brand-secondary leading-relaxed font-light">
                {content.trust.text}
              </p>
              
              <div className="grid grid-cols-2 gap-12 pt-8 border-t border-brand-divider">
                <div className="space-y-4">
                  <p className="text-4xl font-display font-light">{content.trust.stats.cities}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Cities</p>
                </div>
                <div className="space-y-4">
                  <p className="text-4xl font-display font-light">{content.trust.stats.states}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">States</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="aspect-[4/5] bg-brand-bg relative overflow-hidden"
            >
              <img 
                src={content.trust.imageUrl} 
                alt="Luxardo Scale" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Partnership Standard */}
      <section className="py-32 bg-brand-bg">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary">{content.standards.label}</p>
            <h2 className="text-4xl md:text-5xl font-display tracking-tight">{content.standards.heading}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-20 max-w-7xl mx-auto">
            {content.standards.items.map((item: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-display border-b border-brand-divider pb-4">{item.title}</h3>
                <p className="font-sans text-brand-secondary leading-relaxed font-light">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Selective Collaboration */}
      <section className="py-32 bg-brand-black text-brand-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-white/50">{content.collaboration.label}</p>
                <h2 className="text-4xl md:text-5xl font-display tracking-tight leading-tight">
                  {content.collaboration.heading.split(' ').map((word: string, i: number) => (
                    <React.Fragment key={i}>
                      {i === content.collaboration.heading.split(' ').length - 1 ? <span className="italic text-brand-white/70">{word}</span> : word + ' '}
                    </React.Fragment>
                  ))}
                </h2>
              </div>
              <p className="text-xl font-sans text-brand-white/80 leading-relaxed font-light">
                {content.collaboration.text}
              </p>
              
              <div className="pt-8 space-y-6">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-white/50">We Partner With</p>
                <ul className="space-y-4 font-sans font-light text-brand-white/90">
                  {content.collaboration.partners.map((partner: string, i: number) => (
                    <li key={i} className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-brand-white/50 rounded-full" />
                      {partner}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="aspect-[3/4] bg-brand-white/5 relative overflow-hidden"
            >
              <img 
                src={content.collaboration.imageUrl} 
                alt="Premium Retail Space" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-32 bg-brand-white border-b border-brand-divider">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary">{content.benefits.label}</p>
            <h2 className="text-4xl md:text-5xl font-display tracking-tight">{content.benefits.heading}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-20 max-w-7xl mx-auto">
            {content.benefits.items.map((item: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-display border-b border-brand-divider pb-4">{item.title}</h3>
                <p className="font-sans text-brand-secondary leading-relaxed font-light">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-32 bg-brand-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-6 mb-20">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary">Initiate a Partnership</p>
            <h3 className="text-4xl md:text-5xl font-display tracking-tight">Wholesale Inquiry</h3>
            <p className="text-lg font-sans text-brand-secondary font-light max-w-2xl mx-auto">
              Selected partnership inquiries are reviewed by our team. We evaluate each application with strict discretion to ensure alignment with our brand standards.
            </p>
          </div>

          {user ? (
            <form onSubmit={handleSubmit} className="space-y-12">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-sans">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Full Name</label>
                  <input name="full_name" type="text" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors" placeholder="Alexander Wright" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Company / Boutique / Maison Name</label>
                  <input name="company_name" type="text" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors" placeholder="Luxury Retail Group" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Email Address</label>
                  <input name="email" type="email" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors" placeholder="partnerships@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Phone Number</label>
                  <input name="phone" type="tel" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Country</label>
                  <input name="country" type="text" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors" placeholder="United Kingdom" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">City</label>
                  <input name="city" type="text" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors" placeholder="London" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Retail Type</label>
                  <select name="retail_type" required defaultValue="" className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors appearance-none rounded-none">
                    <option value="" disabled>Select Retail Type</option>
                    <option value="boutique">Independent Boutique</option>
                    <option value="multi-brand">Multi-Brand Luxury Store</option>
                    <option value="department">Department Store</option>
                    <option value="online">Premium E-Commerce</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Monthly Order Volume (Est.)</label>
                  <select name="monthly_volume" required defaultValue="" className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors appearance-none rounded-none">
                    <option value="" disabled>Select Volume</option>
                    <option value="under-50">Under 50 units</option>
                    <option value="50-200">50 - 200 units</option>
                    <option value="200-500">200 - 500 units</option>
                    <option value="500+">500+ units</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Message / Partnership Notes</label>
                <textarea name="message" required rows={4} className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors resize-none" placeholder="Tell us about your retail space, current brand portfolio, and vision for Luxardo..."></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Storefront / Business Image</label>
                <input name="image" type="file" accept="image/*" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-brand-black file:text-brand-white hover:file:bg-brand-black/90 cursor-pointer" />
              </div>

              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full py-6 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em] font-bold disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Submit Inquiry'} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center p-12 bg-brand-bg border border-brand-divider space-y-6">
              <h4 className="text-2xl font-display">Authentication Required</h4>
              <p className="font-sans text-brand-secondary">Please log in to your account to submit a wholesale inquiry.</p>
              <button onClick={() => navigate('/login', { state: { from: location } })} className="btn-primary inline-block px-12">
                LOG IN TO CONTINUE
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

