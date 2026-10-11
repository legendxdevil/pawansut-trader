import { Metadata } from "next";
import { PolicyContainer } from "@/components/store/policy-container";

export const metadata: Metadata = {
  title: "Terms & Conditions | Pawansut Trader",
  description: "Terms of service, ordering policies, hospital delivery radius, and purchasing conditions for Pawansut Trader.",
  openGraph: {
    title: "Terms & Conditions | Pawansut Trader",
    description: "Terms of service and delivery conditions for Pawansut Trader.",
    type: "website",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <PolicyContainer
      title="Terms & Conditions"
      description="Please read these terms carefully before placing an order on Pawansut Trader. By placing an order, you agree to these legal conditions."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. Agreement to Terms</h2>
        <p>
          By accessing this website, placing orders, or communicating via our integrated WhatsApp channel, you accept and agree to be bound by these Terms and Conditions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. Catalog, Pricing & Availability</h2>
        <p>
          All prices are quoted in Indian Rupees (₹). Product images represent models accurately, but minor hue variations or packaging designs may occur between manufacturer shipments.
        </p>
        <p>
          In the event of a pricing or inventory discrepancy, Pawansut Trader reserves the right to cancel the affected order and issue an immediate refund.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. Order Acceptance & Processing</h2>
        <p>
          Placement of an order constitutes an offer to purchase. An order is confirmed only when our administrative team updates its status to &quot;Confirmed&quot;. We reserve the right to cancel orders with unreachable mobile numbers or invalid addresses.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. Delivery Terms & Hospital Coverage</h2>
        <p>
          Delivery operations currently cover: <strong>Satyawadi Raja Harish Chandra Hospital, Narela, Delhi - 110040</strong> and immediate surrounding designated delivery zones [owner to confirm].
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li><strong>Free Delivery:</strong> Applies automatically to all orders with an item subtotal of ₹499 or more (after coupon discounts).</li>
          <li><strong>Standard Delivery Fee:</strong> ₹80 delivery fee applies to orders below ₹499.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">5. Cancellation & Adjustments</h2>
        <p>
          Customers may request cancellation before dispatch by contacting our WhatsApp support (+91 8505856763) with their Order ID.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">6. Warranty Claims</h2>
        <p>
          Warranty terms are governed by our Refund & Warranty Policy. A physical warranty card handed over at delivery along with the Order ID or retail bill is required for all warranty replacements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">7. Governing Law & Jurisdiction</h2>
        <p>
          These terms are governed by Indian law. Courts located in <strong>[Delhi - owner to confirm]</strong> shall have exclusive jurisdiction over any disputes arising from transactions on this site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">8. Contact Information</h2>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li><strong>Support Email:</strong> [SUPPORT_EMAIL - OWNER TO FILL]</li>
          <li><strong>WhatsApp Support:</strong> +91 8505856763</li>
          <li><strong>Registered Store:</strong> [SHOP_ADDRESS - OWNER TO FILL]</li>
        </ul>
      </section>
    </PolicyContainer>
  );
}
