export type Language = 'fr' | 'en' | 'de' | 'ru' | 'uk' | 'nl';

export interface TranslationKeys {
  // Header
  freeShipping: string;
  search: string;
  searchPlaceholder: string;
  searchResults: string;
  noResults: string;
  cart: string;
  
  // Nav
  navMotorOils: string;
  navAdditives: string;
  navMaintenance: string;
  navAllProducts: string;
  navAdvice: string;
  navContact: string;
  navFindOil: string;

  // Hero
  heroTag: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDescription: string;
  heroCta: string;
  heroSecondary: string;

  // USP
  uspPolarPlus: string;
  uspFullerene: string;
  uspExpertise: string;

  // Sections
  popularProducts: string;
  seeAll: string;
  categories: string;
  catalog: string;
  ourCategories: string;
  newArrivals: string;
  newTag: string;
  viewProducts: string;
  certifications: string;
  certDescription: string;
  stayInformed: string;
  newsletterDesc: string;
  emailPlaceholder: string;
  subscribe: string;
  subscribing: string;
  privacyConsent: string;
  thankYou: string;
  thankYouDesc: string;

  // Features
  premiumQuality: string;
  premiumQualityDesc: string;
  freeDelivery: string;
  freeDeliveryDesc: string;
  securePayment: string;
  securePaymentDesc: string;
  expertAdvice: string;
  expertAdviceDesc: string;

  // Oil Selector
  oilSelectorTitle: string;
  oilSelectorDesc: string;
  selectBrand: string;
  selectModel: string;
  selectEngine: string;
  findProducts: string;
  compatibleProducts: string;
  stepBrand: string;
  stepModel: string;
  stepEngine: string;

  // Product
  addToCart: string;
  selectSize: string;
  outOfStock: string;
  description: string;
  composition: string;
  maintenance: string;
  youMayAlsoLike: string;
  ref: string;
  quantity: string;
  color: string;
  size: string;
  sizeGuide: string;
  home: string;
  collections: string;
  productNotFound: string;
  backToCollections: string;
  new: string;
  bestseller: string;
  addToWishlist: string;

  // Cart
  yourCart: string;
  emptyCart: string;
  discoverProducts: string;
  subtotal: string;
  shipping: string;
  shippingCalcCheckout: string;
  estimatedTotal: string;
  checkout: string;
  viewCart: string;
  moreForFreeShipping: string;
  freeShippingUnlocked: string;

  // Checkout
  shippingInfo: string;
  firstName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  addressOptional: string;
  continue: string;
  deliveryMethod: string;
  standardDelivery: string;
  standardDeliveryDesc: string;
  expressDelivery: string;
  expressDeliveryDesc: string;
  storePickup: string;
  storePickupDesc: string;
  free: string;
  payment: string;
  acceptCGV: string;
  acceptCGVLink: string;
  pay: string;
  processing: string;
  back: string;
  promoCode: string;
  apply: string;
  promoApplied: string;
  promoInvalid: string;
  discount: string;
  total: string;
  orderSummary: string;
  blogSubscribe: string;
  formIncomplete: string;
  fillRequiredFields: string;
  cgvNotAccepted: string;
  acceptCGVMessage: string;
  redirectingPayment: string;
  redirectingPaymentDesc: string;
  paymentError: string;
  calculatingShipping: string;
  selectCity: string;

  // Footer
  footerProducts: string;
  footerInfo: string;
  footerLegal: string;
  footerAbout: string;
  footerTechnologies: string;
  footerDeliveryReturns: string;
  footerLegalNotice: string;
  footerCGV: string;
  footerPrivacy: string;
  footerFAQ: string;
  footerDescription: string;
  allRightsReserved: string;

  // Pages
  aboutTitle: string;
  aboutDescription: string;
  contactTitle: string;
  contactDescription: string;
  faqTitle: string;
  deliveryReturnsTitle: string;
  legalNoticeTitle: string;
  cgvTitle: string;
  privacyTitle: string;

  // Currency
  currency: string;
  changeCurrency: string;

  // Catalog
  catalogTitle: string;
  catalogDescription: string;
}

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
];

export const defaultLanguage: Language = 'fr';
