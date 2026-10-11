"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle, XCircle, Trash2, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import type { Review } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      if (json.data) {
        setReviews(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleApproval = async (reviewId: string, currentApproved: boolean) => {
    setActionLoadingId(reviewId);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !currentApproved }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update review status");
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, approved: !currentApproved } : r))
      );
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    setActionLoadingId(reviewId);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to delete review");
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            Customer Reviews Moderation
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Review customer feedback verified against delivered orders. Approve to display on product pages.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs font-medium">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === "all" ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white"
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === "pending" ? "bg-amber-500 text-black font-semibold" : "text-neutral-400 hover:text-white"
            }`}
          >
            Pending
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] text-white font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === "approved" ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white"
            }`}
          >
            Approved ({reviews.filter((r) => r.approved).length})
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800 text-neutral-500">
          No reviews found for selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isActing = actionLoadingId === review.id;

            return (
              <div
                key={review.id}
                className="p-5 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-base">{review.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                        Order: {review.orderId}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 font-mono">
                        {review.productId}
                      </span>
                      {review.approved ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Pending Approval
                        </span>
                      )}
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-400 pt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-amber-400" : "text-neutral-700"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-neutral-400 ml-2 font-mono">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleApproval(review.id, review.approved)}
                      disabled={isActing}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        review.approved
                          ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      }`}
                    >
                      {isActing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : review.approved ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isActing}
                      title="Delete review"
                      className="p-1.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-neutral-800/80 text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                  &ldquo;{review.text}&rdquo;
                </div>

                <div className="text-[11px] text-neutral-500 font-mono">
                  Submitted: {new Date(review.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
