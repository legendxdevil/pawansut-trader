"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { STORE_CONFIG } from "@/lib/store-config";
import { checkoutFormSchema } from "@/lib/validation/checkout";
import { calculateDeliveryCharge } from "@/lib/delivery";

export default function CheckoutPage() {
  const router = useRouter();
  const { hydratedItems, subtotal, deliveryCharge, isFreeDelivery, total, hasStockIssue, clearCart } =
    useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    address: "",
    landmark: "",
    city: "Delhi",
    pincode: "",
    email: "",
    paymentMode: "cod" as "cod" | "online",
    hospitalConfirmed: false,
    couponCode: "",
    honeypot: "",
  });

  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: "percent" | "flat";
    value: number;
    discount: number;
    newSubtotal: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const hasCheckedInitialCoupon = useRef(false);

  // Recalculate totals taking coupon discount into account
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryResult = calculateDeliveryCharge({ subtotal, discount });
  const effectiveDeliveryCharge = deliveryResult.charge;
  const effectiveIsFreeDelivery = deliveryResult.isFree;
  const effectiveTotal = Math.max(0, subtotal - discount) + effectiveDeliveryCharge;

  const handleApplyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a promo code");
      return;
    }
    if (subtotal <= 0) {
      setCouponError("Cart subtotal must be greater than zero");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setCouponError(json.error?.message || "Invalid coupon code");
        setAppliedCoupon(null);
        setFormData((prev) => ({ ...prev, couponCode: "" }));
      } else if (json.data) {
        setAppliedCoupon(json.data);
        setCouponInput(json.data.code);
        setCouponSuccess(`Coupon "${json.data.code}" applied! Saved ₹${json.data.discount}`);
        setFormData((prev) => ({ ...prev, couponCode: json.data.code }));
      }
    } catch {
      setCouponError("Failed to validate coupon. Please check connection.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
    setCouponSuccess(null);
    setFormData((prev) => ({ ...prev, couponCode: "" }));
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !hasCheckedInitialCoupon.current) {
      const params = new URLSearchParams(window.location.search);
      const initialCode = params.get("coupon")?.trim().toUpperCase();
      if (initialCode) {
        hasCheckedInitialCoupon.current = true;
        setCouponInput(initialCode);
        if (subtotal > 0) {
          handleApplyCoupon(initialCode);
        }
      }
    }
  }, [subtotal]);

  // Field refs for auto-focusing the first error field (§7.7)
  const nameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const pincodeRef = useRef<HTMLInputElement>(null);
  const hospitalCheckRef = useRef<HTMLInputElement>(null);

  // Strip non-digits on mobile input (§7.7, §13)
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: "" }));
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: digitsOnly }));
    if (errors.pincode) {
      setErrors((prev) => ({ ...prev, pincode: "" }));
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double-submit (§13)
    setGlobalError(null);

    if (hydratedItems.length === 0) {
      setGlobalError("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (hasStockIssue) {
      setGlobalError("Please resolve stock quantity issues in your cart before placing an order.");
      return;
    }

    if (STORE_CONFIG.restrictDeliveryToHospital && !formData.hospitalConfirmed) {
      setErrors((prev) => ({
        ...prev,
        hospitalConfirmed: "Please confirm that your delivery is at the hospital campus.",
      }));
      hospitalCheckRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      hospitalCheckRef.current?.focus({ preventScroll: true });
      return;
    }

    // Validate with Zod
    const payload = {
      fullName: formData.fullName.trim(),
      mobile: formData.mobile.trim(),
      address: formData.address.trim(),
      landmark: formData.landmark.trim() || undefined,
      city: formData.city.trim() || "Delhi",
      pincode: formData.pincode.trim(),
      email: formData.email.trim() || undefined,
      paymentMode: formData.paymentMode,
      hospitalConfirmed: formData.hospitalConfirmed,
      couponCode: appliedCoupon ? appliedCoupon.code : (formData.couponCode.trim() || undefined),
      honeypot: formData.honeypot,
      items: hydratedItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        qty: item.qty,
      })),
    };

    const parsed = checkoutFormSchema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      const flattened = parsed.error.flatten().fieldErrors;
      for (const [key, val] of Object.entries(flattened)) {
        if (val && val[0]) {
          fieldErrors[key] = val[0];
        }
      }
      setErrors(fieldErrors);

      // Focus and scroll first error field into view (§7.7, §13)
      const scrollToAndFocus = (ref: React.RefObject<HTMLElement>) => {
        if (ref.current) {
          ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
          ref.current.focus({ preventScroll: true });
        }
      };

      if (fieldErrors.fullName) scrollToAndFocus(nameRef);
      else if (fieldErrors.mobile) scrollToAndFocus(mobileRef);
      else if (fieldErrors.address) scrollToAndFocus(addressRef);
      else if (fieldErrors.pincode) scrollToAndFocus(pincodeRef);
      else if (fieldErrors.hospitalConfirmed) scrollToAndFocus(hospitalCheckRef);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        if (json.error?.fields) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(json.error.fields)) {
            mapped[k] = Array.isArray(v) ? v[0] : String(v);
          }
          setErrors(mapped);
        }
        setGlobalError(json.error?.message || "Order placement failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Order created successfully
      const { docId } = json.data;
      clearCart();
      window.location.href = `/order-success/${docId}`;
    } catch {
      setGlobalError("Network error. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  const renderCouponSection = () => (
    <div className="bg-graphite/60 rounded-tile border border-steel/30 p-3.5 sm:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-porcelain flex items-center gap-1.5">
          <Tag size={14} className="text-apple-blue" />
          <span>Apply Promo Code</span>
        </span>
        {appliedCoupon && (
          <span className="text-[11px] font-medium text-success flex items-center gap-1">
            <CheckCircle2 size={12} /> Applied
          </span>
        )}
      </div>

      {appliedCoupon ? (
        <div className="bg-success/15 border border-success/30 rounded-tile p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
              <Tag size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-porcelain font-mono tracking-wide truncate">
                {appliedCoupon.code}
              </p>
              <p className="text-[11px] text-success">
                Savings: ₹{appliedCoupon.discount} {appliedCoupon.type === "percent" ? `(${appliedCoupon.value}% off)` : "flat off"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="text-xs text-ash hover:text-error transition-colors flex items-center gap-1 p-1.5 rounded-pill hover:bg-steel/20 shrink-0"
            title="Remove coupon"
          >
            <X size={14} />
            <span>Remove</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. WELCOME10"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                if (couponError) setCouponError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyCoupon();
                }
              }}
              className="flex-1 bg-[rgba(255,255,255,0.04)] text-porcelain px-3.5 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:text-ash"
            />
            <button
              type="button"
              disabled={isValidatingCoupon || !couponInput.trim()}
              onClick={() => handleApplyCoupon()}
              className="bg-steel/40 hover:bg-steel/70 disabled:opacity-40 text-porcelain font-medium text-xs px-4 py-2 rounded-pill transition-colors flex items-center gap-1.5 shrink-0 min-h-[38px]"
            >
              {isValidatingCoupon ? (
                <>
                  <Loader2 size={13} className="animate-spin text-apple-blue" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Apply</span>
              )}
            </button>
          </div>

          {couponError && (
            <div className="text-xs text-error flex items-center gap-1.5 pt-0.5">
              <AlertCircle size={13} className="shrink-0" />
              <span>{couponError}</span>
            </div>
          )}

          {couponSuccess && (
            <div className="text-xs text-success flex items-center gap-1.5 pt-0.5">
              <CheckCircle2 size={13} />
              <span>{couponSuccess}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32 lg:pb-12 space-y-6 sm:space-y-8">
      {/* Top back button & heading */}
      <div className="flex items-center gap-4 border-b border-steel/30 pb-4">
        <Link
          href="/cart"
          className="text-ash hover:text-porcelain transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 rounded-full"
          aria-label="Back to cart"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Guest Checkout</h1>
          <p className="text-xs text-ash">No registration required. Fast and direct delivery.</p>
        </div>
      </div>

      {globalError && (
        <div className="bg-error/15 border border-error/40 text-error text-xs p-4 rounded-tile flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Mobile Collapsible Order Summary (< lg) (§7.7, STEP 3) */}
      <div className="lg:hidden bg-carbon rounded-tile border border-steel/30 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMobileSummary((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 text-xs font-semibold text-porcelain min-h-[44px] hover:bg-steel/10 transition-colors"
          aria-expanded={showMobileSummary}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-apple-blue" />
            <span>
              {showMobileSummary ? "Hide order summary" : "Show order summary"} ({hydratedItems.length} {hydratedItems.length === 1 ? "item" : "items"})
            </span>
            <ChevronDown
              size={14}
              className={`text-ash transition-transform duration-200 ${
                showMobileSummary ? "rotate-180" : ""
              }`}
            />
          </div>
          <span className="text-sm font-bold text-apple-blue">₹{effectiveTotal}</span>
        </button>

        {showMobileSummary && (
          <div className="p-4 pt-0 border-t border-steel/20 space-y-4">
            {/* Items list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 pt-3">
              {hydratedItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex items-center justify-between gap-3 text-xs border-b border-steel/15 pb-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      ) : (
                        <span className="text-[9px] font-bold text-obsidian/60">PT</span>
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-porcelain font-medium truncate">{item.name}</p>
                      <p className="text-ash text-[11px]">
                        {item.variantLabel} &times; {item.qty}
                      </p>
                    </div>
                  </div>
                  <span className="text-porcelain font-semibold whitespace-nowrap">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code section */}
            {renderCouponSection()}

            {/* Price breakdown */}
            <div className="space-y-2 text-xs border-t border-steel/20 pt-3">
              <div className="flex justify-between text-ash">
                <span>Subtotal</span>
                <span className="text-porcelain font-medium">₹{subtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-success">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    <span>Discount ({appliedCoupon.code})</span>
                  </span>
                  <span className="font-semibold">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-ash">
                <span>Delivery (Hospital Campus)</span>
                <span className={effectiveIsFreeDelivery ? "text-success font-semibold" : "text-porcelain font-medium"}>
                  {effectiveIsFreeDelivery ? "FREE" : `₹${effectiveDeliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-porcelain pt-2 border-t border-steel/20">
                <span>Total</span>
                <span className="text-apple-blue">₹{effectiveTotal}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Form (Left) & Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checkout Form (7 cols on lg) */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-7 space-y-6">
          {/* Honeypot field (hidden from screen & readers) */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={formData.honeypot}
              onChange={(e) => handleInputChange("honeypot", e.target.value)}
            />
          </div>

          {/* Delivery Location Notice (§7.7, §3.1) */}
          {STORE_CONFIG.restrictDeliveryToHospital && (
            <div className="bg-carbon rounded-tile border border-steel/40 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-porcelain">
                <Truck size={16} className="text-apple-blue" />
                <span>Hospital Delivery Notice</span>
              </div>
              <p className="text-xs text-ash leading-relaxed">
                {STORE_CONFIG.hospitalNotice}
              </p>
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-porcelain/90 select-none pt-1">
                <input
                  ref={hospitalCheckRef}
                  type="checkbox"
                  checked={formData.hospitalConfirmed}
                  onChange={(e) => handleInputChange("hospitalConfirmed", e.target.checked)}
                  aria-required="true"
                  className="w-4 h-4 mt-0.5 rounded border-steel bg-graphite text-apple-blue focus:ring-0"
                />
                <span className="font-medium">
                  {STORE_CONFIG.hospitalConfirmationText} <span className="text-error font-bold">*</span>
                </span>
              </label>
              {errors.hospitalConfirmed && (
                <p className="text-xs text-error">{errors.hospitalConfirmed}</p>
              )}
            </div>
          )}

          {/* Contact & Delivery Details Card */}
          <div className="bg-carbon rounded-tile border border-steel/30 p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-semibold tracking-tight text-porcelain border-b border-steel/20 pb-3">
              1. Delivery Details
            </h2>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">
                Full Name <span className="text-error font-bold">*</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                aria-required="true"
                aria-describedby={errors.fullName ? "name-error" : undefined}
                className={`w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border text-base sm:text-sm placeholder:text-ash ${
                  errors.fullName ? "border-error focus:border-error" : "border-slate focus:border-apple-blue"
                }`}
              />
              {errors.fullName && (
                <p id="name-error" className="text-xs text-error">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">
                Mobile Number (10 digits) <span className="text-error font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xs font-medium text-ash select-none">
                  +91
                </span>
                <input
                  ref={mobileRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  aria-required="true"
                  aria-describedby={errors.mobile ? "mobile-error" : undefined}
                  className={`w-full bg-[rgba(255,255,255,0.04)] text-porcelain pl-12 pr-4 py-2.5 rounded-pill border text-base sm:text-sm tracking-wide placeholder:text-ash ${
                    errors.mobile ? "border-error focus:border-error" : "border-slate focus:border-apple-blue"
                  }`}
                />
              </div>
              {errors.mobile && (
                <p id="mobile-error" className="text-xs text-error">
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">
                Delivery Address <span className="text-error font-bold">*</span>
              </label>
              <textarea
                ref={addressRef}
                rows={3}
                autoComplete="street-address"
                placeholder="Building, Ward, Department, Floor, or Room number"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                aria-required="true"
                aria-describedby={errors.address ? "address-error" : undefined}
                className={`w-full bg-[rgba(255,255,255,0.04)] text-porcelain p-4 rounded-tile border text-base sm:text-sm placeholder:text-ash resize-none ${
                  errors.address ? "border-error focus:border-error" : "border-slate focus:border-apple-blue"
                }`}
              />
              {errors.address && (
                <p id="address-error" className="text-xs text-error">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Landmark & Pincode Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ash">Landmark (Optional)</label>
                <input
                  type="text"
                  autoComplete="address-line2"
                  placeholder="e.g. Near OPD Gate"
                  value={formData.landmark}
                  onChange={(e) => handleInputChange("landmark", e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-sm placeholder:text-ash"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-porcelain">
                  Pincode <span className="text-error font-bold">*</span>
                </label>
                <input
                  ref={pincodeRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  placeholder="110040"
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  aria-required="true"
                  aria-describedby={errors.pincode ? "pincode-error" : undefined}
                  className={`w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border text-base sm:text-sm placeholder:text-ash ${
                    errors.pincode ? "border-error focus:border-error" : "border-slate focus:border-apple-blue"
                  }`}
                />
                {errors.pincode && (
                  <p id="pincode-error" className="text-xs text-error">
                    {errors.pincode}
                  </p>
                )}
              </div>
            </div>

            {/* City & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ash">City</label>
                <input
                  type="text"
                  autoComplete="address-level2"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ash">Email (Optional)</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="for invoice copy"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-sm placeholder:text-ash"
                />
              </div>
            </div>
          </div>

          {/* Promo Code Section on Mobile (inside form for quick visibility) */}
          <div className="lg:hidden">
            {renderCouponSection()}
          </div>

          {/* Payment Mode Selection Card */}
          <div className="bg-carbon rounded-tile border border-steel/30 p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold tracking-tight text-porcelain border-b border-steel/20 pb-3">
              2. Payment Mode <span className="text-error font-bold">*</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* COD Option */}
              <label
                className={`p-4 rounded-tile border cursor-pointer transition-all flex items-start gap-3 min-h-[44px] ${
                  formData.paymentMode === "cod"
                    ? "border-apple-blue bg-apple-blue/10"
                    : "border-steel/40 bg-graphite/60 hover:border-slate"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="cod"
                  checked={formData.paymentMode === "cod"}
                  onChange={() => handleInputChange("paymentMode", "cod")}
                  className="mt-1 text-apple-blue focus:ring-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-porcelain">
                    <span>Cash on Delivery (COD)</span>
                    <CheckCircle2 size={16} className="text-success" />
                  </div>
                  <p className="text-xs text-ash">
                    Pay with cash or UPI directly when your accessory is handed over.
                  </p>
                </div>
              </label>

              {/* Online Payment Option (Disabled per §7.7 and §9) */}
              <div className="p-4 rounded-tile border border-steel/30 bg-graphite/40 opacity-60 cursor-not-allowed space-y-1 relative min-h-[44px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-porcelain">Online (Cashfree)</span>
                  <span className="text-[10px] bg-steel/60 text-ash px-2 py-0.5 rounded-pill">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-ash">
                  Online payments will be available following payment gateway activation in Phase 9.
                </p>
              </div>
            </div>
          </div>

          {/* In-form Submit Button (visible on desktop) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/60 text-white font-semibold text-base py-3.5 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-none min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <span>Place Order via COD (₹{effectiveTotal})</span>
            )}
          </button>

          {/* Sticky Mobile Place Order Bar (< lg) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-carbon/95 backdrop-blur-md border-t border-steel/30 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-35 flex items-center justify-between gap-3 shadow-2xl">
            <div>
              <span className="text-[10px] text-ash block uppercase font-semibold">Total to Pay</span>
              <span className="text-base font-bold text-porcelain">₹{effectiveTotal}</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/60 text-white font-semibold text-sm py-3 px-4 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Confirming...</span>
                </>
              ) : (
                <span>Place Order via COD</span>
              )}
            </button>
          </div>
        </form>

        {/* Order Summary Sidebar (Desktop only, 5 cols on lg) */}
        <div className="hidden lg:block lg:col-span-5 bg-carbon rounded-tile border border-steel/30 p-6 space-y-5 sticky top-16">
          <h2 className="text-base font-semibold tracking-tight text-porcelain border-b border-steel/20 pb-3">
            Order Review ({hydratedItems.length})
          </h2>

          {/* Items list */}
          <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
            {hydratedItems.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex items-center justify-between gap-3 text-xs border-b border-steel/15 pb-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-obsidian/60">PT</span>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-porcelain font-medium truncate">{item.name}</p>
                    <p className="text-ash text-[11px]">
                      {item.variantLabel} &times; {item.qty}
                    </p>
                  </div>
                </div>
                <span className="text-porcelain font-semibold whitespace-nowrap">
                  ₹{item.price * item.qty}
                </span>
              </div>
            ))}
          </div>

          {/* Promo Code section */}
          {renderCouponSection()}

          {/* Price summary */}
          <div className="space-y-2 text-xs border-t border-steel/20 pt-4">
            <div className="flex justify-between text-ash">
              <span>Subtotal</span>
              <span className="text-porcelain font-medium">₹{subtotal}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  <span>Discount ({appliedCoupon.code})</span>
                </span>
                <span className="font-semibold">-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-ash">
              <span>Delivery Fee (Hospital Campus)</span>
              <span className={effectiveIsFreeDelivery ? "text-success font-semibold" : "text-porcelain font-medium"}>
                {effectiveIsFreeDelivery ? "FREE" : `₹${effectiveDeliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-porcelain pt-3 border-t border-steel/20">
              <span>Grand Total</span>
              <span className="text-apple-blue">₹{effectiveTotal}</span>
            </div>
          </div>

          {/* Warranty assurance */}
          <div className="bg-graphite rounded-tile p-3 text-[11px] text-ash space-y-1 border border-steel/20">
            <div className="flex items-center gap-1.5 text-optical-yellow font-medium">
              <ShieldCheck size={14} />
              <span>Physical Warranty Card Included</span>
            </div>
            <p>
              Your official warranty card will be provided in person upon delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
