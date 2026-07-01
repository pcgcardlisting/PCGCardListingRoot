// Product bucket data — edit this file to update your shop categories and items
// Images: replace the imageUrl with a real URL (upload to imgur, cloudinary, etc.)

export interface Product {
  id: string;
  name: string;
  description: string;
  price?: string;
  imageUrl?: string; // leave empty to show placeholder
  tiktokUrl?: string; // if set, overrides the global TikTok link
  badge?: string; // e.g. "NEW", "SOLD OUT", "POPULAR"
}

export interface ProductBucket {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string; // tailwind bg class for the bucket header
  products: Product[];
}

// ─── YOUR TIKTOK SHOP LINK ───────────────────────────────────────────────────
// Replace with your real TikTok URL
export const TIKTOK_URL = "https://www.tiktok.com/@YOUR_TIKTOK_HERE";

// ─── PRODUCT BUCKETS ─────────────────────────────────────────────────────────
// Add, remove or edit buckets and products here
export const PRODUCT_BUCKETS: ProductBucket[] = [
  {
    id: "resin-crafts",
    title: "Resin Crafts",
    description: "Handmade resin creations — keychains, coasters, bookmarks & more",
    icon: "✨",
    color: "bg-rose-50 border-rose-200",
    products: [
      {
        id: "resin-1",
        name: "Coming Soon",
        description: "Add your resin craft product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
      {
        id: "resin-2",
        name: "Coming Soon",
        description: "Add your resin craft product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
      {
        id: "resin-3",
        name: "Coming Soon",
        description: "Add your resin craft product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
    ],
  },
  {
    id: "tumblers",
    title: "Custom Tumblers",
    description: "Personalised tumblers, cups & drinkware",
    icon: "🥤",
    color: "bg-purple-50 border-purple-200",
    products: [
      {
        id: "tumbler-1",
        name: "Coming Soon",
        description: "Add your tumbler product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
      {
        id: "tumbler-2",
        name: "Coming Soon",
        description: "Add your tumbler product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
    ],
  },
  {
    id: "sublimation",
    title: "Sublimation Prints",
    description: "Custom sublimation designs on shirts, mugs & more",
    icon: "🎨",
    color: "bg-amber-50 border-amber-200",
    products: [
      {
        id: "sub-1",
        name: "Coming Soon",
        description: "Add your sublimation product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
      {
        id: "sub-2",
        name: "Coming Soon",
        description: "Add your sublimation product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
    ],
  },
  {
    id: "tcg-crafts",
    title: "TCG Card Accessories",
    description: "Handmade card sleeves, holders, binders & display stands",
    icon: "🃏",
    color: "bg-indigo-50 border-indigo-200",
    products: [
      {
        id: "tcg-craft-1",
        name: "Coming Soon",
        description: "Add your card accessory product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
      {
        id: "tcg-craft-2",
        name: "Coming Soon",
        description: "Add your card accessory product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
    ],
  },
  {
    id: "seasonal",
    title: "Seasonal & Gifts",
    description: "Holiday specials, gift sets & custom orders",
    icon: "🎁",
    color: "bg-green-50 border-green-200",
    products: [
      {
        id: "seasonal-1",
        name: "Coming Soon",
        description: "Add your seasonal product here",
        imageUrl: "",
        badge: "COMING SOON",
      },
    ],
  },
];
