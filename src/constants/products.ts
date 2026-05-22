export interface ProductItem {
  id: string;
  name: string;
  priceUSD: number;
  priceIDR: number;
  description: string;
  category: 'desk' | 'chair' | 'tech' | 'eco';
  specs: string[];
}

export const PRODUCTS: ProductItem[] = [
  // Desks
  {
    id: 'desk-bamboo',
    name: 'Bamboo Smart Desk',
    priceUSD: 25,
    priceIDR: 400000,
    description: 'Eco-friendly sustainable bamboo top with smooth dual-motor standing height adjustments.',
    category: 'desk',
    specs: ['Size: 140x70 cm', 'Dual-motor (70-120cm height range)', 'Natural bamboo finish', 'Built-in wire management tray'],
  },
  {
    id: 'desk-walnut',
    name: 'Walnut Executive Desk',
    priceUSD: 35,
    priceIDR: 560000,
    description: 'Premium dark-stained walnut solid wood desk with an elegant matte black structural frame.',
    category: 'desk',
    specs: ['Size: 150x75 cm', 'Solid walnut hardwood', 'Heavy-duty steel legs', 'Grommet holes for clean routing'],
  },

  // Chairs
  {
    id: 'chair-ergo',
    name: 'ErgoFit Breeze Chair',
    priceUSD: 20,
    priceIDR: 320000,
    description: 'High-breathability ocean teal mesh backrest with fully adjustable armrests and dynamic lumbar support.',
    category: 'chair',
    specs: ['Breathable elastic mesh', 'Adjustable 3D armrests', 'Tilt locking mechanism', 'Weight-activated tension control'],
  },
  {
    id: 'chair-nomad',
    name: 'Premium Nomad Chair',
    priceUSD: 28,
    priceIDR: 448000,
    description: 'Luxurious padded executive chair with soft vegan tan leather, perfect for longer coding sessions.',
    category: 'chair',
    specs: ['Tan vegan leather', 'High density memory foam padding', 'Ergonomic synchronized tilt', 'Soft-glide wooden casters'],
  },

  // Tech / Accessories
  {
    id: 'tech-ultrawide',
    name: '34" Curved Ultrawide Monitor',
    priceUSD: 18,
    priceIDR: 288000,
    description: 'Immersive 1500R curved display with crystal clear WQHD resolution, boosting layout real-estate.',
    category: 'tech',
    specs: ['34-inch WQHD (3440 x 1440)', '100Hz refresh rate', 'USB-C hub (65W power delivery)', 'Anti-glare screen filter'],
  },
  {
    id: 'tech-dual',
    name: 'Dual 27" Multi-Monitor Setup',
    priceUSD: 22,
    priceIDR: 352000,
    description: 'Side-by-side high definition IPS displays mounted on an adjustable dual gas-spring desktop arm.',
    category: 'tech',
    specs: ['2x 27-inch QHD IPS displays', 'Dual gas-spring monitor arm', 'Daisy-chain DisplayPort cables', 'Fully pivotable (horizontal/vertical)'],
  },
  {
    id: 'tech-input',
    name: 'Nomad Tech Input Pack',
    priceUSD: 8,
    priceIDR: 128000,
    description: 'Hot-swappable 75% mechanical keyboard with a gorgeous bamboo housing and matching wireless wood-shell mouse.',
    category: 'tech',
    specs: ['75% layout mechanical keyboard', 'Pre-lubed silent switches', 'Natural wood-shell ergonomic mouse', 'Dual-mode wireless + Type-C connection'],
  },
  {
    id: 'tech-audio',
    name: 'Premium Audio Pack',
    priceUSD: 10,
    priceIDR: 160000,
    description: 'Audiophile studio monitor speakers paired with comfortable active noise cancelling over-ear headphones on a wood stand.',
    category: 'tech',
    specs: ['Active 3-inch reference monitors', 'Wireless ANC over-ear headphones', 'Solid oak headwear display stand', 'Premium coiled audio patch cables'],
  },

  // Eco & Ambience
  {
    id: 'eco-lamp',
    name: 'Smart Ambient LED Lamp',
    priceUSD: 6,
    priceIDR: 96000,
    description: 'Sleek matte cream desk lamp with dimmable warm glow and dynamic RGB under-desk glow option.',
    category: 'eco',
    specs: ['Dimmable warm glow (2700K - 6500K)', 'RGB accent base integration', 'Touch controls', 'Built-in wireless phone charger'],
  },
  {
    id: 'eco-plant',
    name: 'Tropical Monstera Plant',
    priceUSD: 4,
    priceIDR: 64000,
    description: 'Vibrant local split-leaf Monstera Deliciosa in a minimalist terracotta pot, bringing natural life to your setup.',
    category: 'eco',
    specs: ['Vibrant split-leaf plant', 'Locally sourced terracotta pot', 'Air purifying foliage', 'Low-maintenance, perfect for remote workers'],
  },
];

export interface LeaseOption {
  durationMonths: number;
  label: string;
  discountPercentage: number;
}

export const LEASE_OPTIONS: LeaseOption[] = [
  { durationMonths: 1, label: '1 Month', discountPercentage: 0 },
  { durationMonths: 3, label: '3 Months (Save 5%)', discountPercentage: 5 },
  { durationMonths: 6, label: '6 Months (Save 15%)', discountPercentage: 15 },
  { durationMonths: 12, label: '12 Months (Save 25%)', discountPercentage: 25 },
];

export interface PresetWorkspace {
  id: string;
  name: string;
  description: string;
  deskId: string;
  chairId: string;
  accessoryIds: string[];
}

export const PRESET_WORKSPACES: PresetWorkspace[] = [
  {
    id: 'preset-ubud',
    name: 'Ubud Eco Minimalist',
    description: 'A soothing workspace designed with natural wood, sustainable bamboo, and lush green plants to clear your mind.',
    deskId: 'desk-bamboo',
    chairId: 'chair-ergo',
    accessoryIds: ['eco-plant', 'eco-lamp', 'tech-input'],
  },
  {
    id: 'preset-canggu',
    name: 'Canggu Indie Hacker',
    description: 'Power-packed tech setup featuring high-productivity screen space and pristine audio to ship fast.',
    deskId: 'desk-walnut',
    chairId: 'chair-nomad',
    accessoryIds: ['tech-ultrawide', 'tech-input', 'tech-audio', 'eco-plant'],
  },
  {
    id: 'preset-seminyak',
    name: 'Seminyak Power Exec',
    description: 'Sophisticated dual-display configuration paired with premium vegan leather comfort for managing digital businesses.',
    deskId: 'desk-walnut',
    chairId: 'chair-nomad',
    accessoryIds: ['tech-dual', 'tech-audio', 'eco-lamp', 'eco-plant', 'tech-input'],
  },
];
