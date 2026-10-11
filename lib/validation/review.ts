import { z } from "zod";

export const reviewSubmissionSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  orderId: z.string().min(3, "Order ID is required"),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 10, {
      message: "Enter a valid 10-digit mobile number",
    }),
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  rating: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  text: z.string().min(5, "Review text must be at least 5 characters").max(500, "Review text cannot exceed 500 characters"),
  honeypot: z.string().optional(),
});

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
