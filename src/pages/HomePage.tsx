import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate, useInView, useMotionValueEvent } from 'motion/react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { Globe, Sparkles, PenTool, BadgeCheck, Package } from 'lucide-react';
import { Country, Language, Product } from '../types';
import { storage } from '../utils/localStorage';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_SITE_CONTENT } from '../constants/homeContent';

const HERO_SLIDES = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1594938298598-718890ce8c53?q=80&w=2148&auto=format&fit=crop',
    heading: 'Modern Ethnic Menswear',
    subtext: 'Premium fabrics. Structured silhouettes.',
    cta: 'Shop Now',
    link: '/collections'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2148&auto=format&fit=crop',
    heading: 'Constructed With Intent',
    subtext: 'A philosophy of slow luxury and disciplined craftsmanship.',
    cta: 'Discover Our Story',
    link: '/our-story'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1605007493699-af65834f8a00?q=80&w=2148&auto=format&fit=crop',
    heading: 'Designed for Every Occasion',
    subtext: 'From wedding festivities to formal excellence.',
    cta: 'View Collections',
    link: '/collections'
  }
];


function AnimatedCounter({ value, suffix = "", start = 0, duration = 2.5 }: { value: number, suffix?: string, start?: number, duration?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(start);
  const [display, setDisplay] = useState(start + suffix);

  useMotionValueEvent(motionValue, "change", (latest) => {
    const rounded = Math.round(latest);
    if (suffix === "k+") {
      setDisplay(rounded >= 1000 ? "1k+" : rounded.toString());
    } else {
      setDisplay(rounded + suffix);
    }
  });

  useEffect(() => {
    if (inView) {
      animate(motionValue, value, { duration, ease: "easeOut" });
    }
  }, [inView, motionValue, value, duration]);

  return <span ref={ref}>{display}</span>;
}

export default function HomePage() {
  const { selectedCountry } = useOutletContext<{ selectedCountry: Country | null; selectedLanguage: Language }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCollectionSlide, setCurrentCollectionSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const [isCollectionHovered, setIsCollectionHovered] = useState(false);
  const [activeStoryStep, setActiveStoryStep] = useState(0);
  const [wholesaleLoading, setWholesaleLoading] = useState(false);
  const [wholesaleSuccess, setWholesaleSuccess] = useState(false);

  const handleWholesaleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    setWholesaleLoading(true);
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
      message: formData.get('message'),
      image: imageBase64,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      storage.addWholesaleInquiry(data);
      setWholesaleSuccess(true);
      e.currentTarget.reset();
      setTimeout(() => setWholesaleSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setWholesaleLoading(false);
    }
  };

  const storyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: storyScrollY } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"]
  });

  const siteContent = storage.getSiteContent();
  const heroSlides = siteContent.homepage.hero.slides || HERO_SLIDES;
  const storySteps = siteContent.homepage.storySteps || DEFAULT_SITE_CONTENT.homepage.storySteps;

  useMotionValueEvent(storyScrollY, "change", (latest) => {
    const step = Math.min(Math.floor(latest * storySteps.length), storySteps.length - 1);
    if (step !== activeStoryStep) {
      setActiveStoryStep(step);
    }
  });

  const statsY = useTransform(storyScrollY, [0, 1], ["50px", "-50px"]);

  useEffect(() => {
    if (isHovered || siteContent.homepage.hero.mediaType === 'video') return; // Don't auto-slide if video is enabled
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, heroSlides.length, siteContent.homepage.hero.mediaType]);

  useEffect(() => {
    if (isCollectionHovered) return;
    const timer = setInterval(() => {
      setCurrentCollectionSlide((prev) => (prev + 1) % (siteContent.homepage.collections.items?.length || 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [isCollectionHovered, siteContent.homepage.collections.items]);

  return (
    <div className="bg-brand-bg text-brand-black">
      {/* 1. Hero (Video or Image Slider) */}
      <section 
        className="relative h-[70vh] md:h-[90vh] overflow-hidden bg-brand-black"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {siteContent.homepage.hero.mediaType === 'video' && siteContent.homepage.hero.videoUrl ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <video
              className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 object-cover"
              src={siteContent.homepage.hero.videoUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={heroSlides[currentSlide].id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={heroSlides[currentSlide].imageUrl} 
                alt={heroSlides[currentSlide].heading} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/40 via-brand-black/20 to-brand-black/80 z-20 pointer-events-none" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-white text-center px-4 md:px-6 z-30 pointer-events-none">
          <div className="w-full max-w-4xl pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${siteContent.homepage.hero.mediaType === 'video' ? 'video' : currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <h1 className="text-4xl md:text-8xl font-display tracking-tight leading-[1.1] mb-4 md:mb-6 font-light">
                  {heroSlides[currentSlide].heading}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {siteContent.homepage.hero.mediaType !== 'video' && (
          <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 z-40">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="group p-2"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className={`h-[1px] transition-all duration-500 ${
                  currentSlide === index ? 'w-8 md:w-12 bg-brand-white' : 'w-4 md:w-6 bg-brand-white/30 group-hover:bg-brand-white/60'
                }`} />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 1.1 Work Categories Banner */}
      <div className="w-full bg-brand-black border-t border-brand-white/10 py-4 md:py-6">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:gap-12 text-center">
            <span className="text-[9px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-brand-white/80 whitespace-nowrap">Ready to Stitch Fabric</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-brand-white/30"></span>
            <span className="text-[9px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-brand-white/80 whitespace-nowrap">Full Customization</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-brand-white/30"></span>
            <span className="text-[9px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-brand-white/80 whitespace-nowrap">Available for Bulk Quantity</span>
          </div>
        </div>
      </div>

      {/* 2. Collections Showcase (Ultra Premium Editorial Overlap) */}
      <section className="bg-[#F8F8F8] py-16 md:py-40 overflow-hidden border-t border-brand-black/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-12">
          <div className="mb-16 md:mb-32 text-center flex flex-col items-center">
            <span className="w-[1px] h-12 md:h-16 bg-brand-black/20 mb-6 md:mb-8"></span>
            <p className="text-[10px] uppercase tracking-[0.5em] font-bold text-brand-secondary mb-4 md:mb-6">{siteContent.homepage.collections.label}</p>
            <h2 className="text-4xl md:text-7xl font-display tracking-tight text-brand-black">{siteContent.homepage.collections.heading}</h2>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-12 gap-6">
            {siteContent.homepage.collections.items?.map((collection: any, index: number) => {
              let colSpan = "col-span-4";
              let heightClass = "h-[60vh]";
              
              if (index < 3) {
                colSpan = "col-span-4";
                heightClass = "h-[60vh]";
              } else {
                colSpan = "col-span-3";
                heightClass = "h-[50vh]";
              }

              return (
                <Link 
                  key={`desktop-${collection.id}`} 
                  to={collection.link}
                  className={`group relative bg-brand-white p-3 border border-brand-black/10 shadow-sm ${heightClass} ${colSpan}`}
                >
                  <div className="relative w-full h-full overflow-hidden bg-brand-black">
                    <motion.img
                      initial={{ scale: 1.1 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      viewport={{ once: true }}
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent pointer-events-none" />
                    
                    <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-white/70 mb-3 block">
                            0{index + 1} / Collection
                          </span>
                          <h3 className="text-2xl lg:text-4xl font-display text-brand-white">
                            {collection.title}
                          </h3>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-brand-white/30 flex items-center justify-center group-hover:bg-brand-white group-hover:text-brand-black transition-all duration-500 shrink-0">
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile Auto-slider */}
          <div className="md:hidden flex overflow-hidden relative w-full -mx-4 px-4">
            <motion.div 
              className="flex gap-4 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            >
              {[...(siteContent.homepage.collections.items || []), ...(siteContent.homepage.collections.items || [])].map((collection: any, index: number) => (
                <Link 
                  key={`mobile-${index}`} 
                  to={collection.link}
                  className="group relative bg-brand-white p-2 border border-brand-black/10 shadow-sm w-[260px] h-[35vh] flex-shrink-0"
                >
                  <div className="relative w-full h-full overflow-hidden bg-brand-black">
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent pointer-events-none" />
                    
                    <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-brand-white/70 mb-1.5 block">
                            0{(index % (siteContent.homepage.collections.items?.length || 1)) + 1} / Collection
                          </span>
                          <h3 className="text-xl font-display text-brand-white">
                            {collection.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 1.5. Our Threads. Our Story. (3D Scrubbing Experience) */}
      <section ref={storyRef} className="bg-brand-white relative h-[300vh]">
        {/* Sticky Container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">
          {/* Desktop Layout */}
          <div className="hidden md:flex max-w-[1400px] mx-auto w-full h-full items-center px-6 md:px-12">
            {/* Left: Sketch Image */}
            <div className="w-1/2 h-full flex items-center justify-center p-12">
              <div className="w-full max-w-md aspect-[3/4] relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeStoryStep}
                    src={storySteps[activeStoryStep].image}
                    initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                {/* Decorative Sketch Frame */}
                <div className="absolute inset-0 border border-brand-black/5 pointer-events-none"></div>
              </div>
            </div>
            
            {/* Right: Crossfading Text */}
            <div className="w-1/2 relative h-[60vh] flex items-center pl-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStoryStep}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute w-full pr-12"
                >
                  {/* Large Background Number */}
                  <div className="absolute -left-8 -top-20 text-[180px] lg:text-[220px] font-display text-brand-black/[0.03] font-bold pointer-events-none select-none leading-none z-0">
                    {activeStoryStep === 0 ? 'EST' : `0${activeStoryStep}`}
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="w-12 h-[1px] bg-brand-secondary/50"></span>
                      <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary">
                        {storySteps[activeStoryStep].subtitle}
                      </span>
                    </div>
                    <h3 className="text-4xl lg:text-6xl font-display tracking-tight text-brand-black mb-8 leading-[1.1]">
                      {activeStoryStep === 0 ? (
                        <span className="font-bold text-brand-black">Our Story.</span>
                      ) : (
                        storySteps[activeStoryStep].title
                      )}
                    </h3>
                    <p className="text-lg text-brand-secondary/80 font-light leading-relaxed max-w-md">
                      {storySteps[activeStoryStep].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden w-full h-full flex flex-col relative bg-brand-white pt-16">
            {/* Top: Sketch Image */}
            <div className="h-[40vh] w-full relative px-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeStoryStep}
                  src={storySteps[activeStoryStep].image}
                  initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover p-4"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>
            
            {/* Bottom: Crossfading Text */}
            <div className="h-[60vh] w-full relative px-6 pt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStoryStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute w-[calc(100%-3rem)]"
                >
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary mb-3 block">
                    {storySteps[activeStoryStep].subtitle}
                  </span>
                  <h3 className="text-3xl font-display tracking-tight text-brand-black mb-3">
                    {activeStoryStep === 0 ? (
                      <span className="font-bold text-brand-black">Our Story.</span>
                    ) : (
                      storySteps[activeStoryStep].title
                    )}
                  </h3>
                  <p className="text-sm text-brand-secondary/80 font-light leading-relaxed mb-4">
                    {storySteps[activeStoryStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-white pb-16 md:pb-24 pt-8 md:pt-12 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Scrolling Stats Section */}
          <motion.div 
            style={{ y: statsY }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-8 pt-8 md:pt-12 border-t border-brand-black/10"
          >
            <div className="text-center flex flex-col items-center">
              <span className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-brand-black mb-2 md:mb-4">
                <AnimatedCounter value={2015} start={2000} duration={2} />
              </span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-brand-secondary">Year Established</span>
            </div>
            <div className="text-center flex flex-col items-center">
              <span className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-brand-black mb-2 md:mb-4">
                <AnimatedCounter value={500} suffix="+" duration={2.5} />
              </span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-brand-secondary">Employees</span>
            </div>
            <div className="text-center flex flex-col items-center">
              <span className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-brand-black mb-2 md:mb-4">
                <AnimatedCounter value={26} suffix="+" duration={2} />
              </span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-brand-secondary">States Covered</span>
            </div>
            <div className="text-center flex flex-col items-center">
              <span className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-brand-black mb-2 md:mb-4">
                <AnimatedCounter value={3} suffix="+" duration={1.5} />
              </span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-brand-secondary">Countries Reached</span>
            </div>
            <div className="text-center flex flex-col items-center col-span-2 md:col-span-1 lg:col-span-1">
              <span className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-brand-black mb-2 md:mb-4">
                <AnimatedCounter value={700} suffix="+" duration={2.5} />
              </span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-brand-secondary">Partner</span>
            </div>
          </motion.div>
        </div>
      </section>


      {/* 5. Luxardo experience (direct vs prime) */}
      <section className="py-16 md:py-32 bg-brand-bg border-y border-brand-divider">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-20 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary">The Experience</p>
            <h2 className="text-3xl md:text-5xl font-display tracking-tight">Choose Your Journey</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-brand-divider">
            <div className="p-8 md:p-20 border-b md:border-b-0 md:border-r border-brand-divider bg-brand-white">
              <h3 className="text-2xl md:text-3xl font-display mb-4 md:mb-6">Direct Collection</h3>
              <p className="text-sm md:text-base text-brand-secondary font-light leading-relaxed mb-8 md:mb-12">
                Access our curated seasonal collections. Ready to wear, crafted with the same attention to detail and premium fabrics that define the Luxardo name.
              </p>
              <ul className="space-y-3 md:space-y-4 mb-8 md:mb-12 text-xs md:text-sm font-sans text-brand-black">
                <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-brand-black rounded-full" /> Standard sizing</li>
                <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-brand-black rounded-full" /> Seasonal collections</li>
                <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-brand-black rounded-full" /> Global shipping</li>
              </ul>
              <Link to="/collections" className="inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-brand-black border-b border-brand-black pb-1 hover:pr-4 transition-all duration-500">
                Shop Collections
              </Link>
            </div>
            
            <div className="p-8 md:p-20 bg-brand-black text-brand-white">
              <h3 className="text-2xl md:text-3xl font-display mb-4 md:mb-6 text-brand-white">Prime Membership</h3>
              <p className="text-sm md:text-base text-brand-white/70 font-light leading-relaxed mb-8 md:mb-12">
                The ultimate bespoke experience. Gain access to our private fabric library, priority tailoring, and dedicated style consultations.
              </p>
              <ul className="space-y-3 md:space-y-4 mb-8 md:mb-12 text-xs md:text-sm font-sans text-brand-white/90">
                <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-brand-white rounded-full" /> Bespoke measurements</li>
                <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-brand-white rounded-full" /> Private fabric library access</li>
                <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-brand-white rounded-full" /> Dedicated style consultant</li>
                <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-brand-white rounded-full" /> Priority production</li>
              </ul>
              <Link to="/prime-membership" className="inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-brand-white border-b border-brand-white pb-1 hover:pr-4 transition-all duration-500">
                Discover Prime
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Partner with us (Improved & Moved) */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-brand-black">
        <motion.div 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute inset-0"
        >
          <img 
            src={siteContent.homepage.partnership.img || "https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=2000&auto=format&fit=crop"} 
            alt="Partner with us" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/90 to-brand-black/40" />
        </motion.div>
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <span className="w-8 md:w-12 h-[1px] bg-brand-white/50"></span>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-white/80">B2B & Wholesale</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-display tracking-tight text-brand-white mb-6 md:mb-8 leading-[1.1]">
              Elevate Your <br />
              <span className="italic font-light text-brand-white/70">Retail Experience.</span>
            </h2>
            <p className="text-sm md:text-lg text-brand-white/70 font-light leading-relaxed mb-8 md:mb-12 max-w-lg">
              Join our exclusive network of retail partners. Offer your clients the unparalleled craftsmanship and timeless elegance of Luxardo.
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-brand-white/5 backdrop-blur-md border border-brand-white/10 p-8 md:p-12">
            <h3 className="text-2xl font-display text-brand-white mb-8">Apply for Partnership</h3>
            <form onSubmit={handleWholesaleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-brand-white/70 font-bold">Full Name</label>
                  <input required name="full_name" type="text" className="w-full bg-transparent border-b border-brand-white/20 pb-2 text-brand-white focus:border-brand-white focus:outline-none transition-colors rounded-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-brand-white/70 font-bold">Company Name</label>
                  <input required name="company_name" type="text" className="w-full bg-transparent border-b border-brand-white/20 pb-2 text-brand-white focus:border-brand-white focus:outline-none transition-colors rounded-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-brand-white/70 font-bold">Email</label>
                  <input required name="email" type="email" className="w-full bg-transparent border-b border-brand-white/20 pb-2 text-brand-white focus:border-brand-white focus:outline-none transition-colors rounded-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-brand-white/70 font-bold">Phone</label>
                  <input required name="phone" type="tel" className="w-full bg-transparent border-b border-brand-white/20 pb-2 text-brand-white focus:border-brand-white focus:outline-none transition-colors rounded-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-brand-white/70 font-bold">Message</label>
                <textarea required name="message" rows={3} className="w-full bg-transparent border-b border-brand-white/20 pb-2 text-brand-white focus:border-brand-white focus:outline-none transition-colors resize-none rounded-none"></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-brand-white/70 font-bold">Storefront / Business Image</label>
                <input required name="image" type="file" accept="image/*" className="w-full bg-transparent border-b border-brand-white/20 pb-2 text-brand-white focus:border-brand-white focus:outline-none transition-colors rounded-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-brand-white file:text-brand-black hover:file:bg-brand-white/90 cursor-pointer" />
              </div>
              <button 
                type="submit" 
                disabled={wholesaleLoading}
                className="btn-primary w-full py-4 text-[10px] uppercase tracking-[0.3em] font-bold"
              >
                {wholesaleLoading ? 'Submitting...' : 'Submit Application'}
              </button>
              {wholesaleSuccess && (
                <p className="text-emerald-400 text-sm text-center mt-4">Application received successfully. We will contact you soon.</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 7. Vision & Mission (Structured & Compact Design) */}
      <section className="py-12 md:py-24 bg-brand-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-12">
          {/* Architectural Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 border border-brand-black/20 relative">
            
            {/* Decorative corner markers to emphasize "structure" */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-brand-black"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-brand-black"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-brand-black"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-brand-black"></div>

            {/* Vision */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="p-6 md:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-brand-black/20 bg-[#FAFAFA] flex flex-col justify-center relative overflow-hidden"
            >
              {/* Subtle background grid pattern for "architectural precision" */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <span className="w-6 h-[1px] bg-brand-black"></span>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-black">
                    {siteContent.homepage.vision?.label || 'The Vision'}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-display tracking-tight text-brand-black mb-4 md:mb-6 leading-[1.1]">
                  {siteContent.homepage.vision?.heading || 'A Return to Discipline & Structure'}
                </h2>
                <p className="text-sm md:text-base text-brand-secondary/80 font-light leading-relaxed">
                  {siteContent.homepage.vision?.text || 'We envision a world where menswear is defined by architectural precision and sartorial integrity. A return to the disciplined lines and refined structures that define the modern gentleman.'}
                </p>
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-6 md:p-12 lg:p-16 bg-white flex flex-col justify-center"
            >
              <div className="flex items-center gap-4 mb-4 md:mb-6">
                <span className="w-6 h-[1px] bg-brand-black"></span>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-black">
                  {siteContent.homepage.mission?.label || 'The Mission'}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-display tracking-tight text-brand-black mb-4 md:mb-6 leading-[1.1]">
                {siteContent.homepage.mission?.heading || 'Crafting the Premium Experience'}
              </h2>
              <p className="text-sm md:text-base text-brand-secondary/80 font-light leading-relaxed mb-6 md:mb-8">
                {siteContent.homepage.mission?.text || 'Our mission is to create a premium menswear experience through the meticulous selection of fabrics, elegant design discipline, careful presentation, and thoughtful service.'}
              </p>
              
              {siteContent.homepage.mission?.points && siteContent.homepage.mission.points.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-6 md:pt-8 border-t border-brand-black/10">
                  {siteContent.homepage.mission.points.map((point: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[9px] font-mono text-brand-black/40">0{idx + 1}</span>
                        <h4 className="text-[10px] md:text-xs font-bold tracking-widest text-brand-black uppercase">{point.title}</h4>
                      </div>
                      <p className="text-[11px] md:text-xs text-brand-secondary/70 font-light leading-relaxed">
                        {point.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}

