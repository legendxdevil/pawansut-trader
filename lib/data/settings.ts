import { adminDb } from "@/lib/firebase-admin";
import type { StoreSettings } from "@/types";
import { STORE_CONFIG } from "@/lib/store-config";
import { SAMPLE_STORE_SETTINGS } from "@/scripts/seed-data";

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const doc = await adminDb.collection("settings").doc("store").get();
    if (doc.exists) {
      return { ...SAMPLE_STORE_SETTINGS, ...doc.data() } as StoreSettings;
    }
    return SAMPLE_STORE_SETTINGS;
  } catch {
    return {
      storeName: STORE_CONFIG.storeName,
      whatsappNumber: STORE_CONFIG.whatsappNumber,
      freeDeliveryAbove: STORE_CONFIG.freeDeliveryAbove,
      deliveryCharge: STORE_CONFIG.defaultDeliveryCharge,
      restrictDeliveryToHospital: STORE_CONFIG.restrictDeliveryToHospital,
      deliveryLocationName: STORE_CONFIG.hospitalName,
      supportEmail: STORE_CONFIG.supportEmail,
      address: STORE_CONFIG.shopAddress,
      googleMapsEmbedUrl: STORE_CONFIG.googleMapsEmbedUrl,
    };
  }
}
