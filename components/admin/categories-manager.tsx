"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteCategoryAction } from "@/lib/actions/categories";
import { CategoryForm } from "./category-form";
import type { Category } from "@/lib/types";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const topLevel = categories.filter((c) => !c.parent_id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products in it will become uncategorized.")) return;
    const result = await deleteCategoryAction(id);
    if (result.error) toast.error(result.error);
    else toast.success("Category deleted");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        {showNew ? (
          <div className="rounded-2xl border border-border bg-card p-4">
            <CategoryForm topLevelCategories={topLevel} onDone={() => setShowNew(false)} />
          </div>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add category
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {topLevel.map((cat) => (
          <div key={cat.id} className="rounded-2xl border border-border bg-card">
            <CategoryRow
              category={cat}
              topLevel={topLevel}
              editing={editingId === cat.id}
              onEdit={() => setEditingId(cat.id)}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDelete(cat.id)}
            />
            {(cat.children ?? []).length > 0 && (
              <div className="flex flex-col gap-1 border-t border-border p-2 ps-8">
                {cat.children!.map((child) => (
                  <CategoryRow
                    key={child.id}
                    category={child}
                    topLevel={topLevel}
                    editing={editingId === child.id}
                    onEdit={() => setEditingId(child.id)}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => handleDelete(child.id)}
                    nested
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  topLevel,
  editing,
  onEdit,
  onCancel,
  onDelete,
  nested,
}: {
  category: Category;
  topLevel: Category[];
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  nested?: boolean;
}) {
  if (editing) {
    return (
      <div className={nested ? "rounded-xl bg-background p-3" : "p-4"}>
        <CategoryForm topLevelCategories={topLevel} initial={category} onDone={onCancel} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${nested ? "rounded-xl px-3 py-2 hover:bg-background" : "p-4"}`}>
      <div>
        <p className="font-semibold">
          {category.name_en} <span className="text-muted">— {category.name_ar}</span>
        </p>
        <p className="text-xs text-muted">/{category.slug}</p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="rounded-lg p-2 hover:bg-foreground/5" aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-danger hover:bg-danger/10"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
