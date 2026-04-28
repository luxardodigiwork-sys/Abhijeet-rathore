import React from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from './SectionHeader';

const processSteps = [
  {
    title: 'Imported Fabric Selection',
    text: 'Every Luxardo garment begins with carefully selected imported fabrics chosen for texture, durability, and refined appearance.',
    img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Design Development',
    text: 'Our design studio develops modern ethnic silhouettes that balance tradition and contemporary structure.',
    img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Expert Refinement',
    text: 'Designs are meticulously refined to ensure the perfect fit and aesthetic balance before moving to production.',
    img: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Production Execution',
    text: 'Experienced production teams translate refined designs into structured garments with disciplined tailoring techniques.',
    img: 'https://images.unsplash.com/photo-1605007493699-af65834f8a00?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Finishing Inspection',
    text: 'Every garment passes through careful inspection to ensure finishing standards meet Luxardo expectations.',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Presentation Packaging',
    text: 'Each piece is carefully packed in our signature presentation box, reflecting our commitment to luxury at every touchpoint.',
    img: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Final Dispatch Check',
    text: 'A final verification ensures every detail is perfect before the garment is dispatched to its new home.',
    img: 'https://images.unsplash.com/photo-1556740734-7f96267b118a?q=80&w=1000&auto=format&fit=crop',
  }
];

export const LuxardoProcess: React.FC = () => {
  return (
    <section className="section-padding bg-brand-white">
      <SectionHeader 
        title="The Luxardo Process" 
        subtitle="From fabric selection to final presentation, every Luxardo garment follows a refined process designed to maintain quality, structure, and modern ethnic elegance." 
      />
      
      <div className="max-w-[1400px] mx-auto space-y-32 md:space-y-48 mt-24">
        {processSteps.map((step, index) => {
          const isEven = index % 2 !== 0; // 0-indexed, so 1, 3, 5 are "even" blocks (Text Left, Image Right)
          
          return (
            <div 
              key={step.title} 
              className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
            >
              {/* Image Block */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full md:w-1/2"
              >
                <div className="aspect-[4/5] overflow-hidden bg-brand-divider relative group">
                  <img 
                    src={step.img} 
                    alt={step.title} 
                    className="w-full h-full object-cover -[20%] transition-transform duration-[2s] ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>

              {/* Text Block */}
              <motion.div 
                initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full md:w-1/2 space-y-6 text-center md:text-left"
              >
                <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-brand-secondary">
                  Step 0{index + 1}
                </p>
                <h3 className="text-4xl md:text-5xl font-display text-brand-black">
                  {step.title}
                </h3>
                <p className="text-lg md:text-xl font-sans text-brand-secondary leading-relaxed max-w-md mx-auto md:mx-0">
                  {step.text}
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
