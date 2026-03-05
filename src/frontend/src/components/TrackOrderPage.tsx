import type { AdminOrder } from "@/components/AdminPage";
import { ArrowLeft, Package, Search, Truck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function formatPrice(cents: number): string {
  return `₹${(cents / 100).toFixed(0)}`;
}

function readOrders(): AdminOrder[] {
  try {
    const raw = localStorage.getItem("jade_orders");
    if (!raw) return [];
    return JSON.parse(raw) as AdminOrder[];
  } catch {
    return [];
  }
}

const STATUS_STEPS = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

// Map the order status field to the step index (0-based)
function getStepIndex(status: string): number {
  switch (status) {
    case "Pending":
      return 0;
    case "Processing":
      return 1;
    case "Shipped":
      return 2;
    case "Out for Delivery":
      return 3;
    case "Delivered":
      return 4;
    default:
      return 0;
  }
}

function StatusTimeline({ status }: { status: string }) {
  if (status === "Cancelled") {
    return (
      <div
        data-ocid="track_order.cancelled_state"
        className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 px-4 py-3"
      >
        <span className="font-body text-sm text-destructive tracking-wide">
          Order Cancelled
        </span>
      </div>
    );
  }

  const currentStep = getStepIndex(status);

  return (
    <div className="relative">
      {STATUS_STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const upcoming = i > currentStep;

        return (
          <div key={step} className="flex items-start gap-4 mb-0">
            {/* Line + circle column */}
            <div className="flex flex-col items-center w-8 shrink-0">
              {/* Top connector */}
              {i > 0 && (
                <div
                  className={`w-[1px] h-5 ${done || active ? "bg-foreground" : "bg-border/40"}`}
                />
              )}
              {/* Circle */}
              <div
                className={`w-5 h-5 flex items-center justify-center shrink-0 transition-all duration-300 ${
                  done
                    ? "bg-foreground text-background"
                    : active
                      ? "bg-foreground text-background ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
                      : "border border-border/40 text-muted-foreground/30"
                }`}
              >
                {done ? (
                  <span className="text-[8px] font-bold">✓</span>
                ) : (
                  <span className="text-[8px] font-bold">{i + 1}</span>
                )}
              </div>
              {/* Bottom connector */}
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className={`w-[1px] h-5 ${done ? "bg-foreground" : "bg-border/40"}`}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-0.5 pb-4">
              <p
                className={`font-body text-sm tracking-wide transition-colors ${
                  active
                    ? "text-foreground"
                    : done
                      ? "text-muted-foreground"
                      : upcoming
                        ? "text-muted-foreground/40"
                        : "text-muted-foreground"
                }`}
                style={active ? { fontWeight: 600 } : {}}
              >
                {step}
              </p>
              {active && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-body text-[10px] text-muted-foreground/60 mt-0.5 tracking-wide"
                >
                  Current status
                </motion.p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface OrderResultProps {
  order: AdminOrder;
}

function OrderResult({ order }: OrderResultProps) {
  let parsedItems: Array<{ name: string; qty: number; price: number }> = [];
  try {
    parsedItems = JSON.parse(order.items) as typeof parsedItems;
  } catch {
    parsedItems = [];
  }

  return (
    <motion.div
      data-ocid="track_order.result_panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Order meta */}
      <div className="bg-card border border-border/40 px-5 py-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 mb-1">
              Order Number
            </p>
            <p
              className="font-display text-xl tracking-tightest text-foreground"
              style={{ fontVariationSettings: '"wght" 900' }}
            >
              #{order.orderNo}
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 mb-1">
              Date
            </p>
            <p className="font-body text-sm text-muted-foreground">
              {order.createdAt}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
          <div>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 mb-0.5">
              Delivering to
            </p>
            <p className="font-body text-xs text-muted-foreground">
              {order.city}, {order.state}
            </p>
          </div>
          <div>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 mb-0.5">
              Payment
            </p>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest">
              {order.paymentMethod}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      {parsedItems.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Items Ordered
          </p>
          <div className="space-y-1.5">
            {parsedItems.map((item, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: positional items
                key={i}
                className="flex justify-between font-body text-sm text-muted-foreground"
              >
                <span>
                  {item.name}
                  {item.qty > 1 && (
                    <span className="text-muted-foreground/50 ml-1">
                      ×{item.qty}
                    </span>
                  )}
                </span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2 border-t border-border/30">
            <span className="font-body text-xs tracking-widest uppercase text-muted-foreground/60">
              Total
            </span>
            <span
              className="font-display text-base text-foreground"
              style={{ fontVariationSettings: '"wght" 700' }}
            >
              {formatPrice(order.totalCents)}
            </span>
          </div>
        </div>
      )}

      {/* Status timeline */}
      <div className="space-y-3">
        <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Delivery Status
        </p>
        <StatusTimeline status={order.status} />
      </div>
    </motion.div>
  );
}

export function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<AdminOrder | null>(null);

  const handleTrack = () => {
    const normalized = query.trim().replace(/^#/, "").toUpperCase();
    if (!normalized) return;

    const orders = readOrders();
    const match = orders.find((o) => o.orderNo.toUpperCase() === normalized);
    setFoundOrder(match ?? null);
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleTrack();
  };

  return (
    <div className="min-h-screen bg-background grain">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 nav-blur bg-background/60 border-b border-border/40">
        <nav className="flex items-center justify-between px-6 md:px-12 h-14">
          <a
            href="/#"
            data-ocid="track_order.home_link"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-xs tracking-widest uppercase">
              Back
            </span>
          </a>
          <span
            className="font-display text-xl tracking-tightest text-foreground select-none"
            style={{ fontVariationSettings: '"wght" 900' }}
          >
            JADE
          </span>
          <div className="w-16" />
        </nav>
      </header>

      <main className="pt-14 px-6 md:px-12 pb-24">
        <div className="max-w-lg mx-auto pt-16">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-4">
              Order Tracking
            </p>
            <h1
              className="font-display text-5xl md:text-6xl tracking-tightest text-foreground leading-none mb-4"
              style={{ fontVariationSettings: '"wght" 900' }}
            >
              Track Your
              <br />
              <span className="text-muted-foreground">Order</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground/70 tracking-wide">
              Enter your order number to see real-time delivery status.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="flex gap-0">
              <div className="relative flex-1">
                <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                <input
                  type="text"
                  data-ocid="track_order.input"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (searched) setSearched(false);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="JD-1234 or #JD-1234"
                  className="w-full bg-card border border-border/50 border-r-0 pl-10 pr-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors duration-200"
                  autoComplete="off"
                />
              </div>
              <motion.button
                type="button"
                data-ocid="track_order.submit_button"
                onClick={handleTrack}
                className="shrink-0 px-6 py-3.5 bg-foreground text-background font-display text-xs tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background flex items-center gap-2"
                style={{ fontVariationSettings: '"wght" 700' }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Search className="w-3.5 h-3.5" />
                Track
              </motion.button>
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {searched && foundOrder && (
              <OrderResult key="result" order={foundOrder} />
            )}

            {searched && !foundOrder && (
              <motion.div
                key="not-found"
                data-ocid="track_order.empty_state"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-16 border border-border/30 bg-card/30 text-center"
              >
                <Package className="w-10 h-10 text-muted-foreground/30 mb-4" />
                <p
                  className="font-display text-base tracking-tightest text-muted-foreground/60 mb-2"
                  style={{ fontVariationSettings: '"wght" 700' }}
                >
                  Order not found
                </p>
                <p className="font-body text-xs text-muted-foreground/40 max-w-xs">
                  Double-check your order number. It should look like{" "}
                  <span className="text-muted-foreground/60">JD-1234</span>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
