import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce admin authentication
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized admin access." } },
        { status: 401 }
      );
    }

    // 2. Validate multipart form data header and file
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: { code: "INVALID_CONTENT_TYPE", message: "Request must be multipart/form-data." } },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = (formData.get("image") || formData.get("file")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: "NO_FILE_PROVIDED", message: "No image file provided in form data." } },
        { status: 400 }
      );
    }

    // 3. Validate MIME type
    const mimeType = file.type?.toLowerCase();
    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Validate file size (<= 5 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: `Image size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed size of 5 MB.`,
          },
        },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 5. If ImgBB API Key is configured, attempt upload to ImgBB CDN
    const apiKey = process.env.IMGBB_API_KEY?.trim();
    if (apiKey) {
      try {
        const blob = new Blob([fileBuffer], { type: file.type || "image/webp" });
        const imgbbFormData = new FormData();
        imgbbFormData.append("image", blob, file.name || "product-image.webp");

        const imgbbUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;
        const imgbbResponse = await fetch(imgbbUrl, {
          method: "POST",
          body: imgbbFormData,
        });

        const result = await imgbbResponse.json();

        if (imgbbResponse.ok && result && result.success && result.data) {
          const data = result.data;
          return NextResponse.json({
            url: data.display_url || data.url,
            thumbUrl: data.thumb?.url || data.display_url || data.url,
            deleteUrl: data.delete_url,
          });
        }
      } catch (err) {
        console.warn("ImgBB upload failed, seamlessly falling back to local storage:", err);
      }
    }

    // 6. Seamless Local Storage Fallback: Save to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const ext =
      mimeType === "image/png"
        ? ".png"
        : mimeType === "image/jpeg" || mimeType === "image/jpg"
        ? ".jpg"
        : ".webp";

    const fileName = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, fileBuffer);

    const localUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      url: localUrl,
      thumbUrl: localUrl,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: err.message || "Failed to process image upload.",
        },
      },
      { status: 500 }
    );
  }
}
