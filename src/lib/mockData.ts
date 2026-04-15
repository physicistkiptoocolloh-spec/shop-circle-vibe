export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  description: string;
  condition: "New" | "Like New" | "Used" | "Refurbished";
  category: string;
  location: string;
  shipping: boolean;
  sellerId: string;
  createdAt: string;
  views: number;
  isBoosted: boolean;
  isSoldOut: boolean;
  isArchived: boolean;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string | null;
  avatarIcon: string;
  description: string;
  location: string;
  phone: string;
  joinedYear: number;
  isVerified: boolean;
  verificationTier: number;
  boostTier: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
  reportCount: number;
  isBanned: boolean;
  banReason?: string;
  country: string;
  postsThisWeek: number;
  productsUploaded: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userAvatarIcon: string;
  rating: number;
  text: string;
  createdAt: string;
  likes: number;
  likedByUser: boolean;
  replies: ReviewReply[];
}

export interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  text: string;
  createdAt: string;
  isSeller: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  participantAvatarIcon: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface BoostTier {
  id: number;
  name: string;
  price: number;
  currency: string;
  viewsPerDay: number;
  benefits: string[];
  color: string;
}

export interface VerificationTier {
  id: number;
  name: string;
  price: number;
  currency: string;
  benefits: string[];
  color: string;
  badgeIcon: string;
  trialDays: number;
}

export const BOOST_TIERS: BoostTier[] = [
  { id: 1, name: "Starter Boost", price: 500, currency: "KES", viewsPerDay: 200, color: "hsl(24 95% 53%)", benefits: ["200 views/day", "Priority in category", "Boost badge", "7-day duration", "Basic analytics", "Category highlight", "Search priority +1", "Featured in new", "Daily refresh", "Email report"] },
  { id: 2, name: "Growth Boost", price: 1000, currency: "KES", viewsPerDay: 400, color: "hsl(45 93% 47%)", benefits: ["400 views/day", "Top of category", "Gold boost badge", "14-day duration", "Advanced analytics", "Homepage feature", "Search priority +3", "Push notifications", "Social sharing boost", "Weekly report"] },
  { id: 3, name: "Pro Boost", price: 2000, currency: "KES", viewsPerDay: 600, color: "hsl(142 71% 45%)", benefits: ["600 views/day", "Featured banner", "Pro badge", "30-day duration", "Full analytics", "All categories feature", "Search priority +5", "Auto-renew option", "Priority support", "Monthly report"] },
  { id: 4, name: "Premium Boost", price: 3500, currency: "KES", viewsPerDay: 800, color: "hsl(200 80% 50%)", benefits: ["800 views/day", "Premium placement", "Diamond badge", "45-day duration", "Real-time analytics", "Cross-category feature", "Search priority +8", "Dedicated account mgr", "Custom scheduling", "ROI tracking"] },
  { id: 5, name: "Enterprise Boost", price: 5000, currency: "KES", viewsPerDay: 1000, color: "hsl(280 80% 55%)", benefits: ["1000 views/day", "Exclusive top spot", "Crown badge", "60-day duration", "AI-powered analytics", "Platform-wide feature", "Search priority +10", "24/7 priority support", "Multi-product boost", "Revenue dashboard"] },
];

