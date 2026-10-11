import { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Mail, MapPin, Clock, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { STORE_CONFIG } from "@/lib/store-config";

export const metadata: Metadata = {
  title: "Contact Us & Store Information | Pawansut Trader",
  description: "Get in touch with Pawansut Trader. Direct WhatsApp support, store location, and delivery details for Satyawadi Raja Harish Chandra Hospital.",
  openGraph: {
    title: "Contact Pawansut Trader",
    description: "WhatsApp support, delivery zone, and store details.",
    type: "website",
  },
};

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappFullNumber}?text=${encodeURIComponent("Hello Pawansut Trader! I have a question about your products/delivery.")}`;

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
            Customer Support & Inquiries
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Contact Pawansut Trader
          </h1>
          <p className="text-neutral-400 text-base leading-relaxed">
            Have questions about an accessory, compatibility, or your order delivery? Reach out to us directly through WhatsApp or email.
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
                Connect directly with our store team for instant replies on product stock, custom requests, and delivery coordination.
              </p>
              <p className="text-base font-mono font-medium text-white mb-6">
                +91 {STORE_CONFIG.whatsappNumber}
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
                For formal billing inquiries, bulk order quotes, or partnership questions, email our support desk.
              </p>
              <p className="text-sm font-mono text-neutral-300 mb-6 bg-black/50 p-2 rounded-lg border border-neutral-800">
                [SUPPORT_EMAIL - OWNER TO FILL]
              </p>
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Replies within 24 business hours
            </div>
          </div>
        </div>

        {/* Store & Delivery Location Info */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">Delivery Zone & Service Area</h2>
              <p className="text-sm text-neutral-300">
                {STORE_CONFIG.hospitalName}, Narela, Delhi - 110040
              </p>
              <p className="text-xs text-neutral-400">
                Registered Office Address: <span className="font-mono text-neutral-300">[SHOP_ADDRESS - OWNER TO FILL]</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800 text-sm">
            <div className="flex items-center gap-3 text-neutral-300">
              <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
              <div>
                <p className="text-white font-medium">Operating Hours</p>
                <p className="text-xs text-neutral-400">Monday – Sunday: 9:00 AM – 9:00 PM IST</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-white font-medium">Warranty Claims</p>
                <p className="text-xs text-neutral-400">Physical warranty card required for all exchanges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
