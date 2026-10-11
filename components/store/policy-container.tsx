import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

interface PolicyContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function PolicyContainer({ title, description, children }: PolicyContainerProps) {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
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
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            Official Store Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            {title}
          </h1>
          <p className="text-neutral-400 text-base leading-relaxed">
            {description}
          </p>
          <div className="mt-4 inline-block text-xs font-mono text-neutral-500 bg-neutral-900/60 px-2.5 py-1 rounded border border-neutral-800">
            Last Updated: [DATE - OWNER TO FILL]
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8 text-neutral-300 leading-relaxed text-sm sm:text-base">
          {children}
        </div>
      </div>
    </div>
  );
}
