import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB after client compression

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

    // 3. Validate MIME type (jpeg, png, webp)
    const mimeType = file.type?.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
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

    // 4. Validate file size (<= 2 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: `Image size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed size of 2 MB.`,
          },
        },
        { status: 400 }
      );
    }

    // 5. Ensure ImgBB API Key is configured (never log the API key)
    const apiKey = process.env.IMGBB_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            code: "IMGBB_NOT_CONFIGURED",
            message: "Image upload service is not configured. Missing IMGBB_API_KEY environment variable.",
          },
        },
        { status: 500 }
      );
    }

    // 6. Forward image to ImgBB API v1 using server-side FormData
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = new Blob([buffer], { type: file.type });

    const imgbbFormData = new FormData();
    imgbbFormData.append("image", blob, file.name || "product-image.webp");

    const imgbbUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;

    const imgbbResponse = await fetch(imgbbUrl, {
      method: "POST",
      body: imgbbFormData,
    });

    const result = await imgbbResponse.json();

    if (!imgbbResponse.ok || !result || result.success === false) {
      const errorMessage =
        result?.error?.message ||
        `ImgBB API returned HTTP ${imgbbResponse.status} error during upload.`;
      const statusCode =
        imgbbResponse.status >= 400 && imgbbResponse.status < 600
          ? imgbbResponse.status
          : 502;

      return NextResponse.json(
        {
          error: {
            code: "UPLOAD_FAILED",
            message: errorMessage,
          },
        },
        { status: statusCode }
      );
    }

    const data = result.data;

    // Return the verified format
    return NextResponse.json({
      url: data.display_url || data.url,
      thumbUrl: data.thumb?.url || data.display_url || data.url,
      deleteUrl: data.delete_url,
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
