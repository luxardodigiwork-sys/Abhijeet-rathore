import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { storage } from '../utils/localStorage';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const siteContent = storage.getSiteContent();
  const [content, setContent] = useState(siteContent.contact);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const updatedSiteContent = storage.getSiteContent();
    setContent(updatedSiteContent.contact);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = {
      id: Date.now(),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    storage.addContactMessage(data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 pb-20 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-brand-white border border-brand-divider p-12 md:p-20 text-center space-y-12">
          <div className="w-20 h-20 bg-brand-black text-brand-white rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display">Message Sent</h2>
            <p className="font-sans text-brand-secondary text-lg leading-relaxed">
              Our concierge team has received your message and will respond within 24 hours.
            </p>
          </div>
          <button onClick={() => setSubmitted(false)} className="text-[11px] uppercase tracking-widest font-bold text-brand-black hover:opacity-60 transition-opacity">
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-black">
      {/* Hero Section */}
      <section className="section-padding bg-brand-black text-brand-white text-center relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center " 
          style={{ backgroundImage: `url(${content.hero.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-brand-black/80" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-12 py-20">
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-white/80">
            {content.hero.subtitle}
          </p>
          <h1 className="text-5xl md:text-7xl font-display tracking-wide">{content.hero.title}</h1>
          <p className="text-xl md:text-2xl font-sans text-brand-white/80 max-w-2xl mx-auto leading-relaxed">
            {content.hero.description}
          </p>
        </div>
      </section>

      <div className="section-padding max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div className="space-y-16">
          <div className="space-y-8">
            <SectionHeader title={content.details.heading} subtitle={content.details.subtitle} />
            <p className="text-xl font-sans text-brand-secondary leading-relaxed">
              {content.details.text}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-black">
                <Mail size={20} />
                <h4 className="text-[11px] uppercase tracking-widest font-bold">Email</h4>
              </div>
              <div className="space-y-2 font-sans text-brand-secondary text-sm">
                <p>General Inquiries: <a href={`mailto:${content.details.email}`} className="text-brand-black hover:underline">{content.details.email}</a></p>
                <p>Member Services: <a href={`mailto:${content.details.email}`} className="text-brand-black hover:underline">{content.details.email}</a></p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-black">
                <Phone size={20} />
                <h4 className="text-[11px] uppercase tracking-widest font-bold">Phone</h4>
              </div>
              <div className="space-y-2 font-sans text-brand-secondary text-sm">
                <p>Global Concierge: <a href={`tel:${content.details.phone}`} className="text-brand-black hover:underline">{content.details.phone}</a></p>
                <p>WhatsApp: <a href={`https://wa.me/${content.details.phone.replace(/\s+/g, '')}`} className="text-brand-black hover:underline">{content.details.phone}</a></p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-black">
                <MapPin size={20} />
                <h4 className="text-[11px] uppercase tracking-widest font-bold">Maison Address</h4>
              </div>
              <div className="space-y-2 font-sans text-brand-secondary text-sm">
                <p>{content.details.address}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-black">
                <Instagram size={20} />
                <h4 className="text-[11px] uppercase tracking-widest font-bold">Social</h4>
              </div>
              <div className="flex gap-6">
                {content.socials?.instagram && (
                  <a href={content.socials?.instagram} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:text-brand-black transition-colors">
                    <Instagram size={20} />
                  </a>
                )}
                {content.socials?.facebook && (
                  <a href={content.socials?.facebook} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:text-brand-black transition-colors">
                    <Facebook size={20} />
                  </a>
                )}
                {content.socials?.linkedin && (
                  <a href={content.socials?.linkedin} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:text-brand-black transition-colors">
                    <Linkedin size={20} />
                  </a>
                )}
                {content.socials?.twitter && (
                  <a href={content.socials?.twitter} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:text-brand-black transition-colors">
                    <ArrowRight size={20} className="rotate-[-45deg]" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="bg-brand-white p-12 border border-brand-divider">
            <h4 className="text-[11px] uppercase tracking-widest font-bold mb-6">{content.hours.heading}</h4>
            <div className="grid grid-cols-2 gap-8 text-sm font-sans text-brand-secondary">
              <div className="space-y-2">
                <p className="text-brand-black font-bold">{content.hours.weekdays.label}</p>
                <p>{content.hours.weekdays.time}</p>
              </div>
              <div className="space-y-2">
                <p className="text-brand-black font-bold">{content.hours.saturday.label}</p>
                <p>{content.hours.saturday.time}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-white p-8 md:p-16 border border-brand-divider">
          <div className="space-y-4 mb-12">
            <h3 className="text-3xl font-display">Send a Message</h3>
            <p className="text-sm font-sans text-brand-secondary">Please complete the form below and our team will contact you shortly.</p>
          </div>

          {user ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">First Name</label>
                  <input name="firstName" type="text" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors" placeholder="Alexander" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Last Name</label>
                  <input name="lastName" type="text" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors" placeholder="Wright" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Email Address</label>
                <input name="email" type="email" required className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors" placeholder="alexander@luxury.com" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Subject</label>
                <select name="subject" required defaultValue="" className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors appearance-none text-brand-secondary">
                  <option value="" disabled>Select Subject</option>
                  <option value="order">Order Inquiry</option>
                  <option value="membership">Prime Member</option>
                  <option value="bespoke">Bespoke Tailoring</option>
                  <option value="other">General Question</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Message</label>
                <textarea name="message" required rows={5} className="w-full bg-transparent border-b border-brand-divider py-4 font-sans focus:outline-none focus:border-brand-black transition-colors resize-none" placeholder="How can we assist you today?"></textarea>
              </div>

              <button type="submit" className="btn-primary w-full py-5 flex items-center justify-center gap-4">
                SEND MESSAGE <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div className="text-center p-12 bg-brand-bg border border-brand-divider space-y-6">
              <h4 className="text-2xl font-display">Authentication Required</h4>
              <p className="font-sans text-brand-secondary">Please log in to your account to send us a message.</p>
              <button onClick={() => navigate('/login', { state: { from: location } })} className="btn-primary inline-block px-12">
                LOG IN TO CONTINUE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
