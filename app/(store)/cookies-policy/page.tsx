import { Metadata } from "next";
import { PolicyContainer } from "@/components/store/policy-container";

export const metadata: Metadata = {
  title: "Cookies Policy | Pawansut Trader",
  description: "Explanation of essential local storage and session cookies used on Pawansut Trader.",
  openGraph: {
    title: "Cookies Policy | Pawansut Trader",
    description: "Learn about how Pawansut Trader uses essential browser storage.",
    type: "website",
  },
};

export default function CookiesPolicyPage() {
  return (
    <PolicyContainer
      title="Cookies & Storage Policy"
      description="Information on browser cookies and local storage mechanisms utilized on Pawansut Trader."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. What are Cookies and Local Storage?</h2>
        <p>
          Cookies and local storage are standard web technologies that allow websites to store small amounts of data locally on your device to enable core website functionalities like keeping items in your shopping bag.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. Essential Storage Keys We Use</h2>
        <p>
          Pawansut Trader does not run third-party advertising cookies, retargeting beacons, or behavioral tracking scripts. We utilize only <strong>strictly essential keys</strong>:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border border-neutral-800 rounded-xl overflow-hidden">
            <thead className="bg-neutral-900 text-neutral-300">
              <tr>
                <th className="p-3 border-b border-neutral-800">Storage Key</th>
                <th className="p-3 border-b border-neutral-800">Type</th>
                <th className="p-3 border-b border-neutral-800">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-400">
              <tr>
                <td className="p-3 font-mono text-white text-xs">pt_cart_v1</td>
                <td className="p-3">Local Storage</td>
                <td className="p-3">Stores cart items, selected variants, and quantities across page reloads.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-white text-xs">pt_wishlist_v1</td>
                <td className="p-3">Local Storage</td>
                <td className="p-3">Remembers your saved favorite products.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-white text-xs">pt_cookie_ok</td>
                <td className="p-3">Local Storage</td>
                <td className="p-3">Stores your acknowledgement of this essential storage notice.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-white text-xs">__session</td>
                <td className="p-3">HTTP-only Cookie</td>
                <td className="p-3">Secure, encrypted administrative login session cookie for store managers.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. Third-Party Payment Services</h2>
        <p>
          When completing an online payment via our checkout, Cashfree Payments may initialize security cookies necessary for PCI-DSS compliance, token validation, and fraud detection.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. Managing Your Preferences</h2>
        <p>
          You may clear or block cookies and local storage through your browser settings at any time. However, clearing local storage will erase your cart items and require re-adding products.
        </p>
      </section>
    </PolicyContainer>
  );
}
