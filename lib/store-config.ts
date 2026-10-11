/**
 * Single source of truth for store constants and fallback configurations.
 * Spec reference: §1, §3, §7.10, §10
 */

export const STORE_CONFIG = {
  storeName: "Pawansut Trader",
  currencySymbol: "₹",
  currencyCode: "INR",
  whatsappNumber: "8505856763",
  whatsappCountryCode: "91",
  whatsappFullNumber: "918505856763",
  
  // Delivery rules (§1, §7.10)
  freeDeliveryAbove: 499,
  defaultDeliveryCharge: 80,
  
  // Hospital delivery restriction defaults (§3.1)
  restrictDeliveryToHospital: true,
  hospitalName: "Satyawadi Raja Harish Chandra Hospital, Delhi",
  hospitalNotice:
    "Delivery is currently available at Satyawadi Raja Harish Chandra Hospital, Delhi.",
  hospitalConfirmationText:
    "I confirm delivery is at Satyawadi Raja Harish Chandra Hospital",

  // Warranty defaults (§3.9, §16)
  warrantyCardPrefix: "PT-W-",
  orderIdPrefix: "PT-",

  // Policies placeholders and defaults (§3.5, §3.6, Appendix A)
  supportEmail: "support@pawansuttrader.com",
  shopAddress: "GADGETS STORE, Near Satyawadi Raja Harish Chandra Hospital, Narela, Delhi - 110040",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111872.96372278818!2d77.02645966770928!3d28.808176384852715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390da9281515f1e3%3A0x262abccea91d7bcf!2sGADGETS%20STORE!5e0!3m2!1sen!2sin!4v1791719219792!5m2!1sen!2sin",
  googleMapsDirectionsUrl:
    "https://www.google.com/maps/place/GADGETS+STORE/@28.8081764,77.0264597,17z/",
  returnWindowDays: 7,
  refundTimelineDays: "5–7 working days",
  
  // Storage keys for customer state (§7.5, §7.6, §15)
  cartStorageKey: "pt_cart_v1",
  wishlistStorageKey: "pt_wishlist_v1",
  cookieNoticeStorageKey: "pt_cookie_ok",
} as const;

export type StoreConfig = typeof STORE_CONFIG;
