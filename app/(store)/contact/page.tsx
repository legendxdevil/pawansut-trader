import { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Mail, MapPin, Clock, ArrowLeft, ShieldCheck, Sparkles, Navigation, ExternalLink } from "lucide-react";
import { STORE_CONFIG } from "@/lib/store-config";
import { getStoreSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Contact Us & Store Location | Pawansut Trader",
  description: "Visit GADGETS STORE (Pawansut Trader) or contact our team via WhatsApp. Store location, Google Maps directions, and delivery details for Satyawadi Raja Harish Chandra Hospital, Delhi.",
  openGraph: {
    title: "Contact & Store Location | Pawansut Trader",
    description: "GADGETS STORE location, Google Maps directions, and WhatsApp support.",
    type: "website",
  },
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const whatsappNumber = settings.whatsappNumber || STORE_CONFIG.whatsappNumber;
  const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent("Hello Pawansut Trader! I have a question about your products/delivery.")}`;
  const storeAddress = settings.address || STORE_CONFIG.shopAddress;
  const supportEmail = settings.supportEmail || STORE_CONFIG.supportEmail;
  const mapsEmbedUrl = settings.googleMapsEmbedUrl || STORE_CONFIG.googleMapsEmbedUrl;
  const directionsUrl = STORE_CONFIG.googleMapsDirectionsUrl;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 border-b border-neutral-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Customer Support & Store Location
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Contact & Visit Pawansut Trader
          </h1>
          <p className="text-neutral-400 text-base leading-relaxed">
            Have questions about accessories, compatibility, or delivery? Reach out to us via WhatsApp, email, or visit our retail store in person.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* WhatsApp Direct Card */}
          <div className="p-6 rounded-2xl bg-neutral-900/70 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">WhatsApp Instant Support</h2>
              <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
                Connect directly with our team for immediate replies on stock availability, special requests, and order assistance.
              </p>
              <p className="text-base font-mono font-medium text-white mb-6">
                +91 {whatsappNumber}
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] text-black font-semibold text-sm hover:bg-[#20ba59] transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Email Support Card */}
          <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Email Inquiries</h2>
              <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
                For formal billing inquiries, corporate bulk orders, or official correspondence, reach us via email.
              </p>
              <p className="text-sm font-mono text-neutral-300 mb-6 bg-black/50 p-2.5 rounded-lg border border-neutral-800 break-all">
                {supportEmail}
              </p>
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Replies within 24 business hours
            </div>
          </div>
        </div>

        {/* Physical Shop Location & Interactive Google Map */}
        <div id="location" className="p-6 sm:p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-400">
                  <span>Retail Store</span>
                  <span>•</span>
                  <span>Walk-ins Welcome</span>
                </div>
                <h2 className="text-xl font-bold text-white">GADGETS STORE (Pawansut Trader)</h2>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {storeAddress}
                </p>
              </div>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shrink-0"
            >
              <Navigation className="w-4 h-4 text-black fill-black" />
              Get Directions
              <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
            </a>
          </div>

          {/* Interactive Google Maps Iframe */}
          <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
            <iframe
              src={mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="GADGETS STORE - Pawansut Trader Location Map"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Store & Delivery Location Info */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">Delivery Zone & Service Coverage</h2>
              <p className="text-sm text-neutral-300">
                {settings.deliveryLocationName || STORE_CONFIG.hospitalName}, Narela, Delhi - 110040
              </p>
              <p className="text-xs text-neutral-400">
                Direct hand-to-hand delivery available for all hospital premises and adjacent areas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800 text-sm">
            <div className="flex items-center gap-3 text-neutral-300">
              <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
              <div>
                <p className="text-white font-medium">Store Operating Hours</p>
                <p className="text-xs text-neutral-400">Monday – Sunday: 9:00 AM – 9:00 PM IST</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-white font-medium">Warranty & Replacements</p>
                <p className="text-xs text-neutral-400">Bring your physical warranty card to GADGETS STORE for on-the-spot claims</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
