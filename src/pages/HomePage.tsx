import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useProfileById } from "@/hooks/useProfiles";
import { ProductCard } from "@/components/shared/ProductCard";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/mockData";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading } = useProducts({
    category: selectedCategory || undefined,
    search: search || undefined,
  });

  return (
    <div className="animate-fade-in">
      {/* Search bar */}
      <div className="px-4 py-3 sticky top-14 z-30 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-muted rounded-xl px-3 py-2 gap-2">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            />
          </div>
          <button className="p-2 rounded-xl bg-muted hover:bg-accent transition-colors">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pb-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              !selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      {/* Product grid */}
      {!isLoading && products && (
        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && products?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No products found. Be the first to list!</p>
        </div>
      )}
    </div>
  );
}
