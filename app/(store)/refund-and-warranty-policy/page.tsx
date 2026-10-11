import { Metadata } from "next";
import { PolicyContainer } from "@/components/store/policy-container";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Warranty Policy | Pawansut Trader",
  description: "Official 7-day return guidelines, sequential physical warranty card requirements, and claim procedures for Pawansut Trader.",
  openGraph: {
    title: "Refund & Warranty Policy | Pawansut Trader",
    description: "Physical warranty card guidelines and refund policies for Pawansut Trader.",
    type: "website",
  },
};

export default function RefundAndWarrantyPolicyPage() {
  return (
    <PolicyContainer
      title="Refund & Warranty Policy"
      description="Our transparent replacement, return, and warranty guarantee. Learn how our physical warranty card protects your purchase."
    >
      {/* Important Physical Card Banner */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-amber-500/30 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-white text-base">
            Mandatory Requirement: Physical Warranty Card
          </p>
          <p className="text-neutral-300">
            For every warranty product delivered, you will receive a serialized <strong>physical warranty card</strong> (e.g. PT-W-0001). <strong>The physical card + retail bill/Order ID are strictly mandatory for any warranty or replacement claim.</strong>
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. Return / Replacement Window</h2>
        <p>
          If your product arrives defective, damaged in transit, or does not match your order specifications, please notify us within <strong>[7] calendar days of delivery</strong>.
        </p>
        <p>
          Reach our WhatsApp support team at <strong>+91 8505856763</strong> with your Order ID and photos or videos clearly demonstrating the issue.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. Eligible Item Condition</h2>
        <p>To be eligible for a return or exchange:</p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li>Item must be in original condition with complete retail packaging.</li>
          <li>All original cables, manuals, and accessories must be enclosed.</li>
          <li>Items showing visible physical cuts, water immersion, burns, or tampering are ineligible.</li>
          <li>[Owner to confirm non-returnable categories: e.g., open earphone silicone tips, used screen protectors].</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. Warranty Coverage & Exclusions</h2>
        <p>
          Warranty terms apply strictly to products indicating a warranty period on the catalog page and your order receipt.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-sm">
            <p className="font-semibold text-emerald-400 mb-1">What is Covered</p>
            <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-xs">
              <li>Internal circuit or capacitor faults</li>
              <li>Charging controller failures</li>
              <li>Component defects under normal operating use</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-sm">
            <p className="font-semibold text-rose-400 mb-1">What is Excluded</p>
            <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-xs">
              <li>Cracked casings, drops, cord snips</li>
              <li>Water/liquid immersion or oxidation</li>
              <li>High-voltage surge damage</li>
              <li>Unauthorized opening or third-party repair</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. Refund Timelines & Methods</h2>
        <p>
          Once your return is physically inspected and approved by our support team, refunds are issued within <strong>[5–7] business days</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li><strong>Online Orders:</strong> Recredited to the original payment source (card/UPI/net-banking) through Cashfree.</li>
          <li><strong>COD Orders:</strong> Transferred directly to your designated UPI ID or savings bank account.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">5. How to Initiate a Warranty Claim</h2>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-sm space-y-2">
          <p className="text-white font-medium">Step-by-step claim procedure:</p>
          <ol className="list-decimal pl-5 space-y-1 text-neutral-400">
            <li>Locate your physical warranty card issued at delivery.</li>
            <li>Take a clear photo showing the card number (e.g. PT-W-0001) and the product.</li>
            <li>Send a WhatsApp message to <strong>+91 8505856763</strong> with your Order ID and photos.</li>
            <li>Our technician will verify your claim against our system database and arrange for exchange or repair.</li>
          </ol>
        </div>
      </section>
    </PolicyContainer>
  );
}
