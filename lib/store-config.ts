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
  supportEmail: "support@pawansuttrader.com", // [OWNER-TO-FILL]
  shopAddress: "Satyawadi Raja Harish Chandra Hospital Area, Narela, Delhi - 110040", // [OWNER-TO-FILL]
  returnWindowDays: 7,
  refundTimelineDays: "5–7 working days",
  
  // Storage keys for customer state (§7.5, §7.6, §15)
  cartStorageKey: "pt_cart_v1",
  wishlistStorageKey: "pt_wishlist_v1",
  cookieNoticeStorageKey: "pt_cookie_ok",
} as const;

export type StoreConfig = typeof STORE_CONFIG;
