import { ShoppingBag, User } from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useState } from "react";

import type { Product } from "./backend.d";
import { CartDrawer } from "./components/CartDrawer";
import { ChatWidget } from "./components/ChatWidget";
import { PaymentModal } from "./components/PaymentModal";
import { ProfilePanel } from "./components/ProfilePanel";
import { ReviewsSection } from "./components/ReviewsSection";
import { type CartProduct, CartProvider, useCart } from "./context/CartContext";
import { useGetAllProducts } from "./hooks/useQueries";

// ─── Fallback product data shown if backend returns empty ────────────────────
const FALLBACK_PRODUCTS: Array<
  Omit<Product, "id" | "priceCents"> & {
    id: number;
    priceCents: number;
    image: string;
  }
> = [
  {
    id: 1,
    name: "Void Hoodie",
    category: "Tops",
    priceCents: 11900,
    image: "/assets/generated/simp-hoodie.dim_600x750.jpg",
  },
  {
    id: 2,
    name: "Utility Cargo",
    category: "Bottoms",
    priceCents: 14500,
    image: "/assets/generated/simp-cargo.dim_600x750.jpg",
  },
  {
    id: 3,
    name: "Oversized Tee",
    category: "Tops",
    priceCents: 6500,
    image: "/assets/generated/simp-tee.dim_600x750.jpg",
  },
  {
    id: 4,
    name: "Blank Bomber",
    category: "Outerwear",
    priceCents: 21900,
    image: "/assets/generated/simp-bomber.dim_600x750.jpg",
  },
  {
    id: 5,
    name: "Track Pant",
    category: "Bottoms",
    priceCents: 9800,
    image: "/assets/generated/simp-trackpants.dim_600x750.jpg",
  },
  {
    id: 6,
    name: "Logo Cap",
    category: "Accessories",
    priceCents: 4500,
    image: "/assets/generated/simp-cap.dim_600x750.jpg",
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
            className="font-body text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            About
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
function Hero({ onShopClick }: { onShopClick: () => void }) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: "easeOut" },
    },
  };

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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Season label */}
        <motion.p
          variants={itemVariants}
          className="font-body text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-8"
        >
          Collection 001 — 2026
        </motion.p>

        {/* Giant wordmark */}
        <motion.h1
          variants={itemVariants}
          className="font-display text-[18vw] md:text-[16vw] lg:text-[14vw] leading-none tracking-tightest text-foreground"
          style={{ fontVariationSettings: '"wght" 900' }}
        >
          JADE
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="font-body text-base md:text-xl text-muted-foreground mt-4 mb-12 tracking-widest uppercase"
        >
          Wear Less.&nbsp;&nbsp;Mean More.
        </motion.p>

        {/* CTA */}
        <motion.button
          variants={itemVariants}
          data-ocid="hero.primary_button"
          onClick={onShopClick}
          className="group relative font-display text-sm tracking-[0.2em] uppercase px-10 py-4 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{ fontVariationSettings: '"wght" 700' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Shop Now
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

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  index,
  image,
}: {
  product: Product | (typeof FALLBACK_PRODUCTS)[0];
  index: number;
  image: string;
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

  return (
    <motion.article
      data-ocid={ocid}
      className="product-card group cursor-pointer"
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
function ProductsSection() {
  const { data: products, isLoading } = useGetAllProducts();

  const displayProducts =
    products && products.length > 0 ? products : FALLBACK_PRODUCTS;

  const getImage = (index: number): string => {
    return (
      PRODUCT_IMAGES[index % Object.keys(PRODUCT_IMAGES).length] ??
      PRODUCT_IMAGES[0]
    );
  };

  return (
    <section
      id="products"
      data-ocid="products.section"
      className="px-6 md:px-12 py-24 md:py-32"
    >
      {/* Section header */}
      <div className="flex items-end justify-between mb-16 border-b border-border pb-6">
        <motion.h2
          className="font-display text-5xl md:text-7xl tracking-tightest text-foreground"
          style={{ fontVariationSettings: '"wght" 900' }}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Shop
        </motion.h2>
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {displayProducts.map((product, index) => (
            <ProductCard
              key={Number(product.id)}
              product={product as unknown as Product}
              index={index}
              image={
                "image" in product
                  ? (product as (typeof FALLBACK_PRODUCTS)[0]).image
                  : getImage(index)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── ABOUT SECTION ────────────────────────────────────────────────────────────
function AboutSection() {
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
          Built for those
          <br />
          who need nothing
          <br />
          <span className="text-muted-foreground">to prove everything.</span>
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
              JADE was born from the quiet. Not the silence of giving up — but
              the silence of not needing to explain yourself. Every piece we
              make strips away the noise: no logos demanding attention, no
              trends chasing relevance. Just form, weight, and intention.
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
              Heavyweight fabrics. Constructed seams. Proportions that move with
              the body, not against it. We work with a small network of
              factories that share our obsession with material integrity. Less,
              always — but never cheap.
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
        <nav className="flex items-center gap-8">
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
        <Hero onShopClick={scrollToProducts} />
        <ProductsSection />
        <AboutSection />
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
export default function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  );
}
