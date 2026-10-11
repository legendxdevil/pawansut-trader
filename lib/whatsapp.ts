import type { Order } from "@/types";
import { STORE_CONFIG } from "./store-config";

/**
 * Formats WhatsApp customer order confirmation message strictly per Appendix B.
 */
export function formatOrderWhatsAppMessage(order: Order): string {
  const addressParts = [
    order.customer.address,
    order.customer.landmark ? order.customer.landmark : null,
    `${order.customer.city} - ${order.customer.pincode}`,
  ].filter(Boolean);

  const lines: string[] = [
    `Hello ${STORE_CONFIG.storeName}! I have placed an order.`,
    "",
    `Order ID: ${order.orderId}`,
    `Name: ${order.customer.name}`,
    `Mobile: ${order.customer.phone}`,
    `Address: ${addressParts.join(", ")}`,
    "",
    "Items:",
  ];

  order.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name} (${item.variantLabel}) x ${item.qty} - ₹${item.price * item.qty}`
    );
  });

  lines.push("");
  lines.push(`Subtotal: ₹${order.subtotal}`);

  if (order.discount > 0) {
    const couponPart = order.couponCode ? `   (Coupon: ${order.couponCode})` : "";
    lines.push(`Discount: ₹${order.discount}${couponPart}`);
  }

  lines.push(`Delivery: ₹${order.deliveryCharge}`);
  lines.push(`Total: ₹${order.total}`);
  lines.push("");

  // Payment status formatting
  let paymentText = "COD";
  if (order.payment.method === "online") {
    paymentText = order.payment.status === "paid" ? "Online - Paid" : "Online - Pending";
  }
  lines.push(`Payment: ${paymentText}`);

  // Warranty formatting per item or none
  const warrantyItems = order.items.filter((it) => it.warranty && it.warranty.enabled);
  if (warrantyItems.length > 0) {
    const wText = warrantyItems
      .map((it) => `${it.warranty!.months} months on ${it.name}`)
      .join(", ");
    lines.push(`Warranty: ${wText} — physical warranty card will be given`);
  } else {
    lines.push("Warranty: none");
  }

  lines.push("");
  lines.push("Please confirm my order. Thank you!");

  return lines.join("\n");
}

export function generateWhatsAppOrderLink(order: Order): string {
  const text = formatOrderWhatsAppMessage(order);
  return `https://wa.me/${STORE_CONFIG.whatsappFullNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Admin -> customer status update message links (Appendix B).
 */
export function generateAdminStatusWhatsAppLink(order: Order): string {
  const phone = order.customer.phone.replace(/\D/g, "");
  let message = "";

  switch (order.status) {
    case "confirmed":
      message = `Hello ${order.customer.name}, your order ${order.orderId} from ${STORE_CONFIG.storeName} has been CONFIRMED. Total: ₹${order.total}. We are preparing it for delivery!`;
      break;
    case "dispatched":
      message = `Hello ${order.customer.name}, your order ${order.orderId} has been DISPATCHED for delivery at ${order.customer.address}. Physical warranty card is included.`;
      break;
    case "delivered":
      message = `Hello ${order.customer.name}, your order ${order.orderId} has been successfully DELIVERED. Thank you for shopping with ${STORE_CONFIG.storeName}! Keep your warranty card safe for claims.`;
      break;
    case "cancelled":
      message = `Hello ${order.customer.name}, your order ${order.orderId} has been cancelled. If you have any questions, please reply here.`;
      break;
    default:
      message = `Hello ${order.customer.name}, update on your order ${order.orderId}: Status is currently ${order.status}.`;
      break;
  }

  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
}
