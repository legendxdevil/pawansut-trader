"use client";

import React, { useState, useEffect } from "react";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { Announcement } from "@/types";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/announcements");
      const json = await res.json();
      if (json.data) {
        setAnnouncements(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          link: link.trim() || undefined,
          isActive,
          order: Number(order) || 1,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error?.message || "Failed to create announcement");
      } else {
        setSuccess(true);
        setText("");
        setLink("");
        setOrder(String(announcements.length + 2));
        fetchAnnouncements();
      }
    } catch {
      setError("Network error while creating announcement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-porcelain">
          Store Announcements
        </h1>
        <p className="text-xs text-ash mt-0.5">
          Manage header ticker strips shown at the very top of customer pages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Form */}
        <form onSubmit={handleCreate} className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-porcelain border-b border-steel/20 pb-2 flex items-center gap-2">
            <Plus size={16} className="text-apple-blue" />
            <span>Create Announcement</span>
          </h2>

          {error && (
            <div className="bg-error/15 border border-error/30 text-error text-xs p-3 rounded-tile flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-success/15 border border-success/30 text-success text-xs p-3 rounded-tile flex items-center gap-2">
              <CheckCircle2 size={14} className="flex-shrink-0" />
              <span>Announcement published!</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">Announcement Text *</label>
            <textarea
              rows={2}
              placeholder="e.g. Free delivery on all orders above ₹499 across hospital campus!"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain p-3 rounded-tile border border-slate focus:border-apple-blue text-xs resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ash">Target Link (Optional)</label>
            <input
              type="text"
              placeholder="/products or /contact"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">Rotation Sequence (Order)</label>
            <input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-porcelain select-none pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-apple-blue bg-graphite border-steel"
            />
            <span className="font-semibold">Active (Display in carousel)</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/60 text-white font-semibold text-xs py-2.5 rounded-pill transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Publish Announcement</span>
            )}
          </button>
        </form>

        {/* Existing Announcements List */}
        <div className="lg:col-span-2 bg-carbon rounded-tile border border-steel/30 overflow-hidden">
          <div className="p-4 border-b border-steel/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-ash uppercase">
              Current Announcements ({announcements.length})
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-ash text-xs">Loading announcements...</div>
          ) : (
            <div className="divide-y divide-steel/20 text-xs">
              {announcements.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between hover:bg-steel/10 transition-colors gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-steel/40 flex items-center justify-center text-porcelain font-bold text-xs flex-shrink-0">
                      {a.order}
                    </div>
                    <div>
                      <p className="font-semibold text-porcelain">{a.text}</p>
                      {a.link && <p className="text-electric-link text-[11px] font-mono">{a.link}</p>}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-pill text-[10px] font-semibold flex-shrink-0 ${
                      a.isActive
                        ? "bg-success/20 text-success"
                        : "bg-error/20 text-error"
                    }`}
                  >
                    {a.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
