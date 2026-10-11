import { STORE_CONFIG } from "./store-config";

export interface DeliveryCalculationOptions {
  subtotal: number;
  discount: number;
  freeDeliveryAbove?: number;
  baseDeliveryCharge?: number;
}

export interface DeliveryCalculationResult {
  charge: number;
  isFree: boolean;
  amountNeededForFree: number;
}

/**
 * Calculates delivery charge strictly according to spec §7.10:
 * deliveryCharge = (subtotal - discount) >= freeDeliveryAbove ? 0 : deliveryCharge
 */
export function calculateDeliveryCharge({
  subtotal,
  discount,
  freeDeliveryAbove = STORE_CONFIG.freeDeliveryAbove,
  baseDeliveryCharge = STORE_CONFIG.defaultDeliveryCharge,
}: DeliveryCalculationOptions): DeliveryCalculationResult {
  const eligibleAmount = Math.max(0, subtotal - discount);
  const isFree = eligibleAmount >= freeDeliveryAbove;
  const charge = isFree ? 0 : baseDeliveryCharge;
  const amountNeededForFree = isFree ? 0 : Math.max(0, freeDeliveryAbove - eligibleAmount);

  return {
    charge,
    isFree,
    amountNeededForFree,
  };
}
