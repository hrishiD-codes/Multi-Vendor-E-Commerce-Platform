"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Package, Tag, AlertTriangle, CheckCircle } from "lucide-react";
import { getProduct, getProducts } from "@/lib/api/productApi";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then(({ data }) => {
        setProduct(data);
        // fetch related products in same category
        if (data.category_id) {
          getProducts({ category_id: data.category_id, per_page: 4, page: 1 })
            .then((res) => setRelated((res.data || []).filter((p) => p.id !== data.id)))
            .catch(() => {});
        }
      })
      .catch(() => {
        toast.error("Product not found.");
        router.push("/products");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded-xl w-3/4" />
            <div className="h-4 bg-muted rounded-xl w-1/3" />
            <div className="h-12 bg-muted rounded-xl w-1/2" />
            <div className="h-4 bg-muted rounded-xl" />
            <div className="h-4 bg-muted rounded-xl w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const available = product.inventory?.available_quantity ?? 0;
  const isOutOfStock = available === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <span>{product.category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
          )}
          {product.is_featured && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              Featured
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          {product.category && (
            <Link
              href={`/products?category_id=${product.category_id}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-3"
            >
              <Tag className="w-3.5 h-3.5" />
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-primary">${parseFloat(product.price).toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  In Stock {available <= 10 && `(Only ${available} left)`}
                </span>
              </div>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
          )}

          {/* Quantity + Add to Cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 hover:bg-muted transition-colors text-lg font-medium"
                >
                  −
                </button>
                <span className="px-6 py-2.5 font-semibold text-foreground border-x border-border">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                  className="px-4 py-2.5 hover:bg-muted transition-colors text-lg font-medium"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => toast.success(`${quantity}x ${product.name} added to cart!`)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground text-sm p-3 rounded-xl bg-muted/50">
            <Package className="w-4 h-4" />
            <span>Free shipping on orders over $50</span>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{p.name}</p>
                    <p className="text-primary font-bold mt-1">${parseFloat(p.price).toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
