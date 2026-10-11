import React from "react";
import { getActiveAnnouncements } from "@/lib/data/announcements";
import { AnnouncementStrip } from "@/components/store/announcement-strip";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { WhatsAppButton } from "@/components/store/whatsapp-button";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const announcements = await getActiveAnnouncements();

  return (
    <div className="min-h-screen flex flex-col bg-obsidian text-porcelain">
      <AnnouncementStrip initialAnnouncements={announcements} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
