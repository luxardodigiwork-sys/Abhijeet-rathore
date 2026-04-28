import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Plus, Trash2, Link as LinkIcon, Phone, Mail, MapPin, Layout as LayoutIcon, BookOpen, Scissors, Globe, MessageSquare, Info, RotateCcw, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../utils/localStorage';
import { ImageUploadInput } from '../../components/admin/ImageUploadInput';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

type TabType = 'homepage' | 'ourStory' | 'craftsmanship' | 'wholesale' | 'contact' | 'footer';

// Reusable components for consistent styling
const FormSection = ({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) => (
  <section className="bg-white border border-brand-divider p-8 md:p-12 space-y-8">
    <div className="space-y-2">
      <h3 className="text-2xl font-display uppercase tracking-tight">{title}</h3>
      {description && <p className="text-brand-secondary font-sans text-sm">{description}</p>}
      <div className="h-px bg-brand-divider w-full mt-4" />
    </div>
    <div className="space-y-8">
      {children}
    </div>
  </section>
);

const FormField = ({ label, children, fullWidth = false }: { label: string; children: React.ReactNode; fullWidth?: boolean }) => (
  <div className={fullWidth ? "w-full" : ""}>
    <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-secondary mb-3">{label}</label>
    {children}
  </div>
);

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black transition-all bg-transparent hover:border-brand-secondary/50 ${className || ''}`}
  />
);

const TextArea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full border border-brand-divider p-4 font-sans focus:outline-none focus:border-brand-black transition-all bg-transparent hover:border-brand-secondary/50 resize-none ${className || ''}`}
  />
);

