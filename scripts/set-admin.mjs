#!/usr/bin/env node
// scripts/set-admin.mjs <email>
// Sets customUserClaims: { admin: true } for the given email using Firebase Admin SDK.
// Spec reference: §3.3, §12.1

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env or .env.local
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
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const targetEmail = process.argv[2];
if (!targetEmail) {
  console.error("Usage: node scripts/set-admin.mjs <email>");
  process.exit(1);
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pawansut-trader";
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (privateKey) {
  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");
}

let app;
if (clientEmail && privateKey) {
  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
} else {
  console.log("Notice: No live Firebase credentials found in environment. Initializing default admin app...");
  app = initializeApp({ projectId });
}

const auth = getAuth(app);

async function setAdmin() {
  try {
    console.log(`Looking up Firebase user for email: ${targetEmail}...`);
    const user = await auth.getUserByEmail(targetEmail);
    console.log(`Found user: ${user.uid} (${user.email})`);

    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`✓ Successfully set custom claim { admin: true } on user ${user.uid}!`);
    console.log("Note: The admin user must sign out and sign back in to refresh their ID token claims.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to set admin custom claim:", err.message);
    process.exit(1);
  }
}

setAdmin();
