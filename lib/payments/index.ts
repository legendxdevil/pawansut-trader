/**
 * Payment gateway abstraction per spec §9.
 * Stubs online payments until Cashfree credentials are provided in Phase 9.
 */

import type { Order } from "@/types";

export interface CreatePaymentResult {
  paymentSessionId?: string;
  orderId: string;
  redirectUrl?: string;
}

export interface VerifyPaymentResult {
  orderId: string;
  paid: boolean;
  status: "pending" | "paid" | "failed";
  txnId?: string;
}

export interface PaymentGateway {
  createPayment(order: Order): Promise<CreatePaymentResult>;
  verifyPayment(orderId: string): Promise<VerifyPaymentResult>;
  handleWebhook(req: Request): Promise<{ handled: boolean; orderId?: string }>;
}

export function isOnlinePaymentEnabled(): boolean {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  return Boolean(appId && appId.trim() && secretKey && secretKey.trim());
}

// Placeholder gateway until Phase 9
export const defaultPaymentGateway: PaymentGateway = {
  async createPayment(order: Order) {
    if (!isOnlinePaymentEnabled()) {
      throw new Error("Online payment is currently disabled. Please select Cash on Delivery (COD).");
    }
    // Stub implementation until Phase 9
    return {
      orderId: order.orderId,
    };
  },
  async verifyPayment(orderId: string) {
    return {
      orderId,
      paid: false,
      status: "pending",
    };
  },
  async handleWebhook() {
    return {
      handled: false,
    };
  },
};
