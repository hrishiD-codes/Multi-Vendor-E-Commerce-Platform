"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api/productApi";
import { toast } from "sonner";

function CategoryForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial.name ?? "", slug: initial.slug ?? "",
    description: initial.description ?? "", is_active: initial.is_active ?? true,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Name <span className="text-red-500">*</span></label>
          <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Slug (leave blank to auto-generate)</label>
          <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
        <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 accent-primary" />
        <span className="text-sm font-medium text-foreground">Active</span>
      </label>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm">Cancel</button>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
        </button>
      </div>
    </form>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createCategory(data, "");
      toast.success("Category created!");
      setShowAdd(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    setFormLoading(true);
    try {
      await updateCategory(id, data, "");
      toast.success("Category updated!");
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Deactivate category "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id, "");
      toast.success("Category deactivated.");
      fetchCategories();
    } catch {
      toast.error("Failed to deactivate category.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">Organise your products into categories</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 p-6 rounded-2xl border border-primary/30 bg-card shadow-sm">
          <h2 className="font-semibold text-foreground mb-4">New Category</h2>
          <CategoryForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={formLoading} />
        </div>
      )}

      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Slug</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Products</th>
              <th className="text-center px-5 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-muted rounded-lg" /></td>)}
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-muted-foreground">
                  <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No categories yet. Create one to get started.</p>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <>
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{cat.name}</td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-4 text-right text-muted-foreground">{cat.products?.length ?? "—"}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cat.is_active ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-600"}`}>
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingId(editingId === cat.id ? null : cat.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === cat.id && (
                    <tr key={`edit-${cat.id}`}>
                      <td colSpan={5} className="px-5 py-4 bg-muted/20">
                        <CategoryForm initial={cat} onSubmit={(data) => handleUpdate(cat.id, data)} onCancel={() => setEditingId(null)} loading={formLoading} />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
