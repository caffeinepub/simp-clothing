import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  User,
  X as XIcon,
} from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";

import type { Product } from "./backend.d";
import { CartDrawer } from "./components/CartDrawer";
import { CategoriesSection } from "./components/CategoriesSection";
import { ChatWidget } from "./components/ChatWidget";
import { PaymentModal } from "./components/PaymentModal";
import { ProfilePanel } from "./components/ProfilePanel";
import { ReviewsSection } from "./components/ReviewsSection";
import { Toaster } from "./components/ui/sonner";

const AdminPage = lazy(() =>
  import("./components/AdminPage").then((m) => ({ default: m.AdminPage })),
);
const TrackOrderPage = lazy(() =>
  import("./components/TrackOrderPage").then((m) => ({
    default: m.TrackOrderPage,
  })),
);
import { type CartProduct, CartProvider, useCart } from "./context/CartContext";
import { useGetAllProducts } from "./hooks/useQueries";

// ─── localStorage helpers ─────────────────────────────────────────────────────
function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface HeroSettings {
  tagline: string;
  ctaText: string;
  seasonLabel: string;
}

interface AboutSettings {
  heading: string;
  ethosParagraph: string;
  workParagraph: string;
}

const DEFAULT_HERO_SETTINGS: HeroSettings = {
  tagline: "Wear Less.  Mean More.",
  ctaText: "Shop Now",
  seasonLabel: "Collection 001 — 2026",
};

const DEFAULT_ABOUT_SETTINGS: AboutSettings = {
  heading: "Built for those\nwho need nothing\nto prove everything.",
  ethosParagraph:
    "JADE was born from the quiet. Not the silence of giving up — but the silence of not needing to explain yourself. Every piece we make strips away the noise: no logos demanding attention, no trends chasing relevance. Just form, weight, and intention.",
  workParagraph:
    "Heavyweight fabrics. Constructed seams. Proportions that move with the body, not against it. We work with a small network of factories that share our obsession with material integrity. Less, always — but never cheap.",
};

// ─── Fallback product data shown if backend returns empty ────────────────────
const FALLBACK_PRODUCTS: Array<
  Omit<Product, "id" | "priceCents"> & {
    id: number;
    priceCents: number;
    image: string;
    images: string[];
  }
> = [
  {
    id: 1,
    name: "Void Hoodie",
    category: "Tops",
    priceCents: 11900,
    image: "/assets/generated/simp-hoodie.dim_600x750.jpg",
    images: ["/assets/generated/simp-hoodie.dim_600x750.jpg"],
  },
  {
    id: 2,
    name: "Utility Cargo",
    category: "Bottoms",
    priceCents: 14500,
    image: "/assets/generated/simp-cargo.dim_600x750.jpg",
    images: ["/assets/generated/simp-cargo.dim_600x750.jpg"],
  },
  {
    id: 3,
    name: "Oversized Tee",
    category: "Tops",
    priceCents: 6500,
    image: "/assets/generated/simp-tee.dim_600x750.jpg",
    images: ["/assets/generated/simp-tee.dim_600x750.jpg"],
  },
  {
    id: 4,
    name: "Blank Bomber",
    category: "Outerwear",
    priceCents: 21900,
    image: "/assets/generated/simp-bomber.dim_600x750.jpg",
    images: ["/assets/generated/simp-bomber.dim_600x750.jpg"],
  },
  {
    id: 5,
    name: "Track Pant",
    category: "Bottoms",
    priceCents: 9800,
    image: "/assets/generated/simp-trackpants.dim_600x750.jpg",
    images: ["/assets/generated/simp-trackpants.dim_600x750.jpg"],
  },
  {
    id: 6,
    name: "Logo Cap",
    category: "Accessories",
    priceCents: 4500,
    image: "/assets/generated/simp-cap.dim_600x750.jpg",
    images: ["/assets/generated/simp-cap.dim_600x750.jpg"],
  },
];

