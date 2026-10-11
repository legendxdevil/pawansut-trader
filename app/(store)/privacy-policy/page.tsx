import { Metadata } from "next";
import { PolicyContainer } from "@/components/store/policy-container";

export const metadata: Metadata = {
  title: "Privacy Policy | Pawansut Trader",
  description: "Learn how Pawansut Trader collects, protects, and handles your order information, delivery addresses, and customer data.",
  openGraph: {
    title: "Privacy Policy | Pawansut Trader",
    description: "Learn how Pawansut Trader collects, protects, and handles your customer data.",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyContainer
      title="Privacy Policy"
      description="Pawansut Trader respects your personal privacy. This document outlines how your information is handled during your orders and interactions with us."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. Who We Are</h2>
        <p>
          <strong className="text-white">[SELLER_NAME - Pawansut Trader]</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is an online retailer providing premium mobile accessories.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li><strong>Registered Address:</strong> [SHOP_ADDRESS - OWNER TO FILL]</li>
          <li><strong>Customer Support Email:</strong> [SUPPORT_EMAIL - OWNER TO FILL]</li>
          <li><strong>WhatsApp Support:</strong> +91 8505856763</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. What We Collect</h2>
        <p>When you browse or place an order through our store, we collect:</p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li>Your recipient name and 10-digit mobile number.</li>
          <li>Delivery address, landmark, city, and pincode.</li>
          <li>Optional customer email address.</li>
          <li>Order line items, selected variants, and purchase transaction history.</li>
          <li>WhatsApp customer service communications and delivery coordination messages.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. Why We Collect Your Information</h2>
        <p>We process your personal information strictly for legitimate commercial and fulfillment purposes:</p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li>To verify, process, dispatch, and deliver your orders directly to your specified address.</li>
          <li>To provide official retail invoices and authenticate sequential physical warranty cards.</li>
          <li>To transmit automated order confirmation and tracking status updates via WhatsApp.</li>
          <li>To prevent fraudulent orders, abuse, and automated spam.</li>
          <li>To comply with statutory accounting and tax regulations under Indian law.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. Payment Processing</h2>
        <p>
          <strong>Online Payments:</strong> Online transactions are handled through our certified payment gateway partner, Cashfree Payments. Pawansut Trader does NOT capture, process, or store credit/debit card numbers, CVVs, net-banking passwords, or UPI PINs.
        </p>
        <p>
          <strong>Cash on Delivery (COD):</strong> Payments for COD orders are collected in cash or UPI at the doorstep by our delivery agent upon handover.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">5. Where Data Is Stored & Security</h2>
        <p>
          All order records are stored within Google Cloud / Firebase enterprise infrastructure in secure regions. We maintain industry-standard physical and electronic controls. Access is restricted exclusively to authorized operational personnel.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">6. Sharing & Third Parties</h2>
        <p>
          We do not sell, rent, or trade your personal information to marketing brokers. We share your information solely with:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li>Payment gateway providers for processing transactions.</li>
          <li>Judicial or law enforcement bodies when strictly mandated by Indian law or statutory order.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">7. Data Retention & Your Rights</h2>
        <p>
          We retain order and warranty data for the duration of the applicable product warranty plus statutory audit periods. You have the right to request access to or correction of your contact details by writing to our support team.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">8. Grievance Officer</h2>
        <p>
          In accordance with the Information Technology Act 2000 and consumer rules:
        </p>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-sm space-y-1">
          <p><strong>Grievance Officer:</strong> [GRIEVANCE_OFFICER_NAME - OWNER TO FILL]</p>
          <p><strong>Support Email:</strong> [SUPPORT_EMAIL - OWNER TO FILL]</p>
          <p><strong>WhatsApp:</strong> +91 8505856763</p>
          <p className="text-neutral-500 text-xs mt-2">
            We acknowledge grievances within 48 business hours and resolve them within 30 days.
          </p>
        </div>
      </section>
    </PolicyContainer>
  );
}
