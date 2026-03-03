import {
  ChevronDown,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  Type,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "Purple!Monkey$Dishwasher#42";
const LS_AUTH = "jade_admin_auth";
const LS_PRODUCTS = "jade_products";
const LS_REVIEWS = "jade_reviews";
const LS_ORDERS = "jade_orders";
const LS_FAQ = "jade_faq";
const LS_HERO = "jade_hero";
const LS_ABOUT = "jade_about";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AdminProduct {
  id: number;
  name: string;
  category: string;
  priceCents: number;
  imageUrl?: string;
}

export interface AdminReview {
  id: number;
  reviewerName: string;
  itemName: string;
  rating: number;
  quote: string;
  date: string;
}

export interface AdminOrder {
  id: number;
  orderNo: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  paymentMethod: string;
  items: string;
  totalCents: number;
  status: string;
  createdAt: string;
}

export interface AdminFaq {
  id: number;
  keywords: string;
  answer: string;
}

export interface AdminHero {
  tagline: string;
  ctaText: string;
  seasonLabel: string;
}

export interface AdminAbout {
  heading: string;
  ethosParagraph: string;
  workParagraph: string;
}

// ─── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_PRODUCTS: AdminProduct[] = [
  { id: 1, name: "Void Hoodie", category: "Tops", priceCents: 11900 },
  { id: 2, name: "Utility Cargo", category: "Bottoms", priceCents: 14500 },
  { id: 3, name: "Oversized Tee", category: "Tops", priceCents: 6500 },
  { id: 4, name: "Blank Bomber", category: "Outerwear", priceCents: 21900 },
  { id: 5, name: "Track Pant", category: "Bottoms", priceCents: 9800 },
  { id: 6, name: "Logo Cap", category: "Accessories", priceCents: 4500 },
];

const DEFAULT_REVIEWS: AdminReview[] = [
  {
    id: 1,
    reviewerName: "Priya M.",
    itemName: "Void Hoodie",
    rating: 5,
    quote:
      "The Void Hoodie is incredible — heavyweight fabric, perfect drop shoulder. It arrived beautifully packaged, feels like it'll last a decade.",
    date: "Feb 2026",
  },
  {
    id: 2,
    reviewerName: "Jordan K.",
    itemName: "Utility Cargo",
    rating: 5,
    quote:
      "Ordered the Utility Cargo and was blown away by the quality. The seams are impeccable and the fit is exactly how the photos show. Shipping was faster than expected.",
    date: "Jan 2026",
  },
  {
    id: 3,
    reviewerName: "Sana L.",
    itemName: "Oversized Tee",
    rating: 4,
    quote:
      "Got the Oversized Tee and Logo Cap together. The cap stitching is clean, the tee drapes beautifully. Definitely ordering the Bomber next.",
    date: "Feb 2026",
  },
  {
    id: 4,
    reviewerName: "Marcus T.",
    itemName: "Blank Bomber",
    rating: 5,
    quote:
      "JADE is the real deal. No gimmicks, just great garments. The Blank Bomber's shell fabric is premium — you feel it the moment you pick it up.",
    date: "Jan 2026",
  },
  {
    id: 5,
    reviewerName: "Aiko R.",
    itemName: "Track Pant",
    rating: 5,
    quote:
      "Packaging alone impressed me — minimal, no waste. The Track Pants fit perfectly and the waistband is sturdy. This brand actually cares about every detail.",
    date: "Dec 2025",
  },
];

const DEFAULT_FAQ: AdminFaq[] = [
  {
    id: 1,
    keywords: "size,sizing,fit,measurement,measurements,xs,sm,lg,xl",
    answer:
      "Our pieces run true to size. We recommend sizing up for an oversized fit.",
  },
  {
    id: 2,
    keywords: "ship,shipping,delivery,arrive,arrives,track,tracking,dispatch",
    answer:
      "We ship worldwide. Standard delivery is 5–7 business days. Express is 2–3 days.",
  },
  {
    id: 3,
    keywords: "return,returns,refund,exchange,send back",
    answer:
      "Returns accepted within 30 days of delivery. Items must be unworn and unwashed.",
  },
  {
    id: 4,
    keywords: "pay,payment,credit,card,paypal,checkout,stripe",
    answer: "We accept all major credit cards and PayPal.",
  },
];

