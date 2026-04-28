import React, { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { Plus, Minus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Prime Member",
      items: [
        { 
          q: 'What is Prime Member status?', 
          a: 'Prime Member is an exclusive annual program (₹1,499/year) that grants access to our Private Services. This includes bespoke tailoring, priority style consultations, dedicated concierge support, and early access to limited releases.' 
        },
        { 
          q: 'Is bespoke available without Prime Member status?', 
          a: 'No. Our bespoke tailoring services, which involve full customization and multiple fittings, are reserved exclusively for Prime Members to ensure the highest level of attention and service.' 
        },
        { 
          q: 'Are Prime Member fees refundable?', 
          a: 'No. Once a Prime Member status is activated, the fee is strictly non-refundable as the digital and service benefits are unlocked immediately.' 
        },
        { 
          q: 'How does private consultation work?', 
          a: 'Members can book a video or in-person consultation via their dashboard. A master stylist will then guide you through wardrobe planning, fabric selection, and design possibilities for your bespoke commissions.' 
        }
      ]
    },
    {
      category: "Orders & Products",
      items: [
        { 
          q: 'What comes in a standard order?', 
          a: 'A standard order includes our signature ready-to-stitch garment package. This consists of pre-cut fabric panels for your chosen design, all necessary linings, buttons, and trimmings, presented in our premium luxury box.' 
        },
        { 
          q: 'Is stitching included?', 
          a: 'For standard orders, stitching is not included. We provide the ready-to-stitch components for your local tailor to finish. Full bespoke stitching is only available for Prime Members.' 
        },
        { 
          q: 'What is included in the ready-to-stitch box?', 
          a: 'The box contains the main garment fabric, matching lining, high-quality interlining, signature buttons, and a technical stitch-style template to guide your tailor in achieving the Luxardo silhouette.' 
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      items: [
        { 
          q: 'Do you ship internationally?', 
          a: 'Yes, Luxardo ships to over 50 countries globally. International shipping rates and delivery timelines are calculated at checkout based on your specific location.' 
        },
        { 
          q: 'What is the processing time for orders?', 
          a: 'Standard orders are processed within 2-3 business days. Prime Member orders receive priority processing and are typically dispatched within 24 hours.' 
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-black">
      {/* Hero Section */}
      <section className="section-padding bg-brand-black text-brand-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center " />
        <div className="absolute inset-0 bg-brand-black/80" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-12 py-20">
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-white/80">
            Client Support
          </p>
          <h1 className="text-5xl md:text-7xl font-display tracking-wide">FAQ</h1>
          <p className="text-xl md:text-2xl font-sans text-brand-white/80 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about the Luxardo experience.
          </p>
        </div>
      </section>

      <div className="section-padding max-w-4xl mx-auto">
        {/* Search Bar (Visual only) */}
        <div className="relative mb-16">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-secondary" size={20} />
          <input 
            type="text" 
            placeholder="Search for a topic..." 
            className="w-full bg-brand-white border border-brand-divider pl-16 pr-6 py-6 font-sans focus:outline-none focus:border-brand-black transition-colors"
          />
        </div>

        <div className="space-y-20">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="space-y-10">
              <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-secondary border-b border-brand-divider pb-4">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.items.map((faq, itemIndex) => {
                  const index = catIndex * 100 + itemIndex;
                  const isOpen = openIndex === index;
                  
                  return (
                    <div key={itemIndex} className="border border-brand-divider bg-brand-white overflow-hidden transition-all duration-500">
                      <button 
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full flex justify-between items-center p-8 text-left focus:outline-none group"
                      >
                        <h3 className="text-xl font-display pr-8 group-hover:text-brand-secondary transition-colors">{faq.q}</h3>
                        <span className="text-brand-black shrink-0">
                          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </span>
                      </button>
                      <div 
                        className={`px-8 transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="font-sans text-brand-secondary leading-relaxed text-lg">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 bg-brand-white p-16 border border-brand-divider text-center space-y-8">
          <div className="space-y-4">
            <h3 className="text-3xl font-display">Further Assistance</h3>
            <p className="font-sans text-brand-secondary max-w-md mx-auto leading-relaxed">
              If you cannot find the answer you are looking for, our concierge team is available to assist you.
            </p>
          </div>
          <Link to="/contact" className="btn-primary inline-block px-12 py-5">
            CONTACT CONCIERGE
          </Link>
        </div>
      </div>
    </div>
  );
}
