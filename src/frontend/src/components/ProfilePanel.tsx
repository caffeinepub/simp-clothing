import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion } from "motion/react";
import { useState } from "react";

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

const FAKE_ORDERS = [
  {
    orderNo: "#JD-1042",
    date: "Jan 28, 2026",
    status: "Delivered",
    item: "Void Hoodie",
  },
  {
    orderNo: "#JD-0891",
    date: "Dec 14, 2025",
    status: "Delivered",
    item: "Utility Cargo",
  },
  {
    orderNo: "#JD-0754",
    date: "Nov 03, 2025",
    status: "Delivered",
    item: "Oversized Tee + Logo Cap",
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex.rivera@example.com");
  const [address, setAddress] = useState(
    "42 Archer Lane, Apt 5C\nNew York, NY 10001",
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = getInitials(name);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        data-ocid="profile.sheet"
        className="flex flex-col w-full sm:max-w-[420px] bg-background border-l border-border/60 p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-5 border-b border-border/40">
          <SheetTitle className="font-display text-lg tracking-tightest text-foreground">
            <span style={{ fontVariationSettings: '"wght" 900' }}>Profile</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-8">
            {/* Avatar + Name */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-14 h-14 bg-foreground text-background flex items-center justify-center shrink-0">
                <span
                  className="font-display text-lg tracking-tight"
                  style={{ fontVariationSettings: '"wght" 900' }}
                >
                  {initials}
                </span>
              </div>
              <div>
                <p
                  className="font-display text-base tracking-tight text-foreground"
                  style={{ fontVariationSettings: '"wght" 700' }}
                >
                  {name || "Your Name"}
                </p>
                <p className="font-body text-xs text-muted-foreground tracking-wide mt-0.5">
                  {email || "your@email.com"}
                </p>
              </div>
            </motion.div>

            <Separator className="bg-border/40" />

            {/* Editable fields */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Account Details
              </p>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-name"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground/70"
                >
                  Full Name
                </label>
                <input
                  id="profile-name"
                  data-ocid="profile.name_input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card border border-border/50 px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/60 transition-colors duration-200"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-email"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground/70"
                >
                  Email
                </label>
                <input
                  id="profile-email"
                  data-ocid="profile.email_input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-card border border-border/50 px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/60 transition-colors duration-200"
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-address"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground/70"
                >
                  Delivery Address
                </label>
                <textarea
                  id="profile-address"
                  data-ocid="profile.address_textarea"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full bg-card border border-border/50 px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/60 transition-colors duration-200 resize-none"
                  placeholder="Street address, City, Zip"
                  autoComplete="street-address"
                />
              </div>

              <motion.button
                type="button"
                data-ocid="profile.save_button"
                onClick={handleSave}
                className="w-full py-3 bg-foreground text-background font-display text-xs tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                style={{ fontVariationSettings: '"wght" 700' }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {saved ? "Saved ✓" : "Save Changes"}
              </motion.button>
            </motion.div>

            <Separator className="bg-border/40" />

            {/* Recent Orders */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Recent Orders
              </p>

              <ul className="space-y-0" data-ocid="profile.orders_list">
                {FAKE_ORDERS.map((order, i) => (
                  <li
                    key={order.orderNo}
                    data-ocid={`profile.orders_item.${i + 1}`}
                    className="py-3.5 border-b border-border/30 last:border-b-0 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p
                        className="font-display text-sm tracking-tight text-foreground"
                        style={{ fontVariationSettings: '"wght" 700' }}
                      >
                        {order.orderNo}
                      </p>
                      <p className="font-body text-xs text-muted-foreground truncate max-w-[180px]">
                        {order.item}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground/50 tracking-wide">
                        {order.date}
                      </p>
                    </div>
                    <span className="font-body text-[10px] tracking-widest uppercase px-2 py-1 border border-border/50 text-muted-foreground shrink-0">
                      {order.status}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
