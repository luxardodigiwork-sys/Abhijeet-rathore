import { Country, Language, Product } from './types';

export const COUNTRIES: Country[] = [
  { name: 'India', code: 'IN', currency: { code: 'INR', symbol: '₹', rate: 1 }, active: true, language: 'English (US)' },
  { name: 'United States', code: 'US', currency: { code: 'USD', symbol: '$', rate: 0.012 }, active: true, language: 'English (US)' },
  { name: 'United Kingdom', code: 'GB', currency: { code: 'GBP', symbol: '£', rate: 0.0095 }, active: true, language: 'English (US)' },
  { name: 'United Arab Emirates', code: 'AE', currency: { code: 'AED', symbol: 'د.إ', rate: 0.044 }, active: true, language: 'Arabic' },
  { name: 'France', code: 'FR', currency: { code: 'EUR', symbol: '€', rate: 0.011 }, active: true, language: 'French' },
  { name: 'Canada', code: 'CA', currency: { code: 'CAD', symbol: 'C$', rate: 0.016 }, active: false, language: 'English (US)' },
  { name: 'Australia', code: 'AU', currency: { code: 'AUD', symbol: 'A$', rate: 0.018 }, active: false, language: 'English (US)' },
  { name: 'Singapore', code: 'SG', currency: { code: 'SGD', symbol: 'S$', rate: 0.016 }, active: false, language: 'English (US)' },
];

export const LANGUAGES: Language[] = ['English (US)', 'French', 'Arabic'];

export const COLLECTIONS = [
  {
    id: 'three-piece-suit',
    fullName: '3 Piece Suit',
    shortName: '3 Piece Suit',
    descriptor: 'Complete tailored ensembles for the discerning gentleman.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
    narrative: 'The ultimate expression of tailored perfection.',
    craftsmanship: 'Three-layer construction for a flawless fit.',
    packaging: 'Archival box with premium garment protection.'
  },
  {
    id: 'tuxedo',
    fullName: 'Tuxedo',
    shortName: 'Tuxedo',
    descriptor: 'The pinnacle of formal evening wear.',
    image: 'https://images.unsplash.com/photo-1593030761757-71fae46af504?q=80&w=1000&auto=format&fit=crop',
    narrative: 'Crafted for the most prestigious occasions.',
    craftsmanship: 'Traditional canvassing and satin lapels.',
    packaging: 'Structured garment carrier with custom hangers.'
  },
  {
    id: 'jodhpuri',
    fullName: 'Jodhpuri',
    shortName: 'Jodhpuri',
    descriptor: 'Regal Jodhpuri jackets for a commanding presence.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop',
    narrative: 'A symbol of heritage and authority.',
    craftsmanship: 'Structured shoulders and hand-carved buttons.',
    packaging: 'Signature archival box with certificate.'
  },
  {
    id: 'koti-pant',
    fullName: 'Koti Pant',
    shortName: 'Koti Pant',
    descriptor: 'Indo-western fusion featuring tailored kotis and trousers.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
    narrative: 'The Koti Pant set is for the modern trendsetter.',
    craftsmanship: 'Sharp silhouettes and premium wool-silk blends.',
    packaging: 'Signature archival box presentation.'
  },
  {
    id: 'koti-kurta',
    fullName: 'Koti Kurta',
    shortName: 'Koti Kurta',
    descriptor: 'Traditional silhouettes with a modern koti layer.',
    image: 'https://images.unsplash.com/photo-1621335829175-95f437384d7c?q=80&w=1000&auto=format&fit=crop',
    narrative: 'A refined fusion of tradition and tailoring.',
    craftsmanship: 'Hand-finished kotis with intricate detailing.',
    packaging: 'Wrapped in custom silk dust bags.'
  },
  {
    id: 'kurta',
    fullName: 'Kurta',
    shortName: 'Kurta',
    descriptor: 'Timeless kurtas crafted from the finest silks and linens.',
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop',
    narrative: 'The soul of Luxardo lies in our classic kurtas.',
    craftsmanship: 'Precision cut and hand-finished seams.',
    packaging: 'Acid-free tissue wrapping in archival boxes.'
  },
  {
    id: 'casual',
    fullName: 'Casual',
    shortName: 'Casual',
    descriptor: 'Modern tailored shirts and trousers for daily luxury.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
    narrative: 'Our Casual collection defines contemporary workwear.',
    craftsmanship: 'Precision stitching and premium cotton blends.',
    packaging: 'Delivered in a signature Luxardo box.'
  }
];

// Generate 10 products for each category
const generateProducts = () => {
  const products: Product[] = [];
  const categories = [
    { name: '3 Piece Suit', prefix: '3s', basePrice: 85000 },
    { name: 'Tuxedo', prefix: 't', basePrice: 75000 },
    { name: 'Jodhpuri', prefix: 'j', basePrice: 65000 },
    { name: 'Koti Pant', prefix: 'kp', basePrice: 55000 },
    { name: 'Koti Kurta', prefix: 'kk', basePrice: 45000 },
    { name: 'Kurta', prefix: 'k', basePrice: 35000 },
    { name: 'Casual', prefix: 'c', basePrice: 25000 }
  ];

  const images = [
    'https://images.unsplash.com/photo-1593030761757-71fae46af504?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1621335829175-95f437384d7c?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop'
  ];

  categories.forEach(cat => {
    for (let i = 1; i <= 10; i++) {
      const mainImg = images[(i - 1) % images.length];
      const closeupImg = images[i % images.length];
      
      products.push({
        id: `${cat.prefix}${i}`,
        name: `${cat.name} Edition ${i}`,
        price: cat.basePrice + (i * 2000),
        category: cat.name,
        image: mainImg,
        images: [mainImg, closeupImg],
        description: `A masterpiece of ${cat.name} tailoring, featuring selected fabrics and artisan craftsmanship.`,
        fabricOrigin: i % 2 === 0 ? 'Italy' : 'India',
        readyToStitch: true,
        composition: '74% POLYESTER, 21% VISCOSE, 5% ELASTANE',
        washingCare: 'Do not wash\nDo not bleach\nIron at low temperature (max. 110°C)\nDry clean only\nDo not spin dry',
        shipping: 'Home delivery\n• 48h/72h working days\n• Spain: FREE shipping for orders of 69€ or more (Peninsula). For orders under 69€: 4,95€ (Peninsula) / 5,95€ (Balearic Islands). Orders for the Canary Islands: through the Banango.\n• Rest of the countries check here.\n\nDelivery at collection point\n• 3 to 5 days in Spain (peninsula). Free shipping for orders over 69€.',
        returns: 'Items can be returned within 14 days in original condition.',
        garmentFormat: 'This item is delivered as a premium ready-to-stitch fabric set in our signature presentation box. Please note that stitching is not included.',
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString()
      });
    }
  });

  return products;
};

export const PRODUCTS: Product[] = generateProducts();
