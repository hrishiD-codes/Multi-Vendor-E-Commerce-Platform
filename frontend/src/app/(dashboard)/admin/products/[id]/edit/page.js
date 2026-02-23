"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getProduct, updateProduct, getCategories } from "@/lib/api/productApi";
import { toast } from "sonner";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "", description: "", price: "", sku: "",
    image_url: "", category_id: "", is_active: true, is_featured: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([
      getProduct(id),
      getCategories(),
    ])
      .then(([productRes, catRes]) => {
        const p = productRes.data;
        setForm({
          name: p.name, description: p.description ?? "", price: p.price,
          sku: p.sku, image_url: p.image_url ?? "", category_id: p.category_id ?? "",
          is_active: p.is_active, is_featured: p.is_featured,
        });
        setCategories(catRes.data || []);
      })
      .catch(() => { toast.error("Failed to load product."); router.push("/admin/products"); })
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await updateProduct(id, form, "");
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {};
      setErrors(fieldErrors);
      toast.error(err.response?.data?.message || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground text-sm">Update product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
          <h2 className="font-semibold text-foreground">Basic Information</h2>

          {[
            { label: "Product Name", name: "name", type: "text", required: true },
            { label: "SKU", name: "sku", type: "text", required: true },
            { label: "Price ($)", name: "price", type: "number", required: true, step: "0.01", min: "0" },
            { label: "Image URL", name: "image_url", type: "url" },
          ].map(({ label, name, ...rest }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {label} {rest.required && <span className="text-red-500">*</span>}
              </label>
              <input
                name={name} value={form[name] || ""} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                {...rest}
              />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name][0]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">No Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm font-medium text-foreground">Active</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm font-medium text-foreground">Featured</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/products" className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">Cancel</Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