export const VERIFICATION_TIERS: VerificationTier[] = [
  { id: 1, name: "Basic Verified", price: 300, currency: "KES", trialDays: 3, color: "hsl(200 80% 50%)", badgeIcon: "ShieldCheck", benefits: ["Blue checkmark", "Verified badge on profile", "Trust score boost +10", "Priority in search", "Verified label on products", "Basic fraud protection", "Monthly verification renewal", "Report priority", "Trusted seller label", "Profile highlight"] },
  { id: 2, name: "Pro Verified", price: 800, currency: "KES", trialDays: 3, color: "hsl(142 71% 45%)", badgeIcon: "ShieldPlus", benefits: ["Green checkmark", "Pro verified badge", "Trust score boost +25", "Top search placement", "Verified + Pro labels", "Advanced fraud protection", "ID verification", "Priority dispute resolution", "Featured seller section", "Quarterly review"] },
  { id: 3, name: "Business Verified", price: 1500, currency: "KES", trialDays: 3, color: "hsl(45 93% 47%)", badgeIcon: "Award", benefits: ["Gold checkmark", "Business badge", "Trust score boost +50", "Business profile page", "Bulk listing tools", "Dedicated support", "Business analytics", "Tax invoice support", "Multi-user access", "Annual verification"] },
  { id: 4, name: "Premium Verified", price: 3000, currency: "KES", trialDays: 3, color: "hsl(24 95% 53%)", badgeIcon: "Crown", benefits: ["Orange diamond badge", "Premium verified status", "Trust score boost +75", "VIP placement", "Unlimited listings", "Personal account manager", "Premium analytics", "API access", "White-label options", "Lifetime verification"] },
  { id: 5, name: "Enterprise Verified", price: 5000, currency: "KES", trialDays: 3, color: "hsl(280 80% 55%)", badgeIcon: "Gem", benefits: ["Purple crown badge", "Enterprise status", "Trust score boost +100", "Exclusive placement", "Unlimited everything", "24/7 dedicated support", "Enterprise analytics", "Custom branding", "SLA guarantee", "Board-level verification"] },
];

export const CATEGORIES = [
  "Electronics", "Fashion", "Home & Garden", "Vehicles", "Sports",
  "Health & Beauty", "Books", "Toys", "Food & Drinks", "Services",
  "Real Estate", "Jobs", "Pets", "Music", "Art",
];

export const COUNTRIES = [
  "Kenya", "Uganda", "Tanzania", "Rwanda", "Ethiopia", "Nigeria",
  "Ghana", "South Africa", "Egypt", "Morocco", "Cameroon", "Senegal",
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "India", "Brazil", "Japan", "China", "Mexico", "Italy",
  "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Poland", "Turkey", "Saudi Arabia", "UAE", "Singapore", "Malaysia",
  "Philippines", "Indonesia", "Thailand", "Vietnam", "South Korea",
  "Argentina", "Chile", "Colombia", "Peru", "New Zealand", "Ireland",
  "Portugal", "Belgium", "Switzerland",
];

export const AVATAR_ICONS = [
  "User", "Smile", "Heart", "Star", "Sun", "Moon", "Zap", "Flame", "Leaf", "Ghost",
];

const productImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
  "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  "https://images.unsplash.com/photo-1434389677669-e08b4cda3db0?w=400",
];

