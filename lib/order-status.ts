/**
 * Order status transition rules and helper utilities.
 * Spec reference: §8.1
 */

export type OrderStatus =
  | "placed"
  | "payment_verified"
  | "confirmed"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface StatusHistoryEntry {
  status: OrderStatus;
  at: number; // epoch ms
  note?: string;
  by: "system" | "admin" | "customer" | "webhook";
}

// Valid transition mapping
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["payment_verified", "confirmed", "cancelled"],
  payment_verified: ["confirmed", "cancelled"],
  confirmed: ["dispatched", "cancelled"],
  dispatched: ["delivered", "cancelled"], // cancelling dispatched requires admin note (§8.1)
  delivered: [],
  cancelled: [],
};

export function canTransitionStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  options?: { hasAdminNote?: boolean }
): boolean {
  if (currentStatus === nextStatus) return false;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) return false;

  // Cancelling from dispatched requires an admin note
  if (currentStatus === "dispatched" && nextStatus === "cancelled") {
    if (!options?.hasAdminNote) {
      return false;
    }
  }

  return true;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order Placed",
  payment_verified: "Payment Verified",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_PHASES_TIMELINE: OrderStatus[] = [
  "placed",
  "payment_verified",
  "confirmed",
  "dispatched",
  "delivered",
];
