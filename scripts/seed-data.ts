// SAMPLE DATA — Appendix C
// This file provides the canonical initial seed dataset for Pawansut Trader.
// All items are clearly flagged as sample data and will be replaced or managed via admin.

import type { Product, Category, Announcement, StoreSettings, Coupon } from "@/types";

export const SAMPLE_CATEGORIES: Category[] = [
  { id: "cat-chargers", name: "Chargers & Adapters", slug: "chargers-adapters", order: 1 },
  { id: "cat-cables", name: "Cables", slug: "cables", order: 2 },
  { id: "cat-audio", name: "Earphones & Headphones", slug: "earphones-headphones", order: 3 },
  { id: "cat-powerbanks", name: "Power Banks", slug: "power-banks", order: 4 },
  { id: "cat-cases", name: "Phone Cases & Covers", slug: "cases-covers", order: 5 },
  { id: "cat-screen", name: "Screen Protectors", slug: "screen-protectors", order: 6 },
  { id: "cat-stands", name: "Holders & Stands", slug: "holders-stands", order: 7 },
  { id: "cat-storage", name: "Memory Cards & Storage", slug: "memory-storage", order: 8 },
];

export const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    text: "Free delivery on all orders above ₹499 across hospital campus!",
    link: "/products",
    isActive: true,
    order: 1,
  },
  {
    id: "ann-2",
    text: "Fast doorstep delivery at Satyawadi Raja Harish Chandra Hospital, Delhi.",
    link: "/contact",
    isActive: true,
    order: 2,
  },
];

export const SAMPLE_STORE_SETTINGS: StoreSettings = {
  storeName: "Pawansut Trader",
  whatsappNumber: "8505856763",
  freeDeliveryAbove: 499,
  deliveryCharge: 80,
  restrictDeliveryToHospital: true,
  deliveryLocationName: "Satyawadi Raja Harish Chandra Hospital, Delhi",
  supportEmail: "support@pawansuttrader.com",
  address: "Satyawadi Raja Harish Chandra Hospital Area, Narela, Delhi - 110040",
};

export const SAMPLE_COUPON: Coupon = {
  code: "WELCOME10",
  type: "percent",
  value: 10,
  minOrder: 299,
  maxDiscount: 100,
  usageLimit: 500,
  usedCount: 0,
  isActive: false, // Inactive by default per Appendix C
};