export const MOCK_SELLERS: Seller[] = [
  { id: "s1", name: "Jane Wanjiku", avatar: null, avatarIcon: "Smile", description: "Trusted seller of electronics & gadgets since 2020. Fast delivery across Nairobi.", location: "Nairobi, Kenya", phone: "+254712345678", joinedYear: 2020, isVerified: true, verificationTier: 2, boostTier: 1, totalSales: 234, rating: 4.7, reviewCount: 89, reportCount: 0, isBanned: false, country: "Kenya", postsThisWeek: 1, productsUploaded: 3 },
  { id: "s2", name: "Brian Odhiambo", avatar: null, avatarIcon: "Zap", description: "Your one-stop shop for fashion and accessories. Quality guaranteed!", location: "Mombasa, Kenya", phone: "+254723456789", joinedYear: 2021, isVerified: true, verificationTier: 3, boostTier: 2, totalSales: 567, rating: 4.9, reviewCount: 201, reportCount: 0, isBanned: false, country: "Kenya", postsThisWeek: 2, productsUploaded: 3 },
  { id: "s3", name: "Mary Achieng", avatar: null, avatarIcon: "Heart", description: "Handmade crafts and home decor. Every piece tells a story.", location: "Kisumu, Kenya", phone: "+254734567890", joinedYear: 2022, isVerified: false, verificationTier: 0, boostTier: 0, totalSales: 45, rating: 4.2, reviewCount: 18, reportCount: 1, isBanned: false, country: "Kenya", postsThisWeek: 0, productsUploaded: 2 },
  { id: "s4", name: "DangerShop254", avatar: null, avatarIcon: "Flame", description: "Electronics and phones at best prices.", location: "Nakuru, Kenya", phone: "+254745678901", joinedYear: 2023, isVerified: false, verificationTier: 0, boostTier: 0, totalSales: 12, rating: 2.1, reviewCount: 8, reportCount: 4, isBanned: false, country: "Kenya", postsThisWeek: 1, productsUploaded: 1 },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "p1", title: "Samsung Galaxy S24 Ultra", price: 145000, currency: "KES", images: [productImages[0], productImages[1], productImages[2]], description: "Brand new Samsung Galaxy S24 Ultra, 256GB, Titanium Black. Original with warranty.", condition: "New", category: "Electronics", location: "Nairobi, Kenya", shipping: true, sellerId: "s1", createdAt: "2026-04-14T10:00:00Z", views: 342, isBoosted: true, isSoldOut: false, isArchived: false },
  { id: "p2", title: "Nike Air Max 270", price: 8500, currency: "KES", images: [productImages[2], productImages[6]], description: "Authentic Nike Air Max 270, Size 42. Worn twice, in excellent condition.", condition: "Like New", category: "Fashion", location: "Mombasa, Kenya", shipping: true, sellerId: "s2", createdAt: "2026-04-13T14:00:00Z", views: 189, isBoosted: false, isSoldOut: false, isArchived: false },
  { id: "p3", title: "MacBook Pro M3 14\"", price: 225000, currency: "KES", images: [productImages[3], productImages[0]], description: "MacBook Pro M3, 16GB RAM, 512GB SSD. Perfect for professionals.", condition: "New", category: "Electronics", location: "Nairobi, Kenya", shipping: true, sellerId: "s1", createdAt: "2026-04-12T08:00:00Z", views: 567, isBoosted: true, isSoldOut: false, isArchived: false },
  { id: "p4", title: "Handmade Beaded Necklace", price: 1200, currency: "KES", images: [productImages[4], productImages[5]], description: "Beautiful handcrafted Maasai beaded necklace. Perfect gift.", condition: "New", category: "Fashion", location: "Kisumu, Kenya", shipping: true, sellerId: "s3", createdAt: "2026-04-11T16:00:00Z", views: 78, isBoosted: false, isSoldOut: false, isArchived: false },
  { id: "p5", title: "Sony WH-1000XM5 Headphones", price: 32000, currency: "KES", images: [productImages[8], productImages[9]], description: "Industry-leading noise cancellation. Barely used for 2 weeks.", condition: "Like New", category: "Electronics", location: "Nairobi, Kenya", shipping: true, sellerId: "s2", createdAt: "2026-04-10T12:00:00Z", views: 234, isBoosted: true, isSoldOut: false, isArchived: false },
  { id: "p6", title: "Vintage Leather Bag", price: 4500, currency: "KES", images: [productImages[7], productImages[10]], description: "Genuine leather messenger bag. Classic vintage style.", condition: "Used", category: "Fashion", location: "Mombasa, Kenya", shipping: false, sellerId: "s2", createdAt: "2026-04-09T09:00:00Z", views: 156, isBoosted: false, isSoldOut: false, isArchived: false },
  { id: "p7", title: "iPhone 15 Pro Max 256GB", price: 165000, currency: "KES", images: [productImages[11], productImages[0], productImages[1]], description: "Brand new sealed iPhone 15 Pro Max. Natural Titanium.", condition: "New", category: "Electronics", location: "Nairobi, Kenya", shipping: true, sellerId: "s1", createdAt: "2026-04-08T18:00:00Z", views: 890, isBoosted: true, isSoldOut: false, isArchived: false },
  { id: "p8", title: "Gaming Chair Pro", price: 15000, currency: "KES", images: [productImages[5], productImages[3]], description: "Ergonomic gaming chair with lumbar support. Great for long sessions.", condition: "New", category: "Home & Garden", location: "Nakuru, Kenya", shipping: true, sellerId: "s4", createdAt: "2026-04-07T11:00:00Z", views: 67, isBoosted: false, isSoldOut: false, isArchived: false },
];

