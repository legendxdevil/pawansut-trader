import { adminDb } from "@/lib/firebase-admin";
import type { Product } from "@/types";
import { SAMPLE_PRODUCTS } from "@/scripts/seed-data";

/**
 * Server data layer for products.
 * Attempts to query Firestore adminDb, falling back to canonical sample dataset
 * if Firestore credentials are not configured or connection is unavailable.
 */
export async function getProducts(options?: {
  category?: string;
  inStock?: boolean;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  limit?: number;
}): Promise<Product[]> {
  try {
    let query: FirebaseFirestore.Query = adminDb.collection("products").where("isActive", "==", true);

    if (options?.category && options.category !== "all") {
      query = query.where("category", "==", options.category);
    }

    const snap = await query.get();
    let products: Product[] = [];

    if (!snap.empty) {
      products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
    } else {
      // Fallback to sample data
      products = [...SAMPLE_PRODUCTS].filter((p) => p.isActive);
      if (options?.category && options.category !== "all") {
        products = products.filter((p) => p.category === options.category);
      }
    }

    // Apply in-stock filter
    if (options?.inStock) {
      products = products.filter((p) =>
        p.variants.some((v) => v.stock > 0)
      );
    }

    // Apply search filter if provided
    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Apply sorting
    switch (options?.sort) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "name":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        products.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    if (options?.limit && options.limit > 0) {
      products = products.slice(0, options.limit);
    }

    return products;
  } catch {
    // Graceful fallback for local development without credentials
    let products = [...SAMPLE_PRODUCTS].filter((p) => p.isActive);
    if (options?.category && options.category !== "all") {
      products = products.filter((p) => p.category === options.category);
    }
    if (options?.inStock) {
      products = products.filter((p) => p.variants.some((v) => v.stock > 0));
    }
    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    switch (options?.sort) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "name":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        products.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }
    if (options?.limit) {
      products = products.slice(0, options.limit);
    }
    return products;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const snap = await adminDb
      .collection("products")
      .where("slug", "==", slug)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() } as Product;
    }

    // Fallback search
    const found = SAMPLE_PRODUCTS.find((p) => p.slug === slug && p.isActive);
    return found || null;
  } catch {
    const found = SAMPLE_PRODUCTS.find((p) => p.slug === slug && p.isActive);
    return found || null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const doc = await adminDb.collection("products").doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as Product;
    }
    return SAMPLE_PRODUCTS.find((p) => p.id === id) || null;
  } catch {
    return SAMPLE_PRODUCTS.find((p) => p.id === id) || null;
  }
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return getProducts({ limit }).then((prods) => prods.filter((p) => p.isFeatured).slice(0, limit));
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  return getProducts({ limit }).then((prods) => prods.filter((p) => p.isNew).slice(0, limit));
}