export const SAMPLE_PRODUCTS: Product[] = [
  // 1. Charger with Warranty enabled & New badge
  {
    id: "prod-fast-charger-30w",
    name: "30W Super Fast GaN Wall Charger",
    slug: "30w-super-fast-gan-wall-charger",
    shortDescription: "Ultra-compact Type-C PD adapter with intelligent heat protection.",
    description:
      "Powered by Gallium Nitride (GaN) technology, this 30W wall charger delivers high-speed power delivery for iPhones, Android flagships, and tablets in a form factor 40% smaller than standard bricks. Includes multi-layer surge and overheating protection.",
    images: ["/sample/charger-30w.png"],
    category: "chargers-adapters",
    tags: ["charger", "gan", "fast charging", "type-c", "pd"],
    price: 649,
    mrp: 999,
    specs: [
      { label: "Output Power", value: "30W Max (PD 3.0 / QC 4.0)" },
      { label: "Port Type", value: "USB Type-C" },
      { label: "Input", value: "100-240V ~ 50/60Hz" },
      { label: "Technology", value: "GaN Fast Charge" },
    ],
    variants: [
      { id: "var-c30-white", label: "Polar White", color: "White", stock: 15 },
      { id: "var-c30-black", label: "Matte Black", color: "Black", stock: 8 },
    ],
    warranty: {
      enabled: true,
      months: 6,
      note: "6 months manufacturer replacement warranty.",
    },
    isActive: true,
    isFeatured: true,
    isNew: true,
    ratingAvg: 4.8,
    ratingCount: 24,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now(),
  },

  // 2. Braided Cable with Variants (lengths) & Warranty
  {
    id: "prod-braided-type-c-cable",
    name: "ToughBraided 65W Type-C to Type-C Cable",
    slug: "toughbraided-65w-type-c-cable",
    shortDescription: "Military-grade braided charging and high-speed data transfer cable.",
    description:
      "Reinforced with Kevlar ballistic fiber, this 65W fast-charging cable endures over 25,000 bends. Supports 480Mbps data sync and seamless Power Delivery charging for phones and laptops.",
    images: ["/sample/cable-c-to-c.png"],
    category: "cables",
    tags: ["cable", "type-c", "65w", "fast charging", "durable"],
    price: 249,
    mrp: 499,
    specs: [
      { label: "Max Wattage", value: "65W (20V/3.25A)" },
      { label: "Connector", value: "Type-C to Type-C" },
      { label: "Material", value: "Nylon Braided + Zinc Alloy" },
      { label: "Bend Lifespan", value: "25,000+ bends" },
    ],
    variants: [
      { id: "var-cable-1m", label: "1.0 Meter", size: "1m", stock: 30, priceOverride: 249 },
      { id: "var-cable-2m", label: "2.0 Meters", size: "2m", stock: 12, priceOverride: 349 },
    ],
    warranty: {
      enabled: true,
      months: 12,
      note: "1 year hassle-free replacement warranty.",
    },
    isActive: true,
    isFeatured: true,
    isNew: false,
    ratingAvg: 4.9,
    ratingCount: 38,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    updatedAt: Date.now(),
  },

  // 3. Wireless Earbuds with Warranty
  {
    id: "prod-tws-air-buds",
    name: "AirSound Pro True Wireless Earbuds",
    slug: "airsound-pro-tws-earbuds",
    shortDescription: "Quad-mic ENC with deep bass and 36-hour combined battery life.",
    description:
      "Experience studio-quality audio with 13mm titanium drivers. Environmental Noise Cancellation (ENC) ensures crystal-clear voice calls even in noisy surroundings. Type-C fast recharge gives 120 minutes of play from a 10-minute charge.",
    images: ["/sample/earbuds-tws.png"],
    category: "earphones-headphones",
    tags: ["audio", "earbuds", "bluetooth", "tws", "enc"],
    price: 1199,
    mrp: 2499,
    specs: [
      { label: "Bluetooth", value: "v5.3 Low Latency" },
      { label: "Playtime", value: "Up to 36 Hours (with case)" },
      { label: "Drivers", value: "13mm Titanium" },
      { label: "Water Resistance", value: "IPX5 Splashproof" },
    ],
    variants: [
      { id: "var-tws-black", label: "Midnight Black", color: "Black", stock: 9 },
      { id: "var-tws-white", label: "Glossy White", color: "White", stock: 4 },
    ],
    warranty: {
      enabled: true,
      months: 6,
      note: "6 months warranty on audio drivers and battery.",
    },
    isActive: true,
    isFeatured: true,
    isNew: true,
    ratingAvg: 4.7,
    ratingCount: 19,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now(),
  },

  // 4. Power Bank with Low Stock / Out of Stock variant
  {
    id: "prod-powerbank-10000mah",
    name: "SlimPower 10,000mAh 22.5W Power Bank",
    slug: "slimpower-10000mah-power-bank",
    shortDescription: "Pocket-sized dual output external battery with LED power display.",
    description:
      "Ultra-slim aircraft-grade aluminum alloy power bank capable of charging smartphones 2 to 3 times over. Supports QC 3.0 and PD 22.5W 2-way rapid charging.",
    images: ["/sample/powerbank-10k.png"],
    category: "power-banks",
    tags: ["powerbank", "battery", "22.5w", "portable", "type-c"],
    price: 999,
    mrp: 1799,
    specs: [
      { label: "Capacity", value: "10,000mAh / 37Wh" },
      { label: "Input", value: "Type-C (18W PD)" },
      { label: "Output", value: "USB-A (22.5W) + Type-C (20W PD)" },
      { label: "Display", value: "Digital LED Battery Indicator" },
    ],
    variants: [
      { id: "var-pb-grey", label: "Space Grey", color: "Space Grey", stock: 2 }, // Low stock (<= 3 triggers low-stock badge)
    ],
    warranty: {
      enabled: true,
      months: 6,
      note: "6 months replacement warranty against technical defects.",
    },
    isActive: true,
    isFeatured: false,
    isNew: false,
    ratingAvg: 4.6,
    ratingCount: 15,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    updatedAt: Date.now(),
  },

  // 5. Out-of-Stock Product (to test out-of-stock acceptance check)
  {
    id: "prod-magnetic-car-holder",
    name: "MagGrip 360° Magnetic Dashboard Car Mount",
    slug: "maggrip-360-magnetic-car-mount",
    shortDescription: "Heavy-duty neodymium magnetic phone holder for cars.",
    description:
      "Features 6 ultra-strong N52 neodymium magnets capable of securely holding any phone even over bumpy roads. 360-degree ball joint allows optimal viewing angles.",
    images: ["/sample/car-mount.png"],
    category: "holders-stands",
    tags: ["car holder", "magnetic", "stand", "mount"],
    price: 349,
    mrp: 699,
    specs: [
      { label: "Mount Type", value: "Dashboard / Air Vent Dual Clip" },
      { label: "Magnets", value: "6x N52 Neodymium" },
      { label: "Rotation", value: "360-degree rotation" },
    ],
    variants: [
      { id: "var-mount-default", label: "Standard", stock: 0 }, // OUT OF STOCK
    ],
    warranty: {
      enabled: false,
      months: 0,
    },
    isActive: true,
    isFeatured: false,
    isNew: false,
    ratingAvg: 4.5,
    ratingCount: 8,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now(),
  },

  // 6. iPhone Case with Models
  {
    id: "prod-shockproof-clear-case",
    name: "ArmorShield Crystal Clear Shockproof Case",
    slug: "armorshield-crystal-clear-case",
    shortDescription: "Yellowing-resistant transparent case with 4-corner air cushions.",
    description:
      "Engineered with anti-yellowing Bayer TPU and 2mm raised camera bezels. Tested to survive 8-foot drops without cracking.",
    images: ["/sample/phone-case.png"],
    category: "cases-covers",
    tags: ["case", "cover", "shockproof", "clear"],
    price: 199,
    mrp: 499,
    specs: [
      { label: "Material", value: "Bayer TPU + Polycarbonate back" },
      { label: "Protection", value: "8ft Drop Tested" },
      { label: "Bezel", value: "2.0mm Camera & 1.2mm Screen lip" },
    ],
    variants: [
      { id: "var-case-ip13", label: "iPhone 13 / 14", size: "iPhone 13/14", stock: 20 },
      { id: "var-case-ip15", label: "iPhone 15", size: "iPhone 15", stock: 15 },
      { id: "var-case-ip15pro", label: "iPhone 15 Pro", size: "iPhone 15 Pro", stock: 10 },
    ],
    warranty: {
      enabled: false,
      months: 0,
    },
    isActive: true,
    isFeatured: false,
    isNew: true,
    ratingAvg: 4.6,
    ratingCount: 11,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    updatedAt: Date.now(),
  },

  // 7. Screen Protector (Tempered Glass)
  {
    id: "prod-9h-tempered-glass",
    name: "9H Edge-to-Edge Tempered Glass Screen Guard",
    slug: "9h-edge-to-edge-tempered-glass",
    shortDescription: "Oleophobic coated shatterproof glass with easy installation frame.",
    description:
      "9H hardness glass provides true edge-to-edge full coverage. Electroplated oleophobic coating resists fingerprints and oil smudges.",
    images: ["/sample/tempered-glass.png"],
    category: "screen-protectors",
    tags: ["tempered glass", "screen guard", "9h", "protection"],
    price: 149,
    mrp: 299,
    specs: [
      { label: "Hardness", value: "9H Scratch Resistant" },
      { label: "Thickness", value: "0.33mm Ultra-thin" },
      { label: "Transparency", value: "99.9% HD Clarity" },
    ],
    variants: [
      { id: "var-glass-default", label: "Full HD Clear", stock: 45 },
    ],
    warranty: {
      enabled: false,
      months: 0,
    },
    isActive: true,
    isFeatured: false,
    isNew: false,
    ratingAvg: 4.8,
    ratingCount: 29,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now(),
  },

  // 8. Memory Card
  {
    id: "prod-micro-sd-card-64gb",
    name: "UltraSpeed 64GB MicroSDXC Class 10 Card",
    slug: "ultraspeed-64gb-microsdxc-card",
    shortDescription: "Up to 100MB/s read speed, Full HD video recording supported.",
    description:
      "Reliable external flash storage for smartphones, action cameras, and tablets. Shockproof, waterproof, and X-ray proof design protects your memories.",
    images: ["/sample/sd-card.png"],
    category: "memory-storage",
    tags: ["memory card", "microsd", "64gb", "storage", "class 10"],
    price: 449,
    mrp: 799,
    specs: [
      { label: "Speed Class", value: "UHS-I Class 10 (U1 / V10)" },
      { label: "Read Speed", value: "Up to 100MB/s" },
      { label: "Durability", value: "Water, temperature, and shock resistant" },
    ],
    variants: [
      { id: "var-sd-64", label: "64GB", size: "64GB", stock: 18, priceOverride: 449 },
      { id: "var-sd-128", label: "128GB", size: "128GB", stock: 10, priceOverride: 799 },
    ],
    warranty: {
      enabled: true,
      months: 24,
      note: "2-year manufacturer limited warranty.",
    },
    isActive: true,
    isFeatured: true,
    isNew: false,
    ratingAvg: 4.9,
    ratingCount: 42,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    updatedAt: Date.now(),
  },
];
