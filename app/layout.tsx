import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pawansut Trader | Mobile Accessories Store",
    template: "%s | Pawansut Trader",
  },
  description:
    "Premium mobile accessories, chargers, cables, audio, cases, and power banks. Fast delivery at Satyawadi Raja Harish Chandra Hospital, Delhi.",
  applicationName: "Pawansut Trader",
  authors: [{ name: "Pawansut Trader" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Pawansut Trader",
    title: "Pawansut Trader | Mobile Accessories Store",
    description:
      "Premium mobile accessories, chargers, cables, audio, cases, and power banks. Fast delivery at Satyawadi Raja Harish Chandra Hospital, Delhi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pawansut Trader | Mobile Accessories Store",
    description:
      "Premium mobile accessories, chargers, cables, audio, cases, and power banks. Fast delivery at Satyawadi Raja Harish Chandra Hospital, Delhi.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-obsidian text-porcelain min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
