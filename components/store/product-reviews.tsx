"use client";

import React, { useState } from "react";
import { Star, ShieldCheck, CheckCircle2, AlertCircle, Loader2, MessageSquarePlus, X } from "lucide-react";
import type { Review } from "@/types";

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialReviews: Review[];
}

export function ProductReviews({ productId, productName, initialReviews }: ProductReviewsProps) {
  const [reviews] = useState<Review[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Computed rating statistics
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : "5.0";

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits per §7.7, §13
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (phone.length !== 10) {
      setSubmitError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!orderId.trim()) {
      setSubmitError("Please enter your Order ID.");
      return;
    }

    if (!name.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }

    if (text.trim().length < 5) {
      setSubmitError("Review comment must be at least 5 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          orderId: orderId.trim(),
          phone,
          name: name.trim(),
          rating,
          text: text.trim(),
          honeypot,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to submit review.");
      }

      setSubmitSuccess(json.message || "Review submitted successfully!");
      // Reset form
      setOrderId("");
      setPhone("");
      setName("");
      setText("");
      setRating(5);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8 border-t border-steel/30 pt-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-porcelain">
              Verified Customer Reviews
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Buyers Only
            </span>
          </div>
          <p className="text-ash text-sm mt-1">
            Real feedback from confirmed purchasers delivered at Satyawadi Raja Harish Chandra Hospital.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setSubmitSuccess(null);
            setSubmitError(null);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Ratings Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-carbon/50 rounded-tile p-6 border border-steel/20">
        <div className="flex flex-col items-center justify-center text-center p-2 border-b sm:border-b-0 sm:border-r border-steel/20">
          <span className="text-4xl font-extrabold text-porcelain">{avgRating}</span>
          <div className="flex items-center gap-1 text-amber-400 my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(Number(avgRating)) ? "fill-amber-400" : "text-neutral-700"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-ash">
            Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="col-span-2 flex flex-col justify-center px-2 sm:px-6 space-y-2 text-xs text-ash">
          <div className="flex items-center gap-2">
            <span className="w-12 text-right">5 stars</span>
            <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: `${reviewCount > 0 ? (reviews.filter((r) => r.rating === 5).length / reviewCount) * 100 : 100}%`,
                }}
              />
            </div>
            <span className="w-8 text-right font-mono">
              {reviews.filter((r) => r.rating === 5).length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-12 text-right">4 stars</span>
            <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: `${reviewCount > 0 ? (reviews.filter((r) => r.rating === 4).length / reviewCount) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="w-8 text-right font-mono">
              {reviews.filter((r) => r.rating === 4).length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-12 text-right">1-3 stars</span>
            <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: `${reviewCount > 0 ? (reviews.filter((r) => r.rating <= 3).length / reviewCount) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="w-8 text-right font-mono">
              {reviews.filter((r) => r.rating <= 3).length}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-carbon/20 rounded-tile border border-steel/10 text-ash text-sm space-y-2">
          <p>No verified reviews yet for this product.</p>
          <p className="text-xs text-neutral-500">
            Purchased this item? Click &quot;Write a Review&quot; using your delivered Order ID.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-tile bg-carbon/40 border border-steel/20 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-porcelain text-sm">{rev.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Order
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? "fill-amber-400" : "text-neutral-700"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-ash text-xs sm:text-sm leading-relaxed whitespace-pre-line pt-1">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-2 text-[10px] text-neutral-600 font-mono">
                Order: {rev.orderId}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Write a Verified Review
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  For: <span className="text-white font-medium">{productName}</span>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informational Verification Rule */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
              <strong>Order Verification:</strong> Only customers with a delivered order matching the Order ID &amp; mobile number can submit reviews. Submissions are moderated before publishing.
            </div>

            {submitSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-emerald-300 text-sm font-medium">{submitSuccess}</p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot */}
                <input
                  type="text"
                  name="user_nickname"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order ID */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Order ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PT-000001"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-sm focus:border-blue-500 focus:outline-none uppercase font-mono"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      10-Digit Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="8505856763"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-sm focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Rating Stars Selection */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRating(starVal)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            starVal <= rating ? "text-amber-400 fill-amber-400" : "text-neutral-700"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-neutral-400 ml-2 font-mono">
                      {rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Review Comments (max 500 chars) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={500}
                    placeholder="Share your experience regarding performance, build quality, and delivery speed..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                  />
                  <div className="text-right text-[10px] text-neutral-500">
                    {text.length}/500
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-900/20 border border-red-800/40 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {submitError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Verifying Order...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