const DEFAULT_HERO: AdminHero = {
  tagline: "Wear Less.  Mean More.",
  ctaText: "Shop Now",
  seasonLabel: "Collection 001 — 2026",
};

const DEFAULT_ABOUT: AdminAbout = {
  heading: "Built for those\nwho need nothing\nto prove everything.",
  ethosParagraph:
    "JADE was born from the quiet. Not the silence of giving up — but the silence of not needing to explain yourself. Every piece we make strips away the noise: no logos demanding attention, no trends chasing relevance. Just form, weight, and intention.",
  workParagraph:
    "Heavyweight fabrics. Constructed seams. Proportions that move with the body, not against it. We work with a small network of factories that share our obsession with material integrity. Less, always — but never cheap.",
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId<T extends { id: number }>(arr: T[]): number {
  return arr.length === 0 ? 1 : Math.max(...arr.map((x) => x.id)) + 1;
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────
type Section = "products" | "reviews" | "orders" | "faq" | "hero" | "about";

const NAV_ITEMS: Array<{ id: Section; label: string; icon: React.ReactNode }> =
  [
    {
      id: "products",
      label: "Products",
      icon: <Package className="w-4 h-4" />,
    },
    { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      id: "faq",
      label: "FAQ Rules",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    { id: "hero", label: "Hero", icon: <Sparkles className="w-4 h-4" /> },
    { id: "about", label: "About", icon: <Type className="w-4 h-4" /> },
  ];

// ─── Reusable UI helpers ──────────────────────────────────────────────────────
function SectionHeader({
  title,
  onAdd,
  addLabel,
  ocidAdd,
}: {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  ocidAdd?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
      <h2
        className="font-display text-2xl tracking-tightest text-foreground"
        style={{ fontVariationSettings: '"wght" 900' }}
      >
        {title}
      </h2>
      {onAdd && (
        <button
          type="button"
          data-ocid={ocidAdd}
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background font-body text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel ?? "Add"}
        </button>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">
      {children}
    </p>
  );
}

function AdminInput({
  value,
  onChange,
  placeholder,
  type = "text",
  "data-ocid": ocid,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  "data-ocid"?: string;
}) {
  return (
    <input
      type={type}
      data-ocid={ocid}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-card border border-border/40 px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors duration-150"
    />
  );
}

function AdminTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  "data-ocid": ocid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  "data-ocid"?: string;
}) {
  return (
    <textarea
      data-ocid={ocid}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-card border border-border/40 px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors duration-150 resize-y"
    />
  );
}

function SaveButton({
  onClick,
  "data-ocid": ocid,
}: {
  onClick: () => void;
  "data-ocid"?: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className="mt-6 px-8 py-2.5 bg-foreground text-background font-body text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors duration-150"
    >
      Save Changes
    </button>
  );
}

// ─── Confirm Delete modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({
  open,
  onConfirm,
  onCancel,
  label,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  label: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onCancel}
            onKeyDown={(e) => e.key === "Escape" && onCancel()}
            role="button"
            tabIndex={-1}
            aria-label="Close dialog"
          />
          <motion.div
            data-ocid="admin.delete_dialog"
            className="relative z-10 bg-card border border-border/60 p-6 w-[320px] max-w-[90vw]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <p
              className="font-display text-base tracking-tightest text-foreground mb-1"
              style={{ fontVariationSettings: '"wght" 700' }}
            >
              Delete {label}?
            </p>
            <p className="font-body text-xs text-muted-foreground mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="admin.delete_dialog.confirm_button"
                onClick={onConfirm}
                className="flex-1 py-2 bg-destructive text-destructive-foreground font-body text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
              <button
                type="button"
                data-ocid="admin.delete_dialog.cancel_button"
                onClick={onCancel}
                className="flex-1 py-2 border border-border/60 text-muted-foreground font-body text-xs tracking-widest uppercase hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── PRODUCTS SECTION ─────────────────────────────────────────────────────────
function ProductsSection() {
  const [products, setProducts] = useState<AdminProduct[]>(() =>
    readLS(LS_PRODUCTS, DEFAULT_PRODUCTS),
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  const blank = (): Omit<AdminProduct, "id"> => ({
    name: "",
    category: "",
    priceCents: 0,
    imageUrl: "",
  });

  const [form, setForm] = useState<Omit<AdminProduct, "id">>(blank());

  const save = (arr: AdminProduct[]) => {
    setProducts(arr);
    writeLS(LS_PRODUCTS, arr);
  };

  const openAdd = () => {
    setForm(blank());
    setAddingNew(true);
    setEditingId(null);
  };

  const openEdit = (p: AdminProduct) => {
    setForm({
      name: p.name,
      category: p.category,
      priceCents: p.priceCents,
      imageUrl: p.imageUrl ?? "",
    });
    setEditingId(p.id);
    setAddingNew(false);
  };

  const confirmAdd = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    const updated = [...products, { id: nextId(products), ...form }];
    save(updated);
    setAddingNew(false);
    toast.success("Product added");
  };

  const confirmEdit = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    const updated = products.map((p) =>
      p.id === editingId ? { ...p, ...form } : p,
    );
    save(updated);
    setEditingId(null);
    toast.success("Product updated");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const updated = products.filter((p) => p.id !== deleteTarget.id);
    save(updated);
    setDeleteTarget(null);
    toast.success("Product deleted");
  };

  const priceCentsToRupees = (cents: number) => (cents / 100).toFixed(0);
  const rupeesToPriceCents = (str: string) =>
    Math.round(Number.parseFloat(str) * 100) || 0;

  return (
    <section data-ocid="admin.products_section">
      <SectionHeader
        title="Products"
        onAdd={openAdd}
        addLabel="Add Product"
        ocidAdd="admin.products.add_button"
      />

      {/* Add row */}
      <AnimatePresence>
        {addingNew && (
          <motion.div
            className="mb-4 p-4 bg-card border border-border/60"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p
              className="font-display text-sm tracking-tightest text-muted-foreground mb-3"
              style={{ fontVariationSettings: '"wght" 700' }}
            >
              New Product
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <FieldLabel>Name</FieldLabel>
                <AdminInput
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="Void Hoodie"
                />
              </div>
              <div>
                <FieldLabel>Category</FieldLabel>
                <AdminInput
                  value={form.category}
                  onChange={(v) => setForm((f) => ({ ...f, category: v }))}
                  placeholder="Tops"
                />
              </div>
              <div>
                <FieldLabel>Price (₹)</FieldLabel>
                <AdminInput
                  type="number"
                  value={priceCentsToRupees(form.priceCents)}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      priceCents: rupeesToPriceCents(v),
                    }))
                  }
                  placeholder="119"
                />
              </div>
              <div className="sm:col-span-3">
                <FieldLabel>Image URL</FieldLabel>
                <AdminInput
                  value={form.imageUrl ?? ""}
                  onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmAdd}
                className="px-4 py-1.5 bg-foreground text-background font-body text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setAddingNew(false)}
                className="px-4 py-1.5 border border-border/60 text-muted-foreground font-body text-xs tracking-widest uppercase hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left pb-3 font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground pr-4">
                Image
              </th>
              <th className="text-left pb-3 font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground pr-4">
                Name
              </th>
              <th className="text-left pb-3 font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground pr-4">
                Category
              </th>
              <th className="text-left pb-3 font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground pr-4">
                Price (₹)
              </th>
              <th className="text-right pb-3 font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.id}
                data-ocid={`admin.products.item.${i + 1}`}
                className="border-b border-border/20 group"
              >
                {editingId === p.id ? (
                  <>
                    <td className="py-2 pr-4" colSpan={4}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <div>
                          <FieldLabel>Name</FieldLabel>
                          <AdminInput
                            value={form.name}
                            onChange={(v) =>
                              setForm((f) => ({ ...f, name: v }))
                            }
                          />
                        </div>
                        <div>
                          <FieldLabel>Category</FieldLabel>
                          <AdminInput
                            value={form.category}
                            onChange={(v) =>
                              setForm((f) => ({ ...f, category: v }))
                            }
                          />
                        </div>
                        <div>
                          <FieldLabel>Price (₹)</FieldLabel>
                          <AdminInput
                            type="number"
                            value={priceCentsToRupees(form.priceCents)}
                            onChange={(v) =>
                              setForm((f) => ({
                                ...f,
                                priceCents: rupeesToPriceCents(v),
                              }))
                            }
                          />
                        </div>
                        <div>
                          <FieldLabel>Image URL</FieldLabel>
                          <AdminInput
                            value={form.imageUrl ?? ""}
                            onChange={(v) =>
                              setForm((f) => ({ ...f, imageUrl: v }))
                            }
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={confirmEdit}
                          className="font-body text-[10px] tracking-[0.2em] uppercase px-3 py-1 bg-foreground text-background hover:bg-foreground/90 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="font-body text-[10px] tracking-[0.2em] uppercase px-3 py-1 border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 pr-4">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 object-cover bg-card border border-border/30"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-card border border-border/30 flex items-center justify-center text-muted-foreground/30">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-foreground">
                      {p.name}
                    </td>
                    <td className="py-3 pr-4 font-body text-xs text-muted-foreground tracking-widest uppercase">
                      {p.category}
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-foreground">
                      ₹{priceCentsToRupees(p.priceCents)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          data-ocid={`admin.products.edit_button.${i + 1}`}
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Edit product"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`admin.products.delete_button.${i + 1}`}
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        label={deleteTarget?.name ?? "product"}
      />
    </section>
  );
}

// ─── REVIEWS SECTION ──────────────────────────────────────────────────────────
function ReviewsSectionAdmin() {
  const [reviews, setReviews] = useState<AdminReview[]>(() =>
    readLS(LS_REVIEWS, DEFAULT_REVIEWS),
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);

  const blank = (): Omit<AdminReview, "id"> => ({
    reviewerName: "",
    itemName: "",
    rating: 5,
    quote: "",
    date: "",
  });

  const [form, setForm] = useState<Omit<AdminReview, "id">>(blank());

  const save = (arr: AdminReview[]) => {
    setReviews(arr);
    writeLS(LS_REVIEWS, arr);
  };

  const openAdd = () => {
    setForm(blank());
    setAddingNew(true);
    setEditingId(null);
  };

  const openEdit = (r: AdminReview) => {
    setForm({
      reviewerName: r.reviewerName,
      itemName: r.itemName,
      rating: r.rating,
      quote: r.quote,
      date: r.date,
    });
    setEditingId(r.id);
    setAddingNew(false);
  };

  const confirmAdd = () => {
    if (!form.reviewerName.trim()) {
      toast.error("Reviewer name is required");
      return;
    }
    const updated = [...reviews, { id: nextId(reviews), ...form }];
    save(updated);
    setAddingNew(false);
    toast.success("Review added");
  };

  const confirmEdit = () => {
    if (!form.reviewerName.trim()) {
      toast.error("Reviewer name is required");
      return;
    }
    const updated = reviews.map((r) =>
      r.id === editingId ? { ...r, ...form } : r,
    );
    save(updated);
    setEditingId(null);
    toast.success("Review updated");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const updated = reviews.filter((r) => r.id !== deleteTarget.id);
    save(updated);
    setDeleteTarget(null);
    toast.success("Review deleted");
  };

  const ReviewFormFields = ({
    f,
    set,
  }: {
    f: Omit<AdminReview, "id">;
    set: React.Dispatch<React.SetStateAction<Omit<AdminReview, "id">>>;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
      <div>
        <FieldLabel>Reviewer Name</FieldLabel>
        <AdminInput
          value={f.reviewerName}
          onChange={(v) => set((prev) => ({ ...prev, reviewerName: v }))}
          placeholder="Priya M."
        />
      </div>
      <div>
        <FieldLabel>Item Name</FieldLabel>
        <AdminInput
          value={f.itemName}
          onChange={(v) => set((prev) => ({ ...prev, itemName: v }))}
          placeholder="Void Hoodie"
        />
      </div>
      <div>
        <FieldLabel>Rating (1–5)</FieldLabel>
        <AdminInput
          type="number"
          value={f.rating}
          onChange={(v) =>
            set((prev) => ({
              ...prev,
              rating: Math.min(5, Math.max(1, Number.parseInt(v) || 5)),
            }))
          }
          placeholder="5"
        />
      </div>
      <div>
        <FieldLabel>Date</FieldLabel>
        <AdminInput
          value={f.date}
          onChange={(v) => set((prev) => ({ ...prev, date: v }))}
          placeholder="Feb 2026"
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>Quote</FieldLabel>
        <AdminTextarea
          value={f.quote}
          onChange={(v) => set((prev) => ({ ...prev, quote: v }))}
          placeholder="Customer's review..."
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <section data-ocid="admin.reviews_section">
      <SectionHeader
        title="Reviews"
        onAdd={openAdd}
        addLabel="Add Review"
        ocidAdd="admin.reviews.add_button"
      />

      {/* Add form */}
      <AnimatePresence>
        {addingNew && (
          <motion.div
            className="mb-4 p-4 bg-card border border-border/60"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p
              className="font-display text-sm tracking-tightest text-muted-foreground mb-3"
              style={{ fontVariationSettings: '"wght" 700' }}
            >
              New Review
            </p>
            <ReviewFormFields f={form} set={setForm} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmAdd}
                className="px-4 py-1.5 bg-foreground text-background font-body text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setAddingNew(false)}
                className="px-4 py-1.5 border border-border/60 text-muted-foreground font-body text-xs tracking-widest uppercase hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-0">
        {reviews.map((r, i) => (
          <div
            key={r.id}
            data-ocid={`admin.reviews.item.${i + 1}`}
            className="border-b border-border/20 group"
          >
            {editingId === r.id ? (
              <div className="py-3">
                <ReviewFormFields f={form} set={setForm} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={confirmEdit}
                    className="px-4 py-1.5 bg-foreground text-background font-body text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-4 py-1.5 border border-border/60 text-muted-foreground font-body text-xs tracking-widest uppercase hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="font-display text-sm tracking-tightest text-foreground"
                      style={{ fontVariationSettings: '"wght" 700' }}
                    >
                      {r.reviewerName}
                    </span>
                    <span className="font-body text-[10px] tracking-widest uppercase text-muted-foreground/60">
                      {r.itemName}
                    </span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: r.rating }).map((_, si) => (
                        <Star
                          // biome-ignore lint/suspicious/noArrayIndexKey: positional
                          key={si}
                          className="w-2.5 h-2.5 fill-foreground text-foreground"
                        />
                      ))}
                    </span>
                    <span className="font-body text-[10px] text-muted-foreground/50">
                      {r.date}
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground line-clamp-2">
                    "{r.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    data-ocid={`admin.reviews.edit_button.${i + 1}`}
                    onClick={() => openEdit(r)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Edit review"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    data-ocid={`admin.reviews.delete_button.${i + 1}`}
                    onClick={() => setDeleteTarget(r)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        label={deleteTarget?.reviewerName ?? "review"}
      />
    </section>
  );
}

// ─── ORDERS SECTION ────────────────────────────────────────────────────────────
const ORDER_STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];

function OrdersSection() {
  const [orders, setOrders] = useState<AdminOrder[]>(() =>
    readLS(LS_ORDERS, []),
  );

  const updateStatus = (id: number, status: string) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(updated);
    writeLS(LS_ORDERS, updated);
    toast.success("Order status updated");
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "Delivered":
        return "text-emerald-400";
      case "Shipped":
        return "text-sky-400";
      case "Cancelled":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <section data-ocid="admin.orders_section">
      <SectionHeader title="Orders" />

      {orders.length === 0 ? (
        <div
          data-ocid="admin.orders.empty_state"
          className="py-16 flex flex-col items-center justify-center border border-border/30 bg-card/30"
        >
          <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mb-4" />
          <p
            className="font-display text-base tracking-tightest text-muted-foreground/50"
            style={{ fontVariationSettings: '"wght" 700' }}
          >
            No orders yet
          </p>
          <p className="font-body text-xs text-muted-foreground/40 mt-1">
            Customer orders will appear here
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border/40">
                {[
                  "Order No",
                  "Customer",
                  "City",
                  "Payment",
                  "Total (₹)",
                  "Status",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-3 font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground pr-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr
                  key={o.id}
                  data-ocid={`admin.orders.item.${i + 1}`}
                  className="border-b border-border/20"
                >
                  <td className="py-3 pr-4 font-body text-xs text-muted-foreground">
                    #{o.orderNo}
                  </td>
                  <td className="py-3 pr-4 font-body text-sm text-foreground">
                    {o.customerName}
                  </td>
                  <td className="py-3 pr-4 font-body text-xs text-muted-foreground">
                    {o.city}
                  </td>
                  <td className="py-3 pr-4 font-body text-xs text-muted-foreground tracking-widest uppercase">
                    {o.paymentMethod}
                  </td>
                  <td className="py-3 pr-4 font-body text-sm text-foreground">
                    ₹{(o.totalCents / 100).toFixed(0)}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="relative">
                      <select
                        data-ocid={`admin.orders.status_select.${i + 1}`}
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`appearance-none bg-transparent border border-border/40 px-2 py-1 font-body text-xs tracking-widest uppercase pr-6 focus:outline-none focus:border-foreground/40 cursor-pointer ${statusColor(o.status)}`}
                        style={{ colorScheme: "dark" }}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>
                  </td>
                  <td className="py-3 font-body text-xs text-muted-foreground/60">
                    {o.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── FAQ SECTION ──────────────────────────────────────────────────────────────
function FaqSection() {
  const [faqs, setFaqs] = useState<AdminFaq[]>(() =>
    readLS(LS_FAQ, DEFAULT_FAQ),
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminFaq | null>(null);

  const blank = (): Omit<AdminFaq, "id"> => ({ keywords: "", answer: "" });
  const [form, setForm] = useState<Omit<AdminFaq, "id">>(blank());

  const save = (arr: AdminFaq[]) => {
    setFaqs(arr);
    writeLS(LS_FAQ, arr);
  };

  const openAdd = () => {
    setForm(blank());
    setAddingNew(true);
    setEditingId(null);
  };

  const openEdit = (f: AdminFaq) => {
    setForm({ keywords: f.keywords, answer: f.answer });
    setEditingId(f.id);
    setAddingNew(false);
  };

  const confirmAdd = () => {
    if (!form.keywords.trim()) {
      toast.error("Keywords are required");
      return;
    }
    const updated = [...faqs, { id: nextId(faqs), ...form }];
    save(updated);
    setAddingNew(false);
    toast.success("FAQ rule added");
  };

  const confirmEdit = () => {
    if (!form.keywords.trim()) {
      toast.error("Keywords are required");
      return;
    }
    const updated = faqs.map((f) =>
      f.id === editingId ? { ...f, ...form } : f,
    );
    save(updated);
    setEditingId(null);
    toast.success("FAQ rule updated");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    save(faqs.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("FAQ rule deleted");
  };

  const FaqFormFields = ({
    f,
    set,
  }: {
    f: Omit<AdminFaq, "id">;
    set: React.Dispatch<React.SetStateAction<Omit<AdminFaq, "id">>>;
  }) => (
    <div className="grid grid-cols-1 gap-3 mb-3">
      <div>
        <FieldLabel>Keywords (comma-separated)</FieldLabel>
        <AdminInput
          value={f.keywords}
          onChange={(v) => set((prev) => ({ ...prev, keywords: v }))}
          placeholder="size,sizing,fit,measurement"
        />
      </div>
      <div>
        <FieldLabel>Answer</FieldLabel>
        <AdminTextarea
          value={f.answer}
          onChange={(v) => set((prev) => ({ ...prev, answer: v }))}
          placeholder="Answer text..."
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <section data-ocid="admin.faq_section">
      <SectionHeader
        title="FAQ Rules"
        onAdd={openAdd}
        addLabel="Add Rule"
        ocidAdd="admin.faq.add_button"
      />

      <AnimatePresence>
        {addingNew && (
          <motion.div
            className="mb-4 p-4 bg-card border border-border/60"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p
              className="font-display text-sm tracking-tightest text-muted-foreground mb-3"
              style={{ fontVariationSettings: '"wght" 700' }}
            >
              New FAQ Rule
            </p>
            <FaqFormFields f={form} set={setForm} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmAdd}
                className="px-4 py-1.5 bg-foreground text-background font-body text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setAddingNew(false)}
                className="px-4 py-1.5 border border-border/60 text-muted-foreground font-body text-xs tracking-widest uppercase hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-0">
        {faqs.map((faq, i) => (
          <div
            key={faq.id}
            data-ocid={`admin.faq.item.${i + 1}`}
            className="border-b border-border/20 group"
          >
            {editingId === faq.id ? (
              <div className="py-3">
                <FaqFormFields f={form} set={setForm} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={confirmEdit}
                    className="px-4 py-1.5 bg-foreground text-background font-body text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-4 py-1.5 border border-border/60 text-muted-foreground font-body text-xs tracking-widest uppercase hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {faq.keywords.split(",").map((kw) => (
                      <span
                        key={kw.trim()}
                        className="font-body text-[9px] tracking-[0.15em] uppercase px-1.5 py-0.5 border border-border/40 text-muted-foreground"
                      >
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="font-body text-xs text-muted-foreground line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    data-ocid={`admin.faq.edit_button.${i + 1}`}
                    onClick={() => openEdit(faq)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Edit FAQ rule"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    data-ocid={`admin.faq.delete_button.${i + 1}`}
                    onClick={() => setDeleteTarget(faq)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete FAQ rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        label="FAQ rule"
      />
    </section>
  );
}

// ─── HERO SECTION EDITOR ──────────────────────────────────────────────────────
function HeroSectionEditor() {
  const [data, setData] = useState<AdminHero>(() =>
    readLS(LS_HERO, DEFAULT_HERO),
  );

  const handleSave = () => {
    writeLS(LS_HERO, data);
    toast.success("Hero content saved");
  };

  return (
    <section data-ocid="admin.hero_section">
      <SectionHeader title="Hero Content" />
      <div className="max-w-xl space-y-4">
        <div>
          <FieldLabel>Tagline</FieldLabel>
          <AdminInput
            data-ocid="admin.hero_tagline_input"
            value={data.tagline}
            onChange={(v) => setData((d) => ({ ...d, tagline: v }))}
            placeholder="Wear Less.  Mean More."
          />
        </div>
        <div>
          <FieldLabel>CTA Button Text</FieldLabel>
          <AdminInput
            data-ocid="admin.hero_cta_input"
            value={data.ctaText}
            onChange={(v) => setData((d) => ({ ...d, ctaText: v }))}
            placeholder="Shop Now"
          />
        </div>
        <div>
          <FieldLabel>Season Label</FieldLabel>
          <AdminInput
            data-ocid="admin.hero_season_input"
            value={data.seasonLabel}
            onChange={(v) => setData((d) => ({ ...d, seasonLabel: v }))}
            placeholder="Collection 001 — 2026"
          />
        </div>
        <SaveButton data-ocid="admin.hero.save_button" onClick={handleSave} />
      </div>
    </section>
  );
}

// ─── ABOUT SECTION EDITOR ─────────────────────────────────────────────────────
function AboutSectionEditor() {
  const [data, setData] = useState<AdminAbout>(() =>
    readLS(LS_ABOUT, DEFAULT_ABOUT),
  );

  const handleSave = () => {
    writeLS(LS_ABOUT, data);
    toast.success("About content saved");
  };

  return (
    <section data-ocid="admin.about_section">
      <SectionHeader title="About Content" />
      <div className="max-w-xl space-y-4">
        <div>
          <FieldLabel>Heading</FieldLabel>
          <AdminTextarea
            data-ocid="admin.about_heading_textarea"
            value={data.heading}
            onChange={(v) => setData((d) => ({ ...d, heading: v }))}
            placeholder="Built for those..."
            rows={3}
          />
          <p className="font-body text-[10px] text-muted-foreground/50 mt-1">
            Use line breaks to split the heading across lines
          </p>
        </div>
        <div>
          <FieldLabel>The Ethos Paragraph</FieldLabel>
          <AdminTextarea
            data-ocid="admin.about_ethos_textarea"
            value={data.ethosParagraph}
            onChange={(v) => setData((d) => ({ ...d, ethosParagraph: v }))}
            rows={4}
          />
        </div>
        <div>
          <FieldLabel>The Work Paragraph</FieldLabel>
          <AdminTextarea
            data-ocid="admin.about_work_textarea"
            value={data.workParagraph}
            onChange={(v) => setData((d) => ({ ...d, workParagraph: v }))}
            rows={4}
          />
        </div>
        <SaveButton data-ocid="admin.about.save_button" onClick={handleSave} />
      </div>
    </section>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({
  active,
  onNav,
  onLogout,
  mobileOpen,
  onMobileClose,
}: {
  active: Section;
  onNav: (s: Section) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/40 flex items-center justify-between">
        <span
          className="font-display text-xl tracking-tightest text-foreground"
          style={{ fontVariationSettings: '"wght" 900' }}
        >
          JADE
        </span>
        <button
          type="button"
          onClick={onMobileClose}
          className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Admin label */}
      <div className="px-5 py-3 border-b border-border/30">
        <p className="font-body text-[9px] tracking-[0.35em] uppercase text-muted-foreground/50">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-ocid={`admin.nav_${item.id}_link`}
            onClick={() => {
              onNav(item.id);
              onMobileClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 font-body text-sm tracking-wide transition-all duration-150 text-left ${
              active === item.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-border/40">
        <button
          type="button"
          data-ocid="admin.logout_button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 font-body text-sm text-muted-foreground hover:text-destructive hover:bg-card transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        data-ocid="admin.sidebar"
        className="hidden md:flex flex-col w-[220px] shrink-0 bg-card border-r border-border/40 h-screen sticky top-0"
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              data-ocid="admin.sidebar"
              className="fixed left-0 top-0 bottom-0 z-50 w-[220px] bg-card border-r border-border/40 md:hidden flex flex-col"
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState<Section>("products");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleNav = (s: Section) => {
    setActiveSection(s);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "products":
        return <ProductsSection />;
      case "reviews":
        return <ReviewsSectionAdmin />;
      case "orders":
        return <OrdersSection />;
      case "faq":
        return <FaqSection />;
      case "hero":
        return <HeroSectionEditor />;
      case "about":
        return <AboutSectionEditor />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        active={activeSection}
        onNav={handleNav}
        onLogout={onLogout}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span
            className="font-display text-lg tracking-tightest text-foreground"
            style={{ fontVariationSettings: '"wght" 900' }}
          >
            JADE
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div ref={mainRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="px-6 md:px-10 py-8"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(LS_AUTH, "true");
      onLogin();
    } else {
      setError(true);
      setShaking(true);
      setPassword("");
      setTimeout(() => setShaking(false), 600);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
    if (error) setError(false);
  };

  return (
    <div
      data-ocid="admin.login_panel"
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 80px, oklch(0.13 0 0) 80px, oklch(0.13 0 0) 81px)",
      }}
    >
      {/* Grain */}
      <div className="grain fixed inset-0 pointer-events-none z-0" />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <h1
            className="font-display text-[80px] leading-none tracking-tightest text-foreground"
            style={{ fontVariationSettings: '"wght" 900' }}
          >
            JADE
          </h1>
          <p className="font-body text-[10px] tracking-[0.45em] uppercase text-muted-foreground mt-2">
            Admin Access
          </p>
        </div>

        {/* Form */}
        <motion.div
          animate={shaking ? { x: [-6, 6, -5, 5, -3, 3, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              data-ocid="admin.password_input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter password"
              className="w-full bg-card border border-border/60 px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors p-0.5"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            type="button"
            data-ocid="admin.login_button"
            onClick={handleLogin}
            className="w-full py-3.5 bg-foreground text-background font-display text-sm tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors duration-150"
            style={{ fontVariationSettings: '"wght" 700' }}
          >
            Enter
          </button>

          <AnimatePresence>
            {error && (
              <motion.p
                data-ocid="admin.login_error_state"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-body text-xs text-destructive text-center tracking-wide"
              >
                Incorrect password
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Back to site link */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            ← Back to site
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ADMIN PAGE (main export) ─────────────────────────────────────────────────
export function AdminPage() {
  const [authed, setAuthed] = useState(() => {
    return localStorage.getItem(LS_AUTH) === "true";
  });

  const handleLogin = () => setAuthed(true);

  const handleLogout = () => {
    localStorage.removeItem(LS_AUTH);
    setAuthed(false);
  };

  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