const ImagePreview = ({ url, label }: { url: string; label: string }) => (
  <div className="space-y-3">
    <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-secondary">{label}</label>
    <div className="aspect-video border border-brand-divider overflow-hidden bg-brand-bg relative group">
      {url ? (
        <>
          <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/10 transition-colors" />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-secondary/30 gap-2">
          <ImageIcon size={40} strokeWidth={1} />
          <span className="text-[10px] uppercase tracking-widest font-bold">No Image Provided</span>
        </div>
      )}
    </div>
  </div>
);

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('homepage');
  const [content, setContent] = useState(storage.getSiteContent());
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    setContent(storage.getSiteContent());
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      storage.saveSiteContent(content);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      console.error('Error saving content:', error);
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        alert('Storage limit exceeded. The uploaded images are too large. Please use smaller images or image URLs.');
      } else {
        alert('Failed to save content.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    storage.resetSiteContent();
    const defaultContent = storage.getSiteContent();
    setContent(defaultContent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setIsResetModalOpen(false);
  };

  const updateContent = (section: keyof typeof content, field: string, value: any) => {
    setContent({
      ...content,
      [section]: {
        ...(content[section] as any),
        [field]: value
      }
    });
  };

  const updateNestedContent = (section: keyof typeof content, subSection: string, field: string, value: any) => {
    const sectionData = content[section] as any;
    setContent({
      ...content,
      [section]: {
        ...sectionData,
        [subSection]: {
          ...sectionData[subSection],
          [field]: value
        }
      }
    });
  };

  const updateSlideImage = (index: number, value: string) => {
    const newSlides = [...(content.homepage.hero.slides || [])];
    if (newSlides[index]) {
      newSlides[index] = { ...newSlides[index], imageUrl: value };
    }
    updateNestedContent('homepage', 'hero', 'slides', newSlides);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'homepage', label: 'Homepage', icon: <LayoutIcon size={18} /> },
    { id: 'ourStory', label: 'Brand Story', icon: <BookOpen size={18} /> },
    { id: 'craftsmanship', label: 'Craftsmanship', icon: <Scissors size={18} /> },
    { id: 'wholesale', label: 'Wholesale', icon: <Globe size={18} /> },
    { id: 'contact', label: 'Contact', icon: <MessageSquare size={18} /> },
    { id: 'footer', label: 'Footer', icon: <Info size={18} /> },
  ];

  const renderHomepageTab = () => (
    <motion.div 
      key="homepage"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <FormSection title="Hero Section" description="The first thing visitors see. High impact imagery and clear calls to action.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Media Type">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="heroMediaType"
                    value="image"
                    checked={content.homepage.hero.mediaType !== 'video'}
                    onChange={() => updateNestedContent('homepage', 'hero', 'mediaType', 'image')}
                    className="accent-brand-black"
                  />
                  <span className="text-sm font-sans">Image</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="heroMediaType"
                    value="video"
                    checked={content.homepage.hero.mediaType === 'video'}
                    onChange={() => updateNestedContent('homepage', 'hero', 'mediaType', 'video')}
                    className="accent-brand-black"
                  />
                  <span className="text-sm font-sans">Video</span>
                </label>
              </div>
            </FormField>
            {content.homepage.hero.mediaType === 'video' && (
              <FormField label="Video URL (MP4)">
                <Input
                  type="text"
                  placeholder="https://example.com/video.mp4"
                  value={content.homepage.hero.videoUrl || ''}
                  onChange={(e) => updateNestedContent('homepage', 'hero', 'videoUrl', e.target.value)}
                />
              </FormField>
            )}
            <FormField label="Heading (Title)">
              <Input
                type="text"
                value={content.homepage.hero.title}
                onChange={(e) => updateNestedContent('homepage', 'hero', 'title', e.target.value)}
              />
            </FormField>
            <FormField label="Subheading">
              <TextArea
                rows={3}
                value={content.homepage.hero.subtitle}
                onChange={(e) => updateNestedContent('homepage', 'hero', 'subtitle', e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Primary CTA Text">
                <Input
                  type="text"
                  value={content.homepage.hero.primaryCtaText}
                  onChange={(e) => updateNestedContent('homepage', 'hero', 'primaryCtaText', e.target.value)}
                />
              </FormField>
              <FormField label="Primary CTA Link">
                <Input
                  type="text"
                  value={content.homepage.hero.primaryCtaLink}
                  onChange={(e) => updateNestedContent('homepage', 'hero', 'primaryCtaLink', e.target.value)}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Secondary CTA Text">
                <Input
                  type="text"
                  value={content.homepage.hero.secondaryCtaText}
                  onChange={(e) => updateNestedContent('homepage', 'hero', 'secondaryCtaText', e.target.value)}
                />
              </FormField>
              <FormField label="Secondary CTA Link">
                <Input
                  type="text"
                  value={content.homepage.hero.secondaryCtaLink}
                  onChange={(e) => updateNestedContent('homepage', 'hero', 'secondaryCtaLink', e.target.value)}
                />
              </FormField>
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-black">Hero Slides Images</h4>
              <p className="text-xs text-brand-secondary">Manage images for the hero slider.</p>
            </div>
            
            {(content.homepage.hero.slides || []).map((slide: any, index: number) => (
              <div key={index} className="p-4 border border-brand-divider space-y-4 relative">
                <button
                  type="button"
                  onClick={() => {
                    const newSlides = [...(content.homepage.hero.slides || [])];
                    newSlides.splice(index, 1);
                    updateNestedContent('homepage', 'hero', 'slides', newSlides);
                  }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest"
                >
                  Remove
                </button>
                <FormField label={`Slide ${index + 1} Image URL`}>
                  <ImageUploadInput
                    value={slide.imageUrl || ''}
                    onChange={(val) => updateSlideImage(index, val)}
                  />
                </FormField>
                <ImagePreview url={slide.imageUrl || ''} label={`Slide ${index + 1} Preview`} />
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                const newSlides = [...(content.homepage.hero.slides || [])];
                newSlides.push({
                  id: Date.now(),
                  imageUrl: '',
                  heading: '',
                  subtext: '',
                  cta: '',
                  link: ''
                });
                updateNestedContent('homepage', 'hero', 'slides', newSlides);
              }}
              className="w-full py-3 border border-brand-black text-brand-black hover:bg-brand-black hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              + Add Slide
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Collections Section" description="Highlight your key product categories.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField label="Label">
            <Input
              type="text"
              value={content.homepage.collections.label}
              onChange={(e) => updateNestedContent('homepage', 'collections', 'label', e.target.value)}
            />
          </FormField>
          <FormField label="Heading">
            <Input
              type="text"
              value={content.homepage.collections.heading}
              onChange={(e) => updateNestedContent('homepage', 'collections', 'heading', e.target.value)}
            />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Subheading">
              <TextArea
                rows={3}
                value={content.homepage.collections.subheading}
                onChange={(e) => updateNestedContent('homepage', 'collections', 'subheading', e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="CTA Label">
            <Input
              type="text"
              value={content.homepage.collections.ctaLabel}
              onChange={(e) => updateNestedContent('homepage', 'collections', 'ctaLabel', e.target.value)}
            />
          </FormField>
        </div>

        <div className="space-y-8 pt-8 border-t border-brand-divider mt-8">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-black">Collection Items</h4>
          <div className="grid grid-cols-1 gap-8">
            {content.homepage.collections.items?.map((item: any, index: number) => (
              <div key={index} className="p-8 border border-brand-divider bg-brand-bg/50 space-y-8">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Item {index + 1}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FormField label="Title">
                    <Input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const newItems = [...content.homepage.collections.items];
                        newItems[index] = { ...item, title: e.target.value };
                        updateNestedContent('homepage', 'collections', 'items', newItems);
                      }}
                    />
                  </FormField>
                  <FormField label="Link">
                    <Input
                      type="text"
                      value={item.link}
                      onChange={(e) => {
                        const newItems = [...content.homepage.collections.items];
                        newItems[index] = { ...item, link: e.target.value };
                        updateNestedContent('homepage', 'collections', 'items', newItems);
                      }}
                    />
                  </FormField>
                  <div className="lg:col-span-2">
                    <FormField label="Image URL">
                      <div className="flex gap-4">
                        <ImageUploadInput
                          value={item.image}
                          onChange={(val) => {
                            const newItems = [...content.homepage.collections.items];
                            newItems[index] = { ...item, image: val };
                            updateNestedContent('homepage', 'collections', 'items', newItems);
                          }}
                        />
                        <div className="w-12 h-12 border border-brand-divider bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </FormField>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FormSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormSection title="Vision">
          <div className="space-y-8">
            <FormField label="Label">
              <Input
                type="text"
                value={content.homepage.vision.label}
                onChange={(e) => updateNestedContent('homepage', 'vision', 'label', e.target.value)}
              />
            </FormField>
            <FormField label="Heading">
              <Input
                type="text"
                value={content.homepage.vision.heading}
                onChange={(e) => updateNestedContent('homepage', 'vision', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Text Content">
              <TextArea
                rows={4}
                value={content.homepage.vision.text}
                onChange={(e) => updateNestedContent('homepage', 'vision', 'text', e.target.value)}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Mission">
          <div className="space-y-8">
            <FormField label="Label">
              <Input
                type="text"
                value={content.homepage.mission.label}
                onChange={(e) => updateNestedContent('homepage', 'mission', 'label', e.target.value)}
              />
            </FormField>
            <FormField label="Heading">
              <Input
                type="text"
                value={content.homepage.mission.heading}
                onChange={(e) => updateNestedContent('homepage', 'mission', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Text Content">
              <TextArea
                rows={4}
                value={content.homepage.mission.text}
                onChange={(e) => updateNestedContent('homepage', 'mission', 'text', e.target.value)}
              />
            </FormField>
            <div className="space-y-6 pt-6 border-t border-brand-divider">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-black">Mission Points</h4>
              {content.homepage.mission.points.map((point: any, index: number) => (
                <div key={index} className="grid grid-cols-1 gap-6 p-6 border border-brand-divider bg-brand-bg/50">
                  <FormField label="Title">
                    <Input
                      type="text"
                      value={point.title}
                      onChange={(e) => {
                        const newPoints = [...content.homepage.mission.points];
                        newPoints[index] = { ...point, title: e.target.value };
                        updateNestedContent('homepage', 'mission', 'points', newPoints);
                      }}
                    />
                  </FormField>
                  <FormField label="Description">
                    <Input
                      type="text"
                      value={point.desc}
                      onChange={(e) => {
                        const newPoints = [...content.homepage.mission.points];
                        newPoints[index] = { ...point, desc: e.target.value };
                        updateNestedContent('homepage', 'mission', 'points', newPoints);
                      }}
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>
        </FormSection>
      </div>

      <FormSection title="Our Story (Reference) Section" description="The 3D scrubbing experience section on the landing page. Manage the images and text for each step here.">
        <div className="space-y-8">
          {content.homepage.storySteps?.map((step: any, index: number) => (
            <div key={index} className="p-6 border border-brand-black/10 rounded-xl relative space-y-6">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Step {index + 1}</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FormField label="Title">
                    <Input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const newSteps = [...content.homepage.storySteps];
                        newSteps[index].title = e.target.value;
                        updateContent('homepage', 'storySteps', newSteps);
                      }}
                    />
                  </FormField>
                  <FormField label="Subtitle">
                    <Input
                      type="text"
                      value={step.subtitle}
                      onChange={(e) => {
                        const newSteps = [...content.homepage.storySteps];
                        newSteps[index].subtitle = e.target.value;
                        updateContent('homepage', 'storySteps', newSteps);
                      }}
                    />
                  </FormField>
                  <FormField label="Description">
                    <TextArea
                      rows={4}
                      value={step.description}
                      onChange={(e) => {
                        const newSteps = [...content.homepage.storySteps];
                        newSteps[index].description = e.target.value;
                        updateContent('homepage', 'storySteps', newSteps);
                      }}
                    />
                  </FormField>
                </div>
                {/* Visual upload option removed per user request to preserve the 3D scrub integrity */}
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Prime Teaser Section" description="Promote the Prime collection or special features.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Label">
              <Input
                type="text"
                value={content.homepage.prime.label}
                onChange={(e) => updateNestedContent('homepage', 'prime', 'label', e.target.value)}
              />
            </FormField>
            <FormField label="Heading">
              <Input
                type="text"
                value={content.homepage.prime.heading}
                onChange={(e) => updateNestedContent('homepage', 'prime', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Description">
              <TextArea
                rows={4}
                value={content.homepage.prime.description}
                onChange={(e) => updateNestedContent('homepage', 'prime', 'description', e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="CTA Text">
                <Input
                  type="text"
                  value={content.homepage.prime.ctaText}
                  onChange={(e) => updateNestedContent('homepage', 'prime', 'ctaText', e.target.value)}
                />
              </FormField>
              <FormField label="CTA Link">
                <Input
                  type="text"
                  value={content.homepage.prime.ctaLink}
                  onChange={(e) => updateNestedContent('homepage', 'prime', 'ctaLink', e.target.value)}
                />
              </FormField>
            </div>
          </div>
          <div className="space-y-8">
            <FormField label="Background Image URL">
              <ImageUploadInput
                value={content.homepage.prime.bgImageUrl}
                onChange={(val) => updateNestedContent('homepage', 'prime', 'bgImageUrl', val)}
              />
            </FormField>
            <ImagePreview url={content.homepage.prime.bgImageUrl} label="Live Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Partnership Section" description="Encourage wholesale or collaborative partnerships.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Label">
              <Input
                type="text"
                value={content.homepage.partnership.label}
                onChange={(e) => updateNestedContent('homepage', 'partnership', 'label', e.target.value)}
              />
            </FormField>
            <FormField label="Heading">
              <Input
                type="text"
                value={content.homepage.partnership.heading}
                onChange={(e) => updateNestedContent('homepage', 'partnership', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Text Content">
              <TextArea
                rows={4}
                value={content.homepage.partnership.text}
                onChange={(e) => updateNestedContent('homepage', 'partnership', 'text', e.target.value)}
              />
            </FormField>
            <FormField label="CTA Label">
              <Input
                type="text"
                value={content.homepage.partnership.ctaLabel}
                onChange={(e) => updateNestedContent('homepage', 'partnership', 'ctaLabel', e.target.value)}
              />
            </FormField>
          </div>
          <div className="space-y-8">
            <FormField label="Partnership Image URL">
              <ImageUploadInput
                value={content.homepage.partnership.img}
                onChange={(val) => updateNestedContent('homepage', 'partnership', 'img', val)}
              />
            </FormField>
            <ImagePreview url={content.homepage.partnership.img} label="Live Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Final CTA Section" description="The last call to action at the bottom of the homepage.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Heading">
              <Input
                type="text"
                value={content.homepage.finalCta.heading}
                onChange={(e) => updateNestedContent('homepage', 'finalCta', 'heading', e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="CTA 1 Label">
                <Input
                  type="text"
                  value={content.homepage.finalCta.cta1Label}
                  onChange={(e) => updateNestedContent('homepage', 'finalCta', 'cta1Label', e.target.value)}
                />
              </FormField>
              <FormField label="CTA 1 Link">
                <Input
                  type="text"
                  value={content.homepage.finalCta.cta1Link}
                  onChange={(e) => updateNestedContent('homepage', 'finalCta', 'cta1Link', e.target.value)}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="CTA 2 Label">
                <Input
                  type="text"
                  value={content.homepage.finalCta.cta2Label}
                  onChange={(e) => updateNestedContent('homepage', 'finalCta', 'cta2Label', e.target.value)}
                />
              </FormField>
              <FormField label="CTA 2 Link">
                <Input
                  type="text"
                  value={content.homepage.finalCta.cta2Link}
                  onChange={(e) => updateNestedContent('homepage', 'finalCta', 'cta2Link', e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </motion.div>
  );

  const renderOurStoryTab = () => (
    <motion.div 
      key="ourStory"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <FormSection title="Hero Section" description="The introduction to the brand's heritage and narrative.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Title">
              <Input
                type="text"
                value={content.ourStory.hero.title}
                onChange={(e) => updateNestedContent('ourStory', 'hero', 'title', e.target.value)}
              />
            </FormField>
            <FormField label="Subtitle">
              <Input
                type="text"
                value={content.ourStory.hero.subtitle}
                onChange={(e) => updateNestedContent('ourStory', 'hero', 'subtitle', e.target.value)}
              />
            </FormField>
          </div>
          <div className="space-y-8">
            <FormField label="Hero Image URL">
              <ImageUploadInput
                value={content.ourStory.hero.imageUrl}
                onChange={(val) => updateNestedContent('ourStory', 'hero', 'imageUrl', val)}
              />
            </FormField>
            <ImagePreview url={content.ourStory.hero.imageUrl} label="Live Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="The Observation" description="The core insight that led to the creation of Luxardo.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Heading">
              <Input
                type="text"
                value={content.ourStory.observation.heading}
                onChange={(e) => updateNestedContent('ourStory', 'observation', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Content Paragraph 1">
              <TextArea
                rows={4}
                value={content.ourStory.observation.content1}
                onChange={(e) => updateNestedContent('ourStory', 'observation', 'content1', e.target.value)}
              />
            </FormField>
            <FormField label="Content Paragraph 2">
              <TextArea
                rows={4}
                value={content.ourStory.observation.content2}
                onChange={(e) => updateNestedContent('ourStory', 'observation', 'content2', e.target.value)}
              />
            </FormField>
          </div>
          <div className="space-y-8">
            <FormField label="Section Image URL">
              <ImageUploadInput
                value={content.ourStory.observation.imageUrl}
                onChange={(val) => updateNestedContent('ourStory', 'observation', 'imageUrl', val)}
              />
            </FormField>
            <ImagePreview url={content.ourStory.observation.imageUrl} label="Live Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="The Industry Gap" description="The problem Luxardo solves.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Heading">
              <Input
                type="text"
                value={content.ourStory.gap.heading}
                onChange={(e) => updateNestedContent('ourStory', 'gap', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Content Paragraph 1">
              <TextArea
                rows={4}
                value={content.ourStory.gap.content1}
                onChange={(e) => updateNestedContent('ourStory', 'gap', 'content1', e.target.value)}
              />
            </FormField>
            <FormField label="Content Paragraph 2">
              <TextArea
                rows={4}
                value={content.ourStory.gap.content2}
                onChange={(e) => updateNestedContent('ourStory', 'gap', 'content2', e.target.value)}
              />
            </FormField>
            <FormField label="Quote">
              <TextArea
                rows={3}
                value={content.ourStory.gap.quote}
                onChange={(e) => updateNestedContent('ourStory', 'gap', 'quote', e.target.value)}
              />
            </FormField>
          </div>
          <div className="space-y-8">
            <FormField label="Section Image URL">
              <ImageUploadInput
                value={content.ourStory.gap.imageUrl}
                onChange={(val) => updateNestedContent('ourStory', 'gap', 'imageUrl', val)}
              />
            </FormField>
            <ImagePreview url={content.ourStory.gap.imageUrl} label="Live Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="The Discovery" description="The solution and core principles.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Heading">
              <Input
                type="text"
                value={content.ourStory.discovery.heading}
                onChange={(e) => updateNestedContent('ourStory', 'discovery', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Text Content">
              <TextArea
                rows={4}
                value={content.ourStory.discovery.text}
                onChange={(e) => updateNestedContent('ourStory', 'discovery', 'text', e.target.value)}
              />
            </FormField>
          </div>
          <div className="space-y-8">
            {content.ourStory.discovery.points.map((point: any, index: number) => (
              <div key={index} className="p-4 border border-brand-divider bg-brand-bg/50 space-y-4">
                <FormField label={`Point ${index + 1} Title`}>
                  <Input
                    type="text"
                    value={point.title}
                    onChange={(e) => {
                      const newPoints = [...content.ourStory.discovery.points];
                      newPoints[index] = { ...point, title: e.target.value };
                      updateNestedContent('ourStory', 'discovery', 'points', newPoints);
                    }}
                  />
                </FormField>
                <FormField label={`Point ${index + 1} Description`}>
                  <TextArea
                    rows={2}
                    value={point.desc}
                    onChange={(e) => {
                      const newPoints = [...content.ourStory.discovery.points];
                      newPoints[index] = { ...point, desc: e.target.value };
                      updateNestedContent('ourStory', 'discovery', 'points', newPoints);
                    }}
                  />
                </FormField>
              </div>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection title="The Narrative" description="The final concluding statement.">
        <div className="grid grid-cols-1 gap-8">
          <FormField label="Heading">
            <Input
              type="text"
              value={content.ourStory.narrative.heading}
              onChange={(e) => updateNestedContent('ourStory', 'narrative', 'heading', e.target.value)}
            />
          </FormField>
          <FormField label="Text Content">
            <TextArea
              rows={4}
              value={content.ourStory.narrative.text}
              onChange={(e) => updateNestedContent('ourStory', 'narrative', 'text', e.target.value)}
            />
          </FormField>
        </div>
      </FormSection>
    </motion.div>
  );

  const renderCraftsmanshipTab = () => (
    <motion.div 
      key="craftsmanship"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <FormSection title="Hero Section (Feel-Felt-Found)" description="The main introduction using the Feel-Felt-Found copywriting framework.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Feel (User Desire)">
              <TextArea
                rows={3}
                value={content.craftsmanship.hero?.feel || ''}
                onChange={(e) => updateNestedContent('craftsmanship', 'hero', 'feel', e.target.value)}
              />
            </FormField>
            <FormField label="Felt (Industry Problem)">
              <TextArea
                rows={3}
                value={content.craftsmanship.hero?.felt || ''}
                onChange={(e) => updateNestedContent('craftsmanship', 'hero', 'felt', e.target.value)}
              />
            </FormField>
            <FormField label="Found (Luxardo Solution)">
              <TextArea
                rows={3}
                value={content.craftsmanship.hero?.found || ''}
                onChange={(e) => updateNestedContent('craftsmanship', 'hero', 'found', e.target.value)}
              />
            </FormField>
          </div>
          <div className="space-y-8">
            <FormField label="Hero Image">
              <ImageUploadInput
                value={content.craftsmanship.hero?.image || ''}
                onChange={(val) => updateNestedContent('craftsmanship', 'hero', 'image', val)}
              />
            </FormField>
            <ImagePreview url={content.craftsmanship.hero?.image || ''} label="Live Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Visual Depth Section" description="Parallax images for desktop and optimized static image for mobile.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6 p-6 border border-brand-divider">
            <FormField label="Desktop Layer 1 (Background)">
              <ImageUploadInput
                value={content.craftsmanship.visualDepth?.layer1 || ''}
                onChange={(val) => updateNestedContent('craftsmanship', 'visualDepth', 'layer1', val)}
              />
            </FormField>
            <ImagePreview url={content.craftsmanship.visualDepth?.layer1 || ''} label="Preview" />
          </div>
          <div className="space-y-6 p-6 border border-brand-divider">
            <FormField label="Desktop Layer 2 (Foreground)">
              <ImageUploadInput
                value={content.craftsmanship.visualDepth?.layer2 || ''}
                onChange={(val) => updateNestedContent('craftsmanship', 'visualDepth', 'layer2', val)}
              />
            </FormField>
            <ImagePreview url={content.craftsmanship.visualDepth?.layer2 || ''} label="Preview" />
          </div>
          <div className="space-y-6 p-6 border border-brand-divider">
            <FormField label="Mobile Image (Static)">
              <ImageUploadInput
                value={content.craftsmanship.visualDepth?.mobileImage || ''}
                onChange={(val) => updateNestedContent('craftsmanship', 'visualDepth', 'mobileImage', val)}
              />
            </FormField>
            <ImagePreview url={content.craftsmanship.visualDepth?.mobileImage || ''} label="Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Process Steps" description="The 4-step journey of creating a Luxardo piece.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(content.craftsmanship.process || []).map((step: any, index: number) => (
            <div key={index} className="p-8 border border-brand-divider bg-brand-bg/50 space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Step 0{index + 1}</span>
              </div>
              <div className="space-y-6">
                <FormField label="Title">
                  <Input
                    type="text"
                    value={step.title || ''}
                    onChange={(e) => {
                      const newProcess = [...content.craftsmanship.process];
                      newProcess[index] = { ...step, title: e.target.value };
                      updateContent('craftsmanship', 'process', newProcess);
                    }}
                  />
                </FormField>
                <FormField label="Description">
                  <TextArea
                    rows={3}
                    value={step.description || ''}
                    onChange={(e) => {
                      const newProcess = [...content.craftsmanship.process];
                      newProcess[index] = { ...step, description: e.target.value };
                      updateContent('craftsmanship', 'process', newProcess);
                    }}
                  />
                </FormField>
                <FormField label="Image URL">
                  <ImageUploadInput
                    value={step.image || ''}
                    onChange={(val) => {
                      const newProcess = [...content.craftsmanship.process];
                      newProcess[index] = { ...step, image: val };
                      updateContent('craftsmanship', 'process', newProcess);
                    }}
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Differentiation Section" description="Explaining the ready-to-stitch concept clearly.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Title">
              <Input
                type="text"
                value={content.craftsmanship.differentiation?.title || ''}
                onChange={(e) => updateNestedContent('craftsmanship', 'differentiation', 'title', e.target.value)}
              />
            </FormField>
            <FormField label="Description">
              <TextArea
                rows={4}
                value={content.craftsmanship.differentiation?.description || ''}
                onChange={(e) => updateNestedContent('craftsmanship', 'differentiation', 'description', e.target.value)}
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection title="Prime / Limited Edition Section" description="Highlighting exclusive access.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Title">
              <Input
                type="text"
                value={content.craftsmanship.prime?.title || ''}
                onChange={(e) => updateNestedContent('craftsmanship', 'prime', 'title', e.target.value)}
              />
            </FormField>
            <FormField label="Description">
              <TextArea
                rows={4}
                value={content.craftsmanship.prime?.description || ''}
                onChange={(e) => updateNestedContent('craftsmanship', 'prime', 'description', e.target.value)}
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection title="Identity & CTA" description="Final statement and call to action buttons.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Identity Statement">
              <TextArea
                rows={3}
                value={content.craftsmanship.identity || ''}
                onChange={(e) => updateContent('craftsmanship', 'identity', e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Primary CTA Text">
                <Input
                  type="text"
                  value={content.craftsmanship.cta?.primary || ''}
                  onChange={(e) => updateNestedContent('craftsmanship', 'cta', 'primary', e.target.value)}
                />
              </FormField>
              <FormField label="Secondary CTA Text">
                <Input
                  type="text"
                  value={content.craftsmanship.cta?.secondary || ''}
                  onChange={(e) => updateNestedContent('craftsmanship', 'cta', 'secondary', e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </motion.div>
  );

  const renderWholesaleTab = () => (
    <motion.div 
      key="wholesale"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <FormSection title="Hero & Intro" description="Setting the stage for wholesale partnerships.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Hero Title">
              <Input
                type="text"
                value={content.wholesale.hero.title}
                onChange={(e) => updateNestedContent('wholesale', 'hero', 'title', e.target.value)}
              />
            </FormField>
            <FormField label="Hero Subtitle">
              <Input
                type="text"
                value={content.wholesale.hero.subtitle}
                onChange={(e) => updateNestedContent('wholesale', 'hero', 'subtitle', e.target.value)}
              />
            </FormField>
            <FormField label="Intro Heading">
              <Input
                type="text"
                value={content.wholesale.intro.heading}
                onChange={(e) => updateNestedContent('wholesale', 'intro', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Intro Text">
              <TextArea
                rows={4}
                value={content.wholesale.intro.text}
                onChange={(e) => updateNestedContent('wholesale', 'intro', 'text', e.target.value)}
              />
            </FormField>
          </div>
          <div className="space-y-8">
            <FormField label="Hero Image URL">
              <ImageUploadInput
                value={content.wholesale.hero.imageUrl}
                onChange={(val) => updateNestedContent('wholesale', 'hero', 'imageUrl', val)}
              />
            </FormField>
            <ImagePreview url={content.wholesale.hero.imageUrl} label="Live Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Trust Section" description="Building confidence with potential partners.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Heading">
              <Input
                type="text"
                value={content.wholesale.trust.heading}
                onChange={(e) => updateNestedContent('wholesale', 'trust', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Text">
              <TextArea
                rows={4}
                value={content.wholesale.trust.text}
                onChange={(e) => updateNestedContent('wholesale', 'trust', 'text', e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Cities Stat">
                <Input
                  type="text"
                  value={content.wholesale.trust.stats.cities}
                  onChange={(e) => {
                    const newStats = { ...content.wholesale.trust.stats, cities: e.target.value };
                    updateNestedContent('wholesale', 'trust', 'stats', newStats);
                  }}
                />
              </FormField>
              <FormField label="States Stat">
                <Input
                  type="text"
                  value={content.wholesale.trust.stats.states}
                  onChange={(e) => {
                    const newStats = { ...content.wholesale.trust.stats, states: e.target.value };
                    updateNestedContent('wholesale', 'trust', 'stats', newStats);
                  }}
                />
              </FormField>
            </div>
          </div>
          <div className="space-y-8">
            <FormField label="Image URL">
              <ImageUploadInput
                value={content.wholesale.trust.imageUrl}
                onChange={(val) => updateNestedContent('wholesale', 'trust', 'imageUrl', val)}
              />
            </FormField>
            <ImagePreview url={content.wholesale.trust.imageUrl} label="Live Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Partnership Standards" description="The quality and values we expect from our partners.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField label="Section Label">
            <Input
              type="text"
              value={content.wholesale.standards.label}
              onChange={(e) => updateNestedContent('wholesale', 'standards', 'label', e.target.value)}
            />
          </FormField>
          <FormField label="Section Heading">
            <Input
              type="text"
              value={content.wholesale.standards.heading}
              onChange={(e) => updateNestedContent('wholesale', 'standards', 'heading', e.target.value)}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-brand-divider">
          {content.wholesale.standards.items.map((item: any, i: number) => (
            <div key={i} className="p-8 bg-brand-bg/50 border border-brand-divider space-y-6">
              <FormField label={`Standard ${i + 1} Title`}>
                <Input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const newItems = [...content.wholesale.standards.items];
                    newItems[i] = { ...newItems[i], title: e.target.value };
                    updateNestedContent('wholesale', 'standards', 'items', newItems);
                  }}
                />
              </FormField>
              <FormField label="Description">
                <TextArea
                  rows={3}
                  value={item.desc}
                  onChange={(e) => {
                    const newItems = [...content.wholesale.standards.items];
                    newItems[i] = { ...newItems[i], desc: e.target.value };
                    updateNestedContent('wholesale', 'standards', 'items', newItems);
                  }}
                />
              </FormField>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Selective Collaboration" description="Showcasing our exclusive network.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <FormField label="Label">
              <Input
                type="text"
                value={content.wholesale.collaboration.label}
                onChange={(e) => updateNestedContent('wholesale', 'collaboration', 'label', e.target.value)}
              />
            </FormField>
            <FormField label="Heading">
              <Input
                type="text"
                value={content.wholesale.collaboration.heading}
                onChange={(e) => updateNestedContent('wholesale', 'collaboration', 'heading', e.target.value)}
              />
            </FormField>
            <FormField label="Main Text">
              <TextArea
                rows={4}
                value={content.wholesale.collaboration.text}
                onChange={(e) => updateNestedContent('wholesale', 'collaboration', 'text', e.target.value)}
              />
            </FormField>
            <FormField label="Partners (Comma separated)">
              <Input
                type="text"
                value={content.wholesale.collaboration.partners.join(', ')}
                onChange={(e) => {
                  const newPartners = e.target.value.split(',').map(p => p.trim());
                  updateNestedContent('wholesale', 'collaboration', 'partners', newPartners);
                }}
              />
            </FormField>
          </div>
          <div className="space-y-8">
            <FormField label="Image URL">
              <ImageUploadInput
                value={content.wholesale.collaboration.imageUrl}
                onChange={(val) => updateNestedContent('wholesale', 'collaboration', 'imageUrl', val)}
              />
            </FormField>
            <ImagePreview url={content.wholesale.collaboration.imageUrl} label="Live Preview" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Partnership Benefits" description="What we offer to our wholesale partners.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField label="Section Label">
            <Input
              type="text"
              value={content.wholesale.benefits.label}
              onChange={(e) => updateNestedContent('wholesale', 'benefits', 'label', e.target.value)}
            />
          </FormField>
          <FormField label="Section Heading">
            <Input
              type="text"
              value={content.wholesale.benefits.heading}
              onChange={(e) => updateNestedContent('wholesale', 'benefits', 'heading', e.target.value)}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-brand-divider">
          {content.wholesale.benefits.items.map((item: any, i: number) => (
            <div key={i} className="p-8 bg-brand-bg/50 border border-brand-divider space-y-6">
              <FormField label={`Benefit ${i + 1} Title`}>
                <Input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const newItems = [...content.wholesale.benefits.items];
                    newItems[i] = { ...newItems[i], title: e.target.value };
                    updateNestedContent('wholesale', 'benefits', 'items', newItems);
                  }}
                />
              </FormField>
              <FormField label="Description">
                <TextArea
                  rows={3}
                  value={item.desc}
                  onChange={(e) => {
                    const newItems = [...content.wholesale.benefits.items];
                    newItems[i] = { ...newItems[i], desc: e.target.value };
                    updateNestedContent('wholesale', 'benefits', 'items', newItems);
                  }}
                />
              </FormField>
            </div>
          ))}
        </div>
      </FormSection>
    </motion.div>
  );

  const renderContactTab = () => (
    <motion.div 
      key="contact"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormSection title="Contact Information" description="How clients can reach the Luxardo concierge.">
          <div className="space-y-8">
            <FormField label="Email Address">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={16} />
                <Input
                  type="email"
                  value={content.contact.details.email}
                  onChange={(e) => updateNestedContent('contact', 'details', 'email', e.target.value)}
                  className="pl-12"
                />
              </div>
            </FormField>
            <FormField label="Phone Number">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={16} />
                <Input
                  type="text"
                  value={content.contact.details.phone}
                  onChange={(e) => updateNestedContent('contact', 'details', 'phone', e.target.value)}
                  className="pl-12"
                />
              </div>
            </FormField>
            <FormField label="Physical Address">
              <div className="relative">
                <MapPin className="absolute left-4 top-6 text-brand-secondary" size={16} />
                <TextArea
                  rows={3}
                  value={content.contact.details.address}
                  onChange={(e) => updateNestedContent('contact', 'details', 'address', e.target.value)}
                  className="pl-12"
                />
              </div>
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Concierge Hours" description="Operating hours for personalized service.">
          <div className="space-y-8">
            <FormField label="Heading">
              <Input
                type="text"
                value={content.contact.hours.heading}
                onChange={(e) => updateNestedContent('contact', 'hours', 'heading', e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Weekday Label">
                <Input
                  type="text"
                  value={content.contact.hours.weekdays.label}
                  onChange={(e) => {
                    const newWeekdays = { ...content.contact.hours.weekdays, label: e.target.value };
                    updateNestedContent('contact', 'hours', 'weekdays', newWeekdays);
                  }}
                />
              </FormField>
              <FormField label="Weekday Time">
                <Input
                  type="text"
                  value={content.contact.hours.weekdays.time}
                  onChange={(e) => {
                    const newWeekdays = { ...content.contact.hours.weekdays, time: e.target.value };
                    updateNestedContent('contact', 'hours', 'weekdays', newWeekdays);
                  }}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Saturday Label">
                <Input
                  type="text"
                  value={content.contact.hours.saturday.label}
                  onChange={(e) => {
                    const newSaturday = { ...content.contact.hours.saturday, label: e.target.value };
                    updateNestedContent('contact', 'hours', 'saturday', newSaturday);
                  }}
                />
              </FormField>
              <FormField label="Saturday Time">
                <Input
                  type="text"
                  value={content.contact.hours.saturday.time}
                  onChange={(e) => {
                    const newSaturday = { ...content.contact.hours.saturday, time: e.target.value };
                    updateNestedContent('contact', 'hours', 'saturday', newSaturday);
                  }}
                />
              </FormField>
            </div>
          </div>
        </FormSection>
      </div>

      <FormSection title="Social Media Links" description="Connect with Luxardo across digital platforms.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(content.contact.socials || {}).map(([platform, url]: [string, any]) => (
            <FormField key={platform} label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={16} />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newSocials = { ...(content.contact.socials || {}), [platform]: e.target.value };
                    updateContent('contact', 'socials', newSocials);
                  }}
                  className="pl-12"
                />
              </div>
            </FormField>
          ))}
        </div>
      </FormSection>
    </motion.div>
  );

  const renderFooterTab = () => (
    <motion.div 
      key="footer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <FormSection title="Footer Content" description="Global information displayed at the bottom of every page.">
        <div className="space-y-8">
          <FormField label="About Text">
            <TextArea
              rows={4}
              value={content.footer.about}
              onChange={(e) => updateContent('footer', 'about', e.target.value)}
            />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField label="Copyright Year">
              <Input
                type="text"
                value={content.footer.copyrightYear || ''}
                onChange={(e) => updateContent('footer', 'copyrightYear', e.target.value)}
              />
            </FormField>
            <FormField label="Copyright Text">
              <Input
                type="text"
                value={content.footer.copyrightText || ''}
                onChange={(e) => updateContent('footer', 'copyrightText', e.target.value)}
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection title="Footer Social Links" description="Social platform links for the footer area.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(content.footer.socialLinks || {}).map(([platform, url]: [string, any]) => (
            <FormField key={platform} label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={16} />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newSocials = { ...(content.footer.socialLinks || {}), [platform]: e.target.value };
                    updateContent('footer', 'socialLinks', newSocials);
                  }}
                  className="pl-12"
                />
              </div>
            </FormField>
          ))}
        </div>
      </FormSection>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tight">Content Management</h1>
          <p className="text-brand-secondary font-sans mt-1">Manage all website text, imagery, and sections from one place.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={handleReset}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-brand-divider hover:border-brand-black transition-colors text-[10px] font-bold uppercase tracking-widest"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-brand-black text-brand-white hover:bg-brand-secondary transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
          >
            <Save size={16} /> {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible border-b lg:border-b-0 lg:border-r border-brand-divider no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap lg:whitespace-normal ${
                  activeTab === tab.id 
                    ? 'bg-brand-black text-brand-white border-b-2 lg:border-b-0 lg:border-r-4 border-brand-black' 
                    : 'text-brand-secondary hover:text-brand-black hover:bg-brand-bg'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'homepage' && renderHomepageTab()}
            {activeTab === 'ourStory' && renderOurStoryTab()}
            {activeTab === 'craftsmanship' && renderCraftsmanshipTab()}
            {activeTab === 'wholesale' && renderWholesaleTab()}
            {activeTab === 'contact' && renderContactTab()}
            {activeTab === 'footer' && renderFooterTab()}
          </AnimatePresence>
        </main>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset Content"
        message="Are you sure you want to reset all content to defaults? This cannot be undone."
        confirmText="Reset"
        onConfirm={confirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
