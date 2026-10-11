import React from "react";
import Link from "next/link";
import type { Category } from "@/types";
import { CategoryIcon } from "@/components/store/category-icon";

interface CategoryRowProps {
  categories: Category[];
}

export function CategoryRow({ categories }: CategoryRowProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-porcelain">
          Browse by Category
        </h2>
        <Link
          href="/products"
          className="text-electric-link text-xs sm:text-sm hover:underline font-medium min-h-[44px] flex items-center"
        >
          View all catalog &rarr;
        </Link>
      </div>

      {/* Clean category items without boxes or cards per spec */}
      <div className="flex items-start gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-x-visible md:flex-wrap md:justify-center md:gap-8 lg:gap-10">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            aria-label={`Browse ${cat.name}`}
            className="group snap-start shrink-0 flex flex-col items-center justify-start text-center p-1 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue w-20 sm:w-24 md:w-28 min-h-[44px]"
          >
            {/* Clean icon: size ~28-30px, ash/#86868b, hover -> #2997ff */}
            <div className="w-12 h-12 flex items-center justify-center text-ash group-hover:text-electric-link group-hover:scale-110 transition-all duration-200">
              <CategoryIcon iconName={cat.icon} size={30} />
            </div>

            {/* Category name: 12-14px, #f5f5f7 */}
            <span className="text-xs sm:text-sm font-medium text-porcelain group-hover:text-electric-link transition-colors line-clamp-2 leading-snug mt-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
