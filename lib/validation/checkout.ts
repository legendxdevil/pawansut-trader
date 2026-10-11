import { z } from "zod";

// Spec §7.7 validation rules
export const checkoutFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Full name cannot exceed 60 characters")
    .regex(new RegExp("^[\\p{L}\\s.'-]+$", "u"), "Name can only contain letters, spaces, dots, hyphens, and apostrophes"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number starting with 6-9"),
  address: z
    .string()
    .min(10, "Address must be at least 10 characters (include department, ward, floor, room)")
    .max(250, "Address cannot exceed 250 characters"),
  landmark: z.string().max(100, "Landmark cannot exceed 100 characters").optional().or(z.literal("")),
  city: z.string().min(2, "City must be at least 2 characters").default("Delhi"),
  pincode: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit Indian PIN code"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  paymentMode: z.enum(["cod", "online"]),
  hospitalConfirmed: z.boolean().optional(),
  couponCode: z.string().optional().or(z.literal("")),
  honeypot: z.string().max(0, "Invalid submission").optional().or(z.literal("")), // Must be empty
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        qty: z.number().int().positive().max(10),
      })
    )
    .min(1, "Your cart is empty"),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
