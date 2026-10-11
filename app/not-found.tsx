import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-[28px] bg-neutral-900 border border-neutral-800 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold font-mono">
            404 Error
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            The page you are looking for may have been moved, deleted, or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors"
          >
            Browse Products
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-neutral-800 text-white font-medium text-sm hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
