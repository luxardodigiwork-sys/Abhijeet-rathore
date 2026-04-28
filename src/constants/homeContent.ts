export const DEFAULT_SITE_CONTENT = {
  homepage: {
    hero: {
      mediaType: 'image' as 'image' | 'video',
      videoUrl: '',
      title: 'ELEVATING MODERN LUXURY',
      subtitle: 'Discover our latest collection of meticulously crafted garments.',
      primaryCtaText: 'EXPLORE COLLECTION',
      primaryCtaLink: '/collections',
      secondaryCtaText: 'PRIME MEMBER',
      secondaryCtaLink: '/prime-membership',
      imageUrl: 'https://images.unsplash.com/photo-1594938298598-718890ce8c53?q=80&w=2148&auto=format&fit=crop',
      slides: [
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
      ]
    },
    intro: {
      label: 'The Maison',
      heading: 'Design Discipline',
      description: 'Luxardo is a modern ethnic luxury menswear brand built around the philosophy of design discipline and selected imported fabrics. We believe that true luxury is found in the intersection of traditional craftsmanship and contemporary aesthetic precision.\n\nOur approach is defined by premium presentation and a refined customer experience, ensuring that every garment is not just worn, but experienced.',
      ctaText: 'Discover Our Story',
      ctaLink: '/our-story',
      imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1000&auto=format&fit=crop'
    },
    ecosystem: {
      label: 'The System',
      heading: 'A Complete Luxury Ecosystem',
      subheading: 'Luxardo is more than garments; it is a disciplined system of creation, refinement, and delivery.',
      steps: [
        {
          step: "01",
          title: "Imported Fabric Selection",
          desc: "We source only the finest textiles from global mills, selected for their structural integrity and sensory refinement.",
          img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop"
        },
        {
          step: "02",
          title: "Design Development",
          desc: "Silhouettes are engineered with architectural precision, balancing modern aesthetics with ethnic heritage.",
          img: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop"
        },
        {
          step: "03",
          title: "Expert Refinement",
          desc: "Every design undergoes rigorous prototyping and refinement until the aesthetic balance is absolute.",
          img: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1000&auto=format&fit=crop"
        },
        {
          step: "04",
          title: "Production Execution",
          desc: "Master tailors execute the vision with disciplined techniques, ensuring every seam reflects our standard.",
          img: "https://images.unsplash.com/photo-1605007493699-af65834f8a00?q=80&w=1000&auto=format&fit=crop"
        },
        {
          step: "05",
          title: "Finishing Inspection",
          desc: "A meticulous multi-point inspection ensures that no garment leaves the atelier without perfection.",
          img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop"
        },
        {
          step: "06",
          title: "Presentation Packaging",
          desc: "The experience concludes with our signature matte black presentation, a final mark of luxury.",
          img: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1000&auto=format&fit=crop"
        },
        {
          step: "07",
          title: "Final Dispatch Check",
          desc: "A final verification of the complete package before it is released for global dispatch.",
          img: "https://images.unsplash.com/photo-1556740734-7f96267b118a?q=80&w=1000&auto=format&fit=crop"
        }
      ]
    },
    collections: {
      label: 'The Wardrobe',
      heading: 'Maison Collection',
      subheading: 'A curated selection of our finest sartorial achievements, designed for the modern gentleman.',
      ctaLabel: 'View All Collections',
      items: [
        {
          id: 'three-piece-suit',
          title: '3 Piece Suit',
          image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
          link: '/collections/three-piece-suit'
        },
        {
          id: 'tuxedo',
          title: 'Tuxedo',
          image: 'https://images.unsplash.com/photo-1593030761757-71fae46af504?q=80&w=1000&auto=format&fit=crop',
          link: '/collections/tuxedo'
        },
        {
          id: 'jodhpuri',
          title: 'Jodhpuri',
          image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop',
          link: '/collections/jodhpuri'
        },
        {
          id: 'koti-pant',
          title: 'Koti Pant',
          image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
          link: '/collections/koti-pant'
        },
        {
          id: 'koti-kurta',
          title: 'Koti Kurta',
          image: 'https://images.unsplash.com/photo-1621335829175-95f437384d7c?q=80&w=1000&auto=format&fit=crop',
          link: '/collections/koti-kurta'
        },
        {
          id: 'kurta',
          title: 'Kurta',
          image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop',
          link: '/collections/kurta'
        },
        {
          id: 'casual',
          title: 'Casual',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
          link: '/collections/casual'
        }
      ]
    },
    vision: {
      label: 'The Vision',
      heading: 'A Return to Discipline & Structure',
      text: 'We envision a world where menswear is defined by architectural precision and sartorial integrity. A return to the disciplined lines and refined structures that define the modern gentleman.'
    },
    mission: {
      label: 'The Mission',
      heading: 'Crafting the Premium Experience',
      text: 'Our mission is to create a premium menswear experience through the meticulous selection of fabrics, elegant design discipline, careful presentation, and thoughtful service.',
      points: [
        { title: 'Selected Fabrics', desc: 'Global sourcing for structural excellence.' },
        { title: 'Elegant Design', desc: 'Modern silhouettes with ethnic heritage.' }
      ]
    },
    partnership: {
      label: 'Collaboration',
      heading: 'Join Luxardo',
      text: 'We invite global retailers, luxury boutiques, and visionary collaborators to connect with the Luxardo ecosystem. Together, we can redefine the modern ethnic luxury landscape.',
      ctaLabel: 'Wholesale & Partnerships',
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop'
    },
    ourStory: {
      label: 'Craftsmanship',
      heading: 'The Return of Discipline',
      content1: 'In an era of mass production, many men feel that modern fashion has sacrificed individuality and structure for speed. The soul of a garment is often lost in the noise of the assembly line.',
      content2: 'Luxardo was created as a response to this void. We are here to bring back discipline, design, and thoughtful refinement. Our mission is to close the gap between superficial fashion and a true premium menswear experience.',
      imageUrl1: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop'
    },
    prime: {
      label: 'Exclusive Access',
      heading: 'PRIME MEMBER',
      description: 'A premium access layer for clients who demand more. Expert consultation, priority fabric access, and exclusive bespoke eligibility.',
      ctaText: 'Discover Prime',
      ctaLink: '/prime-membership',
      bgImageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2000&auto=format&fit=crop'
    },
    finalCta: {
      heading: 'Begin Your Sartorial Journey',
      cta1Label: 'Explore Collections',
      cta1Link: '/collections',
      cta2Label: 'Prime Member',
      cta2Link: '/prime-membership'
    },
    storySteps: [
      {
        title: "Our Story.",
        subtitle: "Design Sketching",
        description: "From the world's finest mills to your wardrobe. A journey of uncompromising quality, expert craftsmanship, and timeless design.",
        image: "https://images.unsplash.com/photo-1594938298598-718890ce8c53?q=80&w=1000&auto=format&fit=crop&sat=-100&con=20"
      },
      {
        title: "Global Sourcing",
        subtitle: "01 / Premium Fabric",
        description: "We import premium fabrics from across the entire world, meticulously selecting only the finest materials to ensure an unparalleled foundation for our garments.",
        image: "https://images.unsplash.com/photo-1584227282544-763914f6b216?q=80&w=1000&auto=format&fit=crop&sat=-100&con=20"
      },
      {
        title: "Fabric Finishing",
        subtitle: "02 / Treatment",
        description: "Each fabric undergoes specialized finishing processes, enhancing its natural texture, drape, and longevity to meet our exacting luxury standards.",
        image: "https://images.unsplash.com/photo-1618220179428-22790b46a015?q=80&w=1000&auto=format&fit=crop&sat=-100&con=20"
      },
      {
        title: "Personalized Sketching",
        subtitle: "03 / Design",
        description: "Our master designers sketch personalized, bespoke designs, translating your unique vision into detailed sartorial blueprints.",
        image: "https://images.unsplash.com/photo-1558693154-1d8560822606?q=80&w=1000&auto=format&fit=crop&sat=-100&con=20"
      },
      {
        title: "Expert Craftsmanship",
        subtitle: "04 / Implementation",
        description: "These designs are brought to life by our expert and experienced artisans, who execute every cut and stitch with decades of tailoring precision.",
        image: "https://images.unsplash.com/photo-1594938298598-718890ce8c53?q=80&w=1000&auto=format&fit=crop&sat=-100&con=20"
      },
      {
        title: "Quality Assurance",
        subtitle: "05 / Final Check",
        description: "Before completion, every piece undergoes a rigorous final check. We scrutinize every detail to guarantee absolute perfection and flawless execution.",
        image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1000&auto=format&fit=crop&sat=-100&con=20"
      },
      {
        title: "Ready For You",
        subtitle: "06 / Box Packing",
        description: "The journey concludes with the ready-to-stitch fabric elegantly folded and secured in our premium box packing, ready to be transformed into your masterpiece.",
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop&sat=-100&con=20"
      }
    ]
  },
  ourStory: {
    hero: {
      title: 'Our Story',
      subtitle: 'The Maison Heritage',
      description: 'Luxardo exists to close the gap between superficial fashion and a true premium menswear experience.',
      imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=2000&auto=format&fit=crop'
    },
    observation: {
      label: 'The Observation',
      heading: 'Modern fashion has sacrificed individuality for the convenience of mass production.',
      content1: 'We understand that many men feel a sense of disconnect with the current state of menswear. The market is flooded with garments that prioritize speed over soul, leaving the modern gentleman with choices that feel generic and disposable.',
      content2: 'You seek presence, not just apparel. You seek a garment that reflects your discipline, your taste, and your heritage without feeling like a costume or a commodity.',
      imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop'
    },
    gap: {
      label: 'The Industry Gap',
      heading: 'Expensive, but empty.',
      content1: 'We felt the same frustration. We saw many clients who felt that high-end garments looked expensive in photographs but lacked real craftsmanship and structural integrity when worn.',
      content2: 'The industry had created a gap between superficial luxury and true premium experience. A gap where the "luxury" label was used to mask average tailoring and uninspired fabric choices.',
      quote: 'We realized that true luxury doesn\'t shout; it whispers through the precision of its construction.',
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop'
    },
    discovery: {
      label: 'The Luxardo Discovery',
      heading: 'The Return to Discipline.',
      text: 'We found that true luxury comes from a return to the fundamentals: thoughtful design, selected imported fabrics, refined tailoring, and hand-finished character.',
      points: [
        { title: 'Thoughtful Design', desc: 'Every silhouette is developed to balance modern lines with ethnic heritage.' },
        { title: 'Selected Fabrics', desc: 'We source only the finest materials from global mills that share our standards.' },
        { title: 'Refined Tailoring', desc: 'Our construction methods prioritize structural integrity over production speed.' }
      ]
    },
    narrative: {
      heading: 'Luxardo exists to close the gap between superficial fashion and a true premium menswear experience.',
      text: 'We are here for the man who understands that his wardrobe is an extension of his discipline. We are here to provide the expertise, taste, and structural quality that the modern market has forgotten.'
    }
  },
  craftsmanship: {
    hero: {
      feel: 'You seek garments that reflect your personal ambition and unique presence.',
      felt: 'Yet, modern menswear often feels mass-produced, lacking true identity and structure.',
      found: 'Luxardo delivers architecturally constructed, premium ready-to-stitch ensembles designed for your exact identity.',
      image: 'https://images.unsplash.com/photo-1594938298598-718890ce8c53?q=80&w=2148&auto=format&fit=crop'
    },
    visualDepth: {
      layer1: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2148&auto=format&fit=crop',
      layer2: 'https://images.unsplash.com/photo-1605007493699-af65834f8a00?q=80&w=2148&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2148&auto=format&fit=crop'
    },
    process: [
      {
        title: "01. Global Sourcing",
        description: "We source the finest raw luxury fabrics from premier mills worldwide.",
        image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2000"
      },
      {
        title: "02. In-House Finishing",
        description: "Fabrics undergo rigorous finishing processes to ensure perfect drape and longevity.",
        image: "https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=2000"
      },
      {
        title: "03. Artisan Crafting",
        description: "Handcrafted embroidery inspired by armory structure, sketched and designed by masters.",
        image: "https://images.unsplash.com/photo-1551482850-13a8261e4115?q=80&w=2000"
      },
      {
        title: "04. Ready-to-Stitch",
        description: "Delivered as a pristine, ready-to-stitch package with a clear vision of the final garment.",
        image: "https://images.unsplash.com/photo-1594938298598-718890ce8c53?q=80&w=2000"
      }
    ],
    differentiation: {
      title: "Not Ready-Made. Not Custom Chaos.",
      description: "We bridge the gap. You receive premium, pre-finished, ready-to-stitch fabric with a crystal-clear final output. No guesswork, just perfect execution by your tailor."
    },
    prime: {
      title: "The Prime Reserve",
      description: "Our most exclusive limited-edition drops and rarest fabrics are reserved strictly for Luxardo Prime members. Never mass-produced. Never repeated."
    },
    identity: "This is not just clothing. It is a constructed identity.",
    cta: {
      primary: "Explore Collection",
      secondary: "Join Prime"
    }
  },
  wholesale: {
    hero: {
      title: 'Wholesale & Partnerships',
      subtitle: 'Global Expansion',
      description: 'We invite global retailers, luxury boutiques, and visionary collaborators to connect with the Luxardo ecosystem.',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop'
    },
    intro: {
      heading: 'Partner with the Luxardo Ecosystem',
      text: 'We invite global retailers, luxury boutiques, and visionary collaborators to connect with the Luxardo ecosystem. Together, we can redefine the modern ethnic luxury landscape.'
    },
    trust: {
      heading: 'A Disciplined Global Network',
      text: 'Luxardo has established a robust wholesale infrastructure that supports premium retail partners across major metropolitan hubs. Our system is designed for reliability, consistency, and shared growth.',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop',
      stats: {
        cities: '12+',
        states: '08+'
      }
    },
    standards: {
      label: 'The Standard',
      heading: 'Why Partner With Luxardo',
      items: [
        { title: 'Modern Ethnic Luxury', desc: 'A refined positioning that bridges traditional heritage with contemporary sartorial discipline, offering a distinct aesthetic for the modern gentleman.' },
        { title: 'Selected Imported Fabrics', desc: 'Uncompromising material sourcing. We utilize only premium imported textiles chosen for their structural integrity and sensory refinement.' },
        { title: 'Disciplined Development', desc: 'Rigorous prototyping and a consistent brand language ensure that every collection maintains our exacting standards of architectural precision.' },
        { title: 'Premium Presentation', desc: 'Maison-level packaging and strict visual merchandising standards guarantee an elevated unboxing and retail experience.' },
        { title: 'Curated Assortment', desc: 'A boutique-friendly premium assortment designed to integrate seamlessly into high-end retail environments and multi-designer spaces.' },
        { title: 'Structured Experience', desc: 'Trust built through extensive wholesale operations across India, providing our global partners with reliable logistics and proven operational excellence.' }
      ]
    },
    collaboration: {
      label: 'Selective Collaboration',
      heading: 'Curated Retail Partnerships',
      text: 'Luxardo is not open to everyone. We are building long-term partnerships exclusively with retail spaces that value premium menswear, presentation discipline, and an elevated client experience.',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop',
      partners: [
        'Premium Boutiques',
        'Luxury Multi-Designer Stores',
        'Curated Ethnic Menswear Retailers',
        'Maison-Style Retail Spaces',
        'Selected International Partners'
      ]
    },
    benefits: {
      label: 'Partner Privileges',
      heading: 'Partnership Benefits',
      items: [
        { title: 'Curated Collections', desc: 'Access to curated Luxardo collections and a selective product assortment tailored for premium retail spaces.' },
        { title: 'Visual Presentation', desc: 'Premium visual presentation support and trust-building product presentation standards to elevate your floor displays.' },
        { title: 'Brand Consistency', desc: 'Consistent brand language and product identity across all touchpoints, ensuring a unified luxury experience for your clients.' },
        { title: 'Dedicated Support', desc: 'Dedicated wholesale relationship support to assist with orders, product knowledge, and seamless operational logistics.' },
        { title: 'Expansion Ready', desc: 'An expansion-ready wholesale collaboration framework designed to scale alongside your business growth and success.' }
      ]
    }
  },
  contact: {
    hero: {
      title: 'Contact Us',
      subtitle: 'Global Concierge',
      description: 'Our team is available to assist with private appointments, bespoke inquiries, and global member services.',
      imageUrl: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=2000&auto=format&fit=crop'
    },
    details: {
      heading: 'The Maison Concierge',
      subtitle: 'Personalized Service',
      text: 'Whether you are seeking a private style consultation or have a specific inquiry regarding our collections, our concierge team is dedicated to providing a refined and efficient response.',
      email: 'concierge@luxardo.com',
      phone: '+1 (800) 123-4567',
      address: '123 Luxury Avenue, New York, NY 10022'
    },
    hours: {
      heading: 'Concierge Hours',
      weekdays: { label: 'Monday - Friday', time: '10:00 AM - 8:00 PM IST' },
      saturday: { label: 'Saturday', time: '11:00 AM - 6:00 PM IST' }
    },
    socials: {
      instagram: 'https://instagram.com/luxardo',
      facebook: 'https://facebook.com/luxardo',
      twitter: 'https://twitter.com/luxardo',
      pinterest: 'https://pinterest.com/luxardo'
    }
  },
  footer: {
    about: 'Luxardo represents the pinnacle of modern luxury menswear, blending architectural precision with ethnic heritage.',
    copyright: '© 2015 Luxardo Maison. All rights reserved.',
    copyrightYear: '2015',
    copyrightText: 'Luxardo Maison. All rights reserved.',
    socialLinks: {
      instagram: 'https://instagram.com/luxardo',
      facebook: 'https://facebook.com/luxardo',
      twitter: 'https://twitter.com/luxardo'
    }
  }
};
