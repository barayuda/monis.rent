export interface ProductItem {
  id: string;
  name: string;
  priceUSD: number;
  priceIDR: number;
  description: string;
  category: 'desk' | 'chair' | 'tech' | 'eco' | 'coffee' | 'outdoor' | 'relax' | 'garage';
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

  // Coffee Station
  {
    id: 'coffee-machine',
    name: 'Barista Pro Espresso Maker',
    priceUSD: 12,
    priceIDR: 192000,
    description: 'Sleek compact espresso machine with high-pressure pump and built-in steam milk frother.',
    category: 'coffee',
    specs: ['15-bar Italian pump', 'Steam milk texturing wand', 'Thermoblock heating technology', 'Removable 1.2L water tank'],
  },
  {
    id: 'coffee-mug',
    name: 'Ceramic Nomad Mug',
    priceUSD: 3,
    priceIDR: 48000,
    description: 'Handcrafted matte-finish terracotta mug, perfect for local Bali coffee brews.',
    category: 'coffee',
    specs: ['320ml capacity', 'Handcrafted in Pejaten, Bali', 'Double-walled thermal insulation', 'Dishwasher safe'],
  },

  // Outdoor Gear
  {
    id: 'outdoor-surfboard',
    name: 'Canggu Custom Surfboard',
    priceUSD: 15,
    priceIDR: 240000,
    description: 'Custom shaped 6\'4" local resin tint surfboard, standing stylishly in your room or ready for Echo Beach.',
    category: 'outdoor',
    specs: ['6\'4" hybrid funboard', 'Local Balinese resin-tint design', 'FCS II thruster fin setup', 'Includes eco-friendly leash'],
  },
  {
    id: 'outdoor-scooter',
    name: 'Retro Honda Scoopy Scooter',
    priceUSD: 45,
    priceIDR: 720000,
    description: 'Vespa-inspired retro mint-green scooter to zip around Canggu short-cuts in ultimate style.',
    category: 'outdoor',
    specs: ['110cc automatic engine', 'Mint-green paint finish', 'Tan leather seat custom cover', 'Comes with two sanitized helmets'],
  },

  // Relax Zone
  {
    id: 'relax-beanbag',
    name: 'Tropical Hemp Bean Bag',
    priceUSD: 10,
    priceIDR: 160000,
    description: 'Premium teardrop hemp bean bag in terracotta color, ideal for taking micro-naps or reading.',
    category: 'relax',
    specs: ['100% organic hemp fabric', 'Ergonomic teardrop supportive design', 'Eco-friendly recycled foam filling', 'Terracotta rust color finish'],
  },
  {
    id: 'relax-speaker',
    name: 'Nomad Bass Bluetooth Speaker',
    priceUSD: 6,
    priceIDR: 96000,
    description: 'Rich audio delivery speaker wrapped in light sand woven fabric, bringing beachy vibes to your background.',
    category: 'relax',
    specs: ['30W deep-bass output', '20-hour rechargeable battery', 'IPX7 waterproof', 'Light sand woven mesh cover'],
  },

  // Garage Space
  {
    id: 'garage-shelf',
    name: 'Heavy Duty Gear Shelf',
    priceUSD: 14,
    priceIDR: 224000,
    description: 'Matte black powder-coated steel shelving unit to cleanly organize all your travel bags and gear.',
    category: 'garage',
    specs: ['4-tier load-bearing shelves', 'Matte black steel frames', 'Eco-treated sustainable teak shelves', 'Dimensions: 80 x 35 x 160 cm'],
  },
  {
    id: 'garage-pegboard',
    name: 'Workspace Pegboard Panel',
    priceUSD: 5,
    priceIDR: 80000,
    description: 'Wall-mounted pegboard with premium hooks, containers, and shelving modules for tools and cords.',
    category: 'garage',
    specs: ['Powder-coated steel back panel', '12 customizable pegs & hooks', '2 timber mini shelves included', 'Dimensions: 60 x 60 cm'],
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
    accessoryIds: ['eco-plant', 'eco-lamp', 'tech-input', 'coffee-mug', 'outdoor-surfboard'],
  },
  {
    id: 'preset-canggu',
    name: 'Canggu Indie Hacker',
    description: 'Power-packed tech setup featuring high-productivity screen space and pristine audio to ship fast.',
    deskId: 'desk-walnut',
    chairId: 'chair-nomad',
    accessoryIds: ['tech-ultrawide', 'tech-input', 'tech-audio', 'eco-plant', 'coffee-machine', 'relax-speaker'],
  },
  {
    id: 'preset-seminyak',
    name: 'Seminyak Power Exec',
    description: 'Sophisticated dual-display configuration paired with premium vegan leather comfort for managing digital businesses.',
    deskId: 'desk-walnut',
    chairId: 'chair-nomad',
    accessoryIds: ['tech-dual', 'tech-audio', 'eco-lamp', 'eco-plant', 'tech-input', 'outdoor-scooter', 'relax-beanbag', 'garage-pegboard'],
  },
];