const PRODUCT_IMAGES: Record<number, string> = {
  0: "/assets/generated/simp-hoodie.dim_600x750.jpg",
  1: "/assets/generated/simp-cargo.dim_600x750.jpg",
  2: "/assets/generated/simp-tee.dim_600x750.jpg",
  3: "/assets/generated/simp-bomber.dim_600x750.jpg",
  4: "/assets/generated/simp-trackpants.dim_600x750.jpg",
  5: "/assets/generated/simp-cap.dim_600x750.jpg",
};

function formatPrice(priceCents: bigint | number): string {
  const cents =
    typeof priceCents === "bigint" ? Number(priceCents) : priceCents;
  return `₹${(cents / 100).toFixed(0)}`;
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({
  onShopClick,
  onAboutClick,
  onProfileClick,
}: {
  onShopClick: () => void;
  onAboutClick: () => void;
  onProfileClick: () => void;
}) {
  const { totalCount, openCart } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 nav-blur bg-background/60 border-b border-border/40">
      <nav className="flex items-center justify-between px-6 md:px-12 h-14">
        <span className="font-display text-xl tracking-tightest text-foreground select-none">
          JADE
        </span>
        <div className="flex items-center gap-6">
          <button
            type="button"
            data-ocid="nav.shop_link"
            onClick={onShopClick}
            className="font-body text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Shop
          </button>
          <button
            type="button"
            data-ocid="nav.about_link"
            onClick={onAboutClick}
            className="font-body text-sm tracking-widests uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hidden md:block"
          >
            About
          </button>
          <button
            type="button"
            data-ocid="nav.track_order_link"
            onClick={() => {
              window.location.hash = "#track";
            }}
            className="font-body text-sm tracking-widests uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Track
          </button>

          {/* Profile button */}
          <button
            type="button"
            data-ocid="nav.profile_button"
            onClick={onProfileClick}
            className="relative flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring p-1"
            aria-label="Profile"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Cart button */}
          <button
            type="button"
            data-ocid="nav.cart_button"
            onClick={openCart}
            className="relative flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring p-1"
            aria-label={`Cart${totalCount > 0 ? `, ${totalCount} items` : ""}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <AnimatePresence>
              {totalCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background font-body text-[9px] font-bold flex items-center justify-center leading-none rounded-none"
                >
                  {totalCount > 9 ? "9+" : totalCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
const heroContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

function Hero({
  onShopClick,
  settings,
}: {
  onShopClick: () => void;
  settings: HeroSettings;
}) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background texture lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 80px, oklch(0.22 0 0) 80px, oklch(0.22 0 0) 81px)",
          opacity: 0.25,
        }}
      />

      {/* Diagonal slash — signature design element */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[1px] bg-border/50 origin-top-right"
        style={{ transform: "rotate(0deg)" }}
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6"
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Season label */}
        <motion.p
          variants={heroItemVariants}
          className="font-body text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-8"
        >
          {settings.seasonLabel}
        </motion.p>

        {/* Giant wordmark */}
        <motion.h1
          variants={heroItemVariants}
          className="font-display text-[18vw] md:text-[16vw] lg:text-[14vw] leading-none tracking-tightest text-foreground"
          style={{ fontVariationSettings: '"wght" 900' }}
        >
          JADE
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={heroItemVariants}
          className="font-body text-base md:text-xl text-muted-foreground mt-4 mb-12 tracking-widest uppercase"
        >
          {settings.tagline}
        </motion.p>

        {/* CTA */}
        <motion.button
          variants={heroItemVariants}
          data-ocid="hero.primary_button"
          onClick={onShopClick}
          className="group relative font-display text-sm tracking-[0.2em] uppercase px-10 py-4 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{ fontVariationSettings: '"wght" 700' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {settings.ctaText}
        </motion.button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        aria-hidden="true"
      >
        <div className="w-[1px] h-12 bg-foreground/60" />
        <span className="font-body text-[9px] tracking-[0.4em] uppercase text-muted-foreground">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}

// ─── PRODUCT DETAIL MODAL ────────────────────────────────────────────────────
interface ProductDetailProps {
  product: Product & { priceCents: number };
  images: string[];
  open: boolean;
  onClose: () => void;
}

function ProductDetailModal({
  product,
  images,
  open,
  onClose,
}: ProductDetailProps) {
  const { addToCart } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Read admin product metadata (description, availableSizes) from localStorage
  const adminProducts = useMemo(
    () =>
      readLocalStorage<
        Array<{ id: number; availableSizes?: string[]; description?: string }>
      >("jade_products", []),
    [],
  );
  const adminMeta = useMemo(
    () => adminProducts.find((p) => p.id === Number(product.id)),
    [adminProducts, product.id],
  );
  const availableSizes = adminMeta?.availableSizes ?? ["S", "M", "L", "XL"];
  const description = adminMeta?.description ?? "";

  // Reset selected size when product changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on product id change
  useEffect(() => {
    setSelectedSize(null);
    setSizeGuideOpen(false);
  }, [product.id]);

  const displayImages =
    images.length > 0
      ? images
      : ["/assets/generated/simp-hoodie.dim_600x750.jpg"];

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((i) => (i - 1 + displayImages.length) % displayImages.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((i) => (i + 1) % displayImages.length);
  };

  const handleAddToCart = () => {
    const cartProduct: CartProduct = {
      id: Number(product.id),
      name: product.name,
      priceCents: Number(product.priceCents),
      image: displayImages[0],
      category: product.category,
      size: selectedSize ?? undefined,
    };
    addToCart(cartProduct);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/85 backdrop-blur-sm"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            role="button"
            tabIndex={-1}
            aria-label="Close product detail"
          />

          {/* Modal */}
          <motion.div
            data-ocid="product_detail.modal"
            className="relative z-10 bg-background border border-border/60 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close button */}
            <button
              type="button"
              data-ocid="product_detail.close_button"
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors bg-background/60 backdrop-blur-sm"
              aria-label="Close product detail"
            >
              <XIcon className="w-4 h-4" />
            </button>

            {/* Image gallery */}
            <div className="relative w-full md:w-[55%] aspect-[4/5] md:aspect-auto bg-card shrink-0 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={imgIdx}
                  src={displayImages[imgIdx]}
                  alt={`${product.name} — view ${imgIdx + 1}`}
                  className="w-full h-full object-cover absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>

              {/* Prev / Next arrows (only if multiple images) */}
              {displayImages.length > 1 && (
                <>
                  <button
                    type="button"
                    data-ocid="product_detail.prev_button"
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/90 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    data-ocid="product_detail.next_button"
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/90 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {displayImages.map((_, i) => (
                      <button
                        // biome-ignore lint/suspicious/noArrayIndexKey: positional dots
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImgIdx(i);
                        }}
                        className={`w-1.5 h-1.5 transition-all duration-200 ${i === imgIdx ? "bg-foreground scale-125" : "bg-foreground/40"}`}
                        aria-label={`View image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-col justify-between p-6 md:p-8 flex-1 overflow-y-auto">
              <div>
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  {product.category}
                </p>
                <h2
                  className="font-display text-3xl md:text-4xl tracking-tightest text-foreground leading-none mb-4"
                  style={{ fontVariationSettings: '"wght" 900' }}
                >
                  {product.name}
                </h2>
                <p
                  className="font-display text-2xl text-foreground mb-6"
                  style={{ fontVariationSettings: '"wght" 700' }}
                >
                  {formatPrice(product.priceCents)}
                </p>

                {/* Description */}
                {description && (
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                    {description}
                  </p>
                )}

                {/* Size selector */}
                {availableSizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                        Size
                      </p>
                      <button
                        type="button"
                        data-ocid="product_detail.size_guide_button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 hover:text-foreground transition-colors underline underline-offset-2"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["S", "M", "L", "XL"]
                        .filter((s) => availableSizes.includes(s))
                        .map((size) => (
                          <button
                            key={size}
                            type="button"
                            data-ocid={`product_detail.size_button_${size.toLowerCase()}`}
                            onClick={() => setSelectedSize(size)}
                            className={`w-12 h-10 border font-body text-xs tracking-widest uppercase transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground ${
                              selectedSize === size
                                ? "border-foreground bg-foreground text-background"
                                : "border-border/60 text-muted-foreground hover:border-foreground/60 hover:text-foreground"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Thumbnail strip (if multiple images) */}
                {displayImages.length > 1 && (
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {displayImages.map((src, i) => (
                      <button
                        // biome-ignore lint/suspicious/noArrayIndexKey: positional thumbs
                        key={i}
                        type="button"
                        data-ocid={`product_detail.thumb.${i + 1}`}
                        onClick={() => setImgIdx(i)}
                        className={`w-14 h-14 overflow-hidden border-2 transition-all duration-150 ${i === imgIdx ? "border-foreground" : "border-border/40 opacity-60 hover:opacity-100"}`}
                      >
                        <img
                          src={src}
                          alt={`Thumbnail ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                type="button"
                data-ocid="product_detail.add_to_cart_button"
                onClick={
                  availableSizes.length === 0 || selectedSize
                    ? handleAddToCart
                    : undefined
                }
                disabled={availableSizes.length > 0 && !selectedSize}
                className={`w-full py-4 font-display text-sm tracking-[0.2em] uppercase transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  availableSizes.length > 0 && !selectedSize
                    ? "bg-foreground/30 text-background/60 cursor-not-allowed"
                    : "bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                }`}
                style={{ fontVariationSettings: '"wght" 700' }}
                whileHover={
                  availableSizes.length === 0 || selectedSize
                    ? { scale: 1.01 }
                    : {}
                }
                whileTap={
                  availableSizes.length === 0 || selectedSize
                    ? { scale: 0.98 }
                    : {}
                }
              >
                {availableSizes.length > 0 && !selectedSize
                  ? "Select a Size"
                  : "Add to Cart"}
              </motion.button>
            </div>

            {/* Size guide overlay */}
            <AnimatePresence>
              {sizeGuideOpen && (
                <motion.div
                  data-ocid="product_detail.size_guide_modal"
                  className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm flex flex-col p-6 overflow-y-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3
                      className="font-display text-xl tracking-tightest text-foreground"
                      style={{ fontVariationSettings: '"wght" 900' }}
                    >
                      Size Guide
                    </h3>
                    <button
                      type="button"
                      data-ocid="product_detail.size_guide_close_button"
                      onClick={() => setSizeGuideOpen(false)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close size guide"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-body text-xs text-muted-foreground/60 mb-4 tracking-wide">
                    All measurements in cm (inches in brackets)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/40">
                          {["Size", "Chest", "Waist", "Hip", "Length"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left pb-3 font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground pr-6"
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            size: "S",
                            chest: "86–91 (34–36)",
                            waist: "71–76 (28–30)",
                            hip: "86–91 (34–36)",
                            length: "68 (27)",
                          },
                          {
                            size: "M",
                            chest: "91–97 (36–38)",
                            waist: "76–81 (30–32)",
                            hip: "91–97 (36–38)",
                            length: "70 (27.5)",
                          },
                          {
                            size: "L",
                            chest: "97–102 (38–40)",
                            waist: "81–86 (32–34)",
                            hip: "97–102 (38–40)",
                            length: "72 (28.5)",
                          },
                          {
                            size: "XL",
                            chest: "107–112 (42–44)",
                            waist: "91–97 (36–38)",
                            hip: "107–112 (42–44)",
                            length: "74 (29)",
                          },
                        ].map((row) => (
                          <tr
                            key={row.size}
                            className="border-b border-border/20"
                          >
                            <td
                              className="py-3 pr-6 font-display text-sm text-foreground"
                              style={{ fontVariationSettings: '"wght" 700' }}
                            >
                              {row.size}
                            </td>
                            <td className="py-3 pr-6 font-body text-xs text-muted-foreground">
                              {row.chest}
                            </td>
                            <td className="py-3 pr-6 font-body text-xs text-muted-foreground">
                              {row.waist}
                            </td>
                            <td className="py-3 pr-6 font-body text-xs text-muted-foreground">
                              {row.hip}
                            </td>
                            <td className="py-3 font-body text-xs text-muted-foreground">
                              {row.length}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="font-body text-[10px] text-muted-foreground/40 mt-6">
                    If you're between sizes, we recommend sizing up for a
                    relaxed fit.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  index,
  image,
  images,
  onOpenDetail,
}: {
  product: Product | (typeof FALLBACK_PRODUCTS)[0];
  index: number;
  image: string;
  images: string[];
  onOpenDetail?: (
    product: Product & { priceCents: number },
    images: string[],
  ) => void;
}) {
  const ocid = `products.item.${index + 1}`;
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const p = product as Product & { priceCents: number; image?: string };
    const cartProduct: CartProduct = {
      id: Number(p.id),
      name: p.name,
      priceCents: Number(p.priceCents),
      image,
      category: p.category,
    };
    addToCart(cartProduct);
  };

  const handleCardClick = () => {
    onOpenDetail?.(product as Product & { priceCents: number }, images);
  };

  return (
    <motion.article
      data-ocid={ocid}
      className="product-card group cursor-pointer"
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Image block */}
      <div className="relative overflow-hidden bg-card aspect-[4/5] mb-4">
        <img
          src={image}
          alt={(product as Product).name}
          className="product-card-img w-full h-full object-cover"
          loading="lazy"
        />

        {/* Hover overlay — category label + Add to Cart */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            {(product as Product).category}
          </span>

          <motion.button
            type="button"
            data-ocid={`products.add_to_cart_button.${index + 1}`}
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-foreground text-background font-display text-xs tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
            style={{ fontVariationSettings: '"wght" 700' }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-baseline justify-between">
        <h3
          className="font-display text-base tracking-tight text-foreground"
          style={{ fontVariationSettings: '"wght" 700' }}
        >
          {(product as Product).name}
        </h3>
        <span className="font-body text-sm text-muted-foreground ml-3 shrink-0">
          {formatPrice((product as Product).priceCents)}
        </span>
      </div>

      <div className="mt-1 h-[1px] w-0 bg-foreground group-hover:w-full transition-all duration-500 ease-out" />
    </motion.article>
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div
        className="aspect-[4/5] mb-4"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.12 0 0) 25%, oklch(0.18 0 0) 50%, oklch(0.12 0 0) 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2s linear infinite",
        }}
      />
      <div className="h-4 w-2/3 bg-muted rounded-none mb-2" />
      <div className="h-3 w-1/3 bg-muted/60 rounded-none" />
    </div>
  );
}

// ─── PRODUCTS SECTION ────────────────────────────────────────────────────────
function ProductsSection({
  categoryFilter,
}: {
  categoryFilter?: string | null;
}) {
  const { data: products, isLoading } = useGetAllProducts();
  const [detailProduct, setDetailProduct] = useState<
    (Product & { priceCents: number }) | null
  >(null);
  const [detailImages, setDetailImages] = useState<string[]>([]);

  // Prefer admin-managed products from localStorage (they include images array)
  const adminProducts = useMemo(
    () =>
      readLocalStorage<
        Array<{
          id: number;
          name: string;
          category: string;
          priceCents: number;
          images?: string[];
          imageUrl?: string; // legacy
        }>
      >("jade_products", []),
    [],
  );

  // Migrate legacy imageUrl → images
  const migratedAdminProducts = useMemo(
    () =>
      adminProducts.map((p) => ({
        ...p,
        images: p.images ?? (p.imageUrl ? [p.imageUrl] : []),
      })),
    [adminProducts],
  );

  const allDisplayProducts = useMemo(
    () =>
      migratedAdminProducts.length > 0
        ? migratedAdminProducts
        : products && products.length > 0
          ? products
          : FALLBACK_PRODUCTS,
    [migratedAdminProducts, products],
  );

  // Apply category filter
  const displayProducts = useMemo(() => {
    if (!categoryFilter) return allDisplayProducts;

    return allDisplayProducts.filter((p) => {
      const cat = p.category ?? "";
      // Exact match (e.g. "Men's > Tops")
      if (cat === categoryFilter) return true;
      // Gender-only filter (e.g. "Men's") — match any product whose category starts with "Men's"
      if (!categoryFilter.includes(" > ")) {
        return (
          cat === categoryFilter ||
          cat.startsWith(`${categoryFilter} > `) ||
          cat.startsWith(`${categoryFilter}>`)
        );
      }
      // Prefix match for hierarchical categories
      return cat.startsWith(categoryFilter);
    });
  }, [allDisplayProducts, categoryFilter]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: allDisplayProducts used only for type inference, not at runtime
  const getImages = useMemo(
    () =>
      (product: (typeof allDisplayProducts)[0], index: number): string[] => {
        // Admin product with images array
        if (
          "images" in product &&
          Array.isArray((product as { images?: string[] }).images)
        ) {
          const imgs = (product as { images: string[] }).images.filter(Boolean);
          if (imgs.length > 0) return imgs;
        }
        // Fallback product with image field
        if ("image" in product) {
          return [(product as (typeof FALLBACK_PRODUCTS)[0]).image];
        }
        // Default positional fallback
        const fallback =
          PRODUCT_IMAGES[index % Object.keys(PRODUCT_IMAGES).length] ??
          PRODUCT_IMAGES[0];
        return [fallback];
      },
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: allDisplayProducts used only for type inference, not at runtime
  const getImage = useMemo(
    () =>
      (product: (typeof allDisplayProducts)[0], index: number): string =>
        getImages(product, index)[0] ?? "",
    [getImages],
  );

  // Derive display label for active filter
  const filterLabel = categoryFilter
    ? categoryFilter.includes(" > ")
      ? categoryFilter.split(" > ")[1]
      : categoryFilter
    : null;

  return (
    <section
      id="products"
      data-ocid="products.section"
      className="px-6 md:px-12 py-24 md:py-32 pt-10 md:pt-12"
    >
      {/* Section header */}
      <div className="flex items-end justify-between mb-16 border-b border-border pb-6">
        <motion.div
          className="flex items-baseline gap-4"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className="font-display text-5xl md:text-7xl tracking-tightest text-foreground"
            style={{ fontVariationSettings: '"wght" 900' }}
          >
            Shop
          </h2>
          <AnimatePresence mode="wait">
            {filterLabel && (
              <motion.span
                key={filterLabel}
                className="font-body text-sm tracking-[0.25em] uppercase text-muted-foreground/70"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
              >
                / {filterLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.p
          className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {isLoading ? "Loading..." : `${displayProducts.length} pieces`}
        </motion.p>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            data-ocid="products.loading_state"
            className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are position-based
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products grid */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {displayProducts.map((product, index) => (
              <ProductCard
                key={Number(product.id)}
                product={product as unknown as Product}
                index={index}
                image={getImage(product, index)}
                images={getImages(product, index)}
                onOpenDetail={(p, imgs) => {
                  setDetailProduct(p);
                  setDetailImages(imgs);
                }}
              />
            ))}
          </div>

          {/* Product detail modal */}
          {detailProduct && (
            <ProductDetailModal
              product={detailProduct}
              images={detailImages}
              open={!!detailProduct}
              onClose={() => setDetailProduct(null)}
            />
          )}
        </>
      )}
    </section>
  );
}

// ─── ABOUT SECTION ────────────────────────────────────────────────────────────
function AboutSection({ settings }: { settings: AboutSettings }) {
  // Split heading on newlines and render last segment as muted
  const headingLines = settings.heading.split("\n");
  const lastLine = headingLines[headingLines.length - 1];
  const prevLines = headingLines.slice(0, -1);

  return (
    <section
      id="about"
      data-ocid="about.section"
      className="px-6 md:px-12 py-24 md:py-32 border-t border-border"
    >
      <div className="max-w-4xl">
        <motion.p
          className="font-body text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          About
        </motion.p>

        <motion.h2
          className="font-display text-4xl md:text-6xl lg:text-7xl tracking-tightest text-foreground leading-none mb-12"
          style={{ fontVariationSettings: '"wght" 900' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {prevLines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: heading lines are positional
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
          <span className="text-muted-foreground">{lastLine}</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 mt-16 border-t border-border pt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h3
              className="font-display text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4"
              style={{ fontVariationSettings: '"wght" 700' }}
            >
              The Ethos
            </h3>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              {settings.ethosParagraph}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3
              className="font-display text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4"
              style={{ fontVariationSettings: '"wght" 700' }}
            >
              The Work
            </h3>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              {settings.workParagraph}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({
  onShopClick,
  onAboutClick,
}: {
  onShopClick: () => void;
  onAboutClick: () => void;
}) {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer
      data-ocid="footer.section"
      className="border-t border-border px-6 md:px-12 py-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Brand */}
        <span
          className="font-display text-2xl tracking-tightest text-foreground"
          style={{ fontVariationSettings: '"wght" 900' }}
        >
          JADE
        </span>

        {/* Nav */}
        <nav className="flex items-center gap-8 flex-wrap">
          <button
            type="button"
            onClick={onShopClick}
            className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Shop
          </button>
          <button
            type="button"
            onClick={onAboutClick}
            className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </button>
          <a
            href="/#track"
            data-ocid="footer.track_order_link"
            className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Track Order
          </a>
        </nav>

        {/* Copyright */}
        <div className="flex flex-col gap-1">
          <p className="font-body text-xs text-muted-foreground/60 tracking-wide">
            © {year} JADE
          </p>
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[10px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors tracking-wide"
          >
            Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── INNER APP (inside CartProvider) ─────────────────────────────────────────
function AppInner() {
  const { items, subtotalCents, clearCart, closeCart } = useCart();
  const [profileOpen, setProfileOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const heroSettings = useMemo(
    () => readLocalStorage<HeroSettings>("jade_hero", DEFAULT_HERO_SETTINGS),
    [],
  );
  const aboutSettings = useMemo(
    () => readLocalStorage<AboutSettings>("jade_about", DEFAULT_ABOUT_SETTINGS),
    [],
  );

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCheckout = () => {
    closeCart();
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setPaymentOpen(false);
  };

  return (
    <div className="grain min-h-screen bg-background">
      <Nav
        onShopClick={scrollToProducts}
        onAboutClick={scrollToAbout}
        onProfileClick={() => setProfileOpen(true)}
      />

      <main>
        <Hero onShopClick={scrollToProducts} settings={heroSettings} />
        <CategoriesSection
          onFilterChange={setCategoryFilter}
          activeFilter={categoryFilter}
        />
        <ProductsSection categoryFilter={categoryFilter} />
        <AboutSection settings={aboutSettings} />
        <ReviewsSection />
      </main>

      <Footer onShopClick={scrollToProducts} onAboutClick={scrollToAbout} />

      {/* Cart drawer */}
      <CartDrawer onCheckout={handleCheckout} />

      {/* Profile panel */}
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Payment modal */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        cartItems={items}
        subtotalCents={subtotalCents}
        onSuccess={handlePaymentSuccess}
      />

      {/* FAQ Chat widget */}
      <ChatWidget />
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
type AppRoute = "admin" | "track" | "main";

function detectRoute(): AppRoute {
  const hash = window.location.hash;
  if (hash === "#admin" || window.location.pathname === "/admin")
    return "admin";
  if (hash === "#track") return "track";
  return "main";
}

function useAppRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(detectRoute);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(detectRoute());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return route;
}

export default function App() {
  const route = useAppRoute();

  if (route === "admin") {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AdminPage />
        <Toaster />
      </Suspense>
    );
  }

  if (route === "track") {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <TrackOrderPage />
        <Toaster />
      </Suspense>
    );
  }

  return (
    <CartProvider>
      <AppInner />
      <Toaster />
    </CartProvider>
  );
}
