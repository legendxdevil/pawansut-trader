// SAMPLE DATA — Appendix C
// Run via: node scripts/seed.mjs
// Seeds initial sample categories, products, announcements, store settings, and coupons into Cloud Firestore.

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env or .env.local if present
const envFiles = [".env.local", ".env"];
for (const file of envFiles) {
  const p = resolve(process.cwd(), file);
  if (existsSync(p)) {
    const lines = readFileSync(p, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pawansut-trader";
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

let app;
if (clientEmail && privateKey) {
  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
} else {
  console.log("Notice: No live Firebase credentials found in environment. Initializing local admin app...");
  app = initializeApp({ projectId });
}

const db = getFirestore(app);

// Import sample data definitions
import("./seed-data.ts")
  .then(async (m) => {
    console.log("Seeding Pawansut Trader sample data...");

    // 1. Categories
    for (const cat of m.SAMPLE_CATEGORIES) {
      await db.collection("categories").doc(cat.id).set(cat, { merge: true });
    }
    console.log(`✓ Seeded ${m.SAMPLE_CATEGORIES.length} categories.`);

    // 2. Announcements
    for (const ann of m.SAMPLE_ANNOUNCEMENTS) {
      await db.collection("announcements").doc(ann.id).set(ann, { merge: true });
    }
    console.log(`✓ Seeded ${m.SAMPLE_ANNOUNCEMENTS.length} announcements.`);

    // 3. Store Settings
    await db.collection("settings").doc("store").set(m.SAMPLE_STORE_SETTINGS, { merge: true });
    console.log("✓ Seeded store settings.");

    // 4. Sample Coupon
    await db.collection("coupons").doc(m.SAMPLE_COUPON.code).set(m.SAMPLE_COUPON, { merge: true });
    console.log("✓ Seeded sample coupon WELCOME10 (inactive).");

    // 5. Products
    for (const prod of m.SAMPLE_PRODUCTS) {
      await db.collection("products").doc(prod.id).set(prod, { merge: true });
    }
    console.log(`✓ Seeded ${m.SAMPLE_PRODUCTS.length} products.`);

    // 6. Counters initialization if not existing
    const orderCounter = db.collection("counters").doc("orders");
    const ocSnap = await orderCounter.get();
    if (!ocSnap.exists) {
      await orderCounter.set({ value: 0 });
    }

    const warrantyCounter = db.collection("counters").doc("warranty");
    const wcSnap = await warrantyCounter.get();
    if (!wcSnap.exists) {
      await warrantyCounter.set({ value: 0 });
    }
    console.log("✓ Initialized counters.");

    console.log("Sample data seed complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error running seed script:", err.message);
    process.exit(1);
  });
