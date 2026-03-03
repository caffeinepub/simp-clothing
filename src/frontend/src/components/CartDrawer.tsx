import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

function formatPrice(cents: number): string {
  return `₹${(cents / 100).toFixed(0)}`;
}

export function CartDrawer({ onCheckout }: { onCheckout?: () => void }) {
  const { items, isOpen, closeCart, removeFromCart, updateQty, subtotalCents } =
    useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        data-ocid="cart.sheet"
        className="flex flex-col w-full sm:max-w-[420px] bg-background border-l border-border/60 p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <SheetTitle className="font-display text-lg tracking-tightest text-foreground flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span style={{ fontVariationSettings: '"wght" 900' }}>Cart</span>
            {items.length > 0 && (
              <span className="font-body text-xs text-muted-foreground ml-auto mr-6">
                {items.reduce((s, i) => s + i.quantity, 0)} item
                {items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
              </span>
            )}
            <SheetClose
              data-ocid="cart.close_button"
              className="ml-auto text-muted-foreground/60 hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring p-0.5"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </SheetClose>
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        {items.length === 0 ? (
          <div
            data-ocid="cart.empty_state"
            className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center"
          >
            <div className="w-12 h-12 border border-border/40 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <p className="font-body text-sm text-muted-foreground tracking-wide">
              Your cart is empty.
            </p>
            <p className="font-body text-xs text-muted-foreground/50 tracking-wide">
              Add pieces to get started.
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6">
            <ul className="py-4 space-y-0">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.li
                    key={item.product.id}
                    data-ocid={`cart.item.${index + 1}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="py-4 border-b border-border/30 last:border-b-0"
                  >
                    <div className="flex gap-4">
                      {/* Product image */}
                      <div className="w-16 h-20 bg-card shrink-0 overflow-hidden">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info + controls */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className="font-display text-sm tracking-tight text-foreground truncate"
                              style={{ fontVariationSettings: '"wght" 700' }}
                            >
                              {item.product.name}
                            </p>
                            <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mt-0.5">
                              {item.product.category}
                            </p>
                          </div>
                          <button
                            type="button"
                            data-ocid={`cart.delete_button.${index + 1}`}
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-muted-foreground/40 hover:text-destructive transition-colors duration-200 p-0.5 shrink-0"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Qty controls */}
                          <div className="flex items-center gap-0 border border-border/50">
                            <button
                              type="button"
                              data-ocid={`cart.qty_decrease.${index + 1}`}
                              onClick={() =>
                                updateQty(item.product.id, item.quantity - 1)
                              }
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors duration-150"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-body text-sm text-foreground w-7 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              data-ocid={`cart.qty_increase.${index + 1}`}
                              onClick={() =>
                                updateQty(item.product.id, item.quantity + 1)
                              }
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors duration-150"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-body text-sm text-foreground">
                            {formatPrice(
                              item.product.priceCents * item.quantity,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </ScrollArea>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/40 px-6 py-5 space-y-4">
            {/* Subtotal */}
            <div
              data-ocid="cart.subtotal"
              className="flex items-baseline justify-between"
            >
              <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                Subtotal
              </span>
              <span
                className="font-display text-xl tracking-tightest text-foreground"
                style={{ fontVariationSettings: '"wght" 700' }}
              >
                {formatPrice(subtotalCents)}
              </span>
            </div>

            <p className="font-body text-[10px] text-muted-foreground/50 tracking-wide">
              Shipping and taxes calculated at checkout.
            </p>

            {/* Checkout CTA */}
            <motion.button
              type="button"
              data-ocid="cart.checkout_button"
              onClick={onCheckout}
              className="w-full py-3.5 bg-foreground text-background font-display text-sm tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ fontVariationSettings: '"wght" 700' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Checkout
            </motion.button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
