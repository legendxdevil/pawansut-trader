import { z } from "zod";

export const couponValidateSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code cannot exceed 20 characters")
    .regex(/^[A-Z0-9]{3,20}$/i, "Coupon code must be alphanumeric"),
  subtotal: z.number().positive("Subtotal must be greater than zero"),
});

export type CouponValidateInput = z.infer<typeof couponValidateSchema>;