export const MOCK_REVIEWS: Review[] = [
  { id: "r1", productId: "p1", userId: "u1", userName: "Peter Mwangi", userAvatar: null, userAvatarIcon: "Star", rating: 5, text: "Excellent phone! Arrived in perfect condition. Seller was very responsive.", createdAt: "2026-04-14T15:00:00Z", likes: 12, likedByUser: false, replies: [{ id: "rr1", userId: "s1", userName: "Jane Wanjiku", userAvatar: null, text: "Thank you Peter! Glad you love it 🙏", createdAt: "2026-04-14T16:00:00Z", isSeller: true }] },
  { id: "r2", productId: "p1", userId: "u2", userName: "Sarah Njeri", userAvatar: null, userAvatarIcon: "Heart", rating: 4, text: "Good product, delivery took a bit long but overall satisfied.", createdAt: "2026-04-13T10:00:00Z", likes: 5, likedByUser: false, replies: [] },
  { id: "r3", productId: "p2", userId: "u3", userName: "Kevin Otieno", userAvatar: null, userAvatarIcon: "Zap", rating: 5, text: "Original Nike shoes! Very comfortable. Highly recommend this seller.", createdAt: "2026-04-12T09:00:00Z", likes: 8, likedByUser: true, replies: [{ id: "rr2", userId: "s2", userName: "Brian Odhiambo", userAvatar: null, text: "Asante sana Kevin! Welcome back anytime!", createdAt: "2026-04-12T10:00:00Z", isSeller: true }] },
  { id: "r4", productId: "p3", userId: "u4", userName: "Angela Wambui", userAvatar: null, userAvatarIcon: "Sun", rating: 5, text: "This MacBook is a beast! Fast shipping and great communication.", createdAt: "2026-04-11T14:00:00Z", likes: 15, likedByUser: false, replies: [] },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1", participantId: "s1", participantName: "Jane Wanjiku", participantAvatar: null, participantAvatarIcon: "Smile",
    lastMessage: "Yes, the phone is still available!", lastMessageTime: "2026-04-15T10:30:00Z", unreadCount: 2,
    messages: [
      { id: "m1", senderId: "me", receiverId: "s1", text: "Hi, is the Samsung S24 still available?", createdAt: "2026-04-15T10:00:00Z", read: true },
      { id: "m2", senderId: "s1", receiverId: "me", text: "Yes, the phone is still available!", createdAt: "2026-04-15T10:30:00Z", read: false },
    ],
  },
  {
    id: "c2", participantId: "s2", participantName: "Brian Odhiambo", participantAvatar: null, participantAvatarIcon: "Zap",
    lastMessage: "I can do 7500 for the Nike shoes", lastMessageTime: "2026-04-14T18:00:00Z", unreadCount: 0,
    messages: [
      { id: "m3", senderId: "me", receiverId: "s2", text: "Can you do a discount on the Nike Air Max?", createdAt: "2026-04-14T17:00:00Z", read: true },
      { id: "m4", senderId: "s2", receiverId: "me", text: "I can do 7500 for the Nike shoes", createdAt: "2026-04-14T18:00:00Z", read: true },
    ],
  },
  {
    id: "c3", participantId: "s3", participantName: "Mary Achieng", participantAvatar: null, participantAvatarIcon: "Heart",
    lastMessage: "The necklace will be ready by Friday", lastMessageTime: "2026-04-13T12:00:00Z", unreadCount: 1,
    messages: [
      { id: "m5", senderId: "me", receiverId: "s3", text: "Can I get a custom necklace?", createdAt: "2026-04-13T11:00:00Z", read: true },
      { id: "m6", senderId: "s3", receiverId: "me", text: "The necklace will be ready by Friday", createdAt: "2026-04-13T12:00:00Z", read: false },
    ],
  },
];

export const MESSAGE_SHORTCUTS = [
  "Is this still available?",
  "What's your best price?",
  "Can you deliver?",
  "Is the price negotiable?",
  "Can I see more photos?",
  "Where exactly are you located?",
];
