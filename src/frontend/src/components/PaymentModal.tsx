import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CartItem } from "@/context/CartContext";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotalCents: number;
  onSuccess: () => void;
}

type PaymentMethod = "card" | "upi" | "cod";
type Step = "address" | "payment" | "success";

interface AddressData {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pinCode: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Puducherry",
  "Jammu & Kashmir",
  "Ladakh",
];

function formatPrice(cents: number): string {
  return `₹${(cents / 100).toFixed(0)}`;
}

function generateOrderNo(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#JD-${num}`;
}

const STEP_LABELS: { id: Step; label: string }[] = [
  { id: "address", label: "Address" },
  { id: "payment", label: "Payment" },
  { id: "success", label: "Confirm" },
];

function StepIndicator({ current }: { current: Step }) {
  const stepIndex = STEP_LABELS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0 px-6 py-4 border-b border-border/40">
      {STEP_LABELS.map((step, i) => {
        const done = i < stepIndex;
        const active = i === stepIndex;
        return (
          <div key={step.id} className="flex items-center gap-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 flex items-center justify-center text-[10px] font-body font-bold transition-colors duration-200 ${
                  done
                    ? "bg-foreground text-background"
                    : active
                      ? "bg-foreground text-background"
                      : "border border-border/40 text-muted-foreground/40"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`font-body text-[10px] tracking-[0.2em] uppercase transition-colors duration-200 ${
                  active
                    ? "text-foreground"
                    : done
                      ? "text-muted-foreground"
                      : "text-muted-foreground/40"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <span className="mx-3 text-border/50 font-body text-xs">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const EMPTY_ADDRESS: AddressData = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pinCode: "",
};

export function PaymentModal({
  open,
  onClose,
  cartItems,
  subtotalCents,
  onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<AddressData>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<Partial<AddressData>>({});

  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderNo, setOrderNo] = useState("");

  const resetForm = () => {
    setStep("address");
    setErrors({});
    setAddress(EMPTY_ADDRESS);
    setMethod("card");
    setCardNumber("");
    setCardName("");
    setExpiry("");
    setCvv("");
    setUpiId("");
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  const validateAddress = (): boolean => {
    const newErrors: Partial<AddressData> = {};
    if (!address.fullName.trim()) newErrors.fullName = "Required";
    if (
      !address.phone.trim() ||
      !/^\d{10}$/.test(address.phone.replace(/\s/g, ""))
    )
      newErrors.phone = "Enter a valid 10-digit number";
    if (!address.line1.trim()) newErrors.line1 = "Required";
    if (!address.city.trim()) newErrors.city = "Required";
    if (!address.state.trim()) newErrors.state = "Required";
    if (!address.pinCode.trim() || !/^\d{6}$/.test(address.pinCode))
      newErrors.pinCode = "Enter a valid 6-digit PIN";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateAddress()) setStep("payment");
  };

  const handlePlaceOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      setOrderNo(generateOrderNo());
      setStep("success");
    }, 1200);
  };

  const handleContinueShopping = () => {
    onSuccess();
    setTimeout(resetForm, 300);
  };

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3)
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const inputClass =
    "w-full bg-card border border-border/50 px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/60 transition-colors duration-200";

  const inputErrorClass =
    "w-full bg-card border border-destructive/60 px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-destructive transition-colors duration-200";

  const labelClass =
    "font-body text-xs tracking-wider uppercase text-muted-foreground/70 block mb-1.5";

  // Native select options can't be styled on all browsers with CSS alone.
  // We add color-scheme: dark to hint the browser to use dark-styled native UI.
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] =
    [
      {
        id: "card",
        label: "Credit / Debit Card",
        icon: <CreditCard className="w-4 h-4" />,
      },
      {
        id: "upi",
        label: "UPI / GPay",
        icon: <Smartphone className="w-4 h-4" />,
      },
      {
        id: "cod",
        label: "Cash on Delivery",
        icon: <Truck className="w-4 h-4" />,
      },
    ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        data-ocid="payment.modal"
        showCloseButton={false}
        className="bg-background border border-border/60 p-0 gap-0 max-w-[480px] w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        <AnimatePresence mode="wait">
          {/* ── Step 1: Address ── */}
          {step === "address" && (
            <motion.div
              key="address"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col min-h-0 flex-1"
            >
              <DialogHeader className="px-6 pt-5 pb-0 border-b-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-display text-lg tracking-tightest text-foreground">
                    <span style={{ fontVariationSettings: '"wght" 900' }}>
                      Checkout
                    </span>
                  </DialogTitle>
                  <button
                    type="button"
                    data-ocid="payment.close_button"
                    onClick={handleClose}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring p-1"
                    aria-label="Close checkout"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </DialogHeader>

              <StepIndicator current="address" />

              <ScrollArea className="flex-1 overflow-auto">
                <div
                  data-ocid="payment.address_panel"
                  className="px-6 py-5 space-y-4"
                >
                  <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    Delivery Address
                  </p>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="addr-name" className={labelClass}>
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="addr-name"
                      data-ocid="payment.address_name_input"
                      type="text"
                      value={address.fullName}
                      onChange={(e) => {
                        setAddress((p) => ({ ...p, fullName: e.target.value }));
                        setErrors((p) => ({ ...p, fullName: undefined }));
                      }}
                      className={errors.fullName ? inputErrorClass : inputClass}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                    {errors.fullName && (
                      <p
                        data-ocid="payment.address_name_error"
                        className="font-body text-[10px] text-destructive mt-1"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="addr-phone" className={labelClass}>
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="addr-phone"
                      data-ocid="payment.address_phone_input"
                      type="tel"
                      inputMode="numeric"
                      value={address.phone}
                      onChange={(e) => {
                        setAddress((p) => ({
                          ...p,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        }));
                        setErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      className={errors.phone ? inputErrorClass : inputClass}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <p
                        data-ocid="payment.address_phone_error"
                        className="font-body text-[10px] text-destructive mt-1"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label htmlFor="addr-line1" className={labelClass}>
                      Address Line 1 <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="addr-line1"
                      data-ocid="payment.address_line1_input"
                      type="text"
                      value={address.line1}
                      onChange={(e) => {
                        setAddress((p) => ({ ...p, line1: e.target.value }));
                        setErrors((p) => ({ ...p, line1: undefined }));
                      }}
                      className={errors.line1 ? inputErrorClass : inputClass}
                      placeholder="House / Flat no., Street, Area"
                      autoComplete="address-line1"
                    />
                    {errors.line1 && (
                      <p
                        data-ocid="payment.address_line1_error"
                        className="font-body text-[10px] text-destructive mt-1"
                      >
                        {errors.line1}
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label htmlFor="addr-line2" className={labelClass}>
                      Address Line 2{" "}
                      <span className="text-muted-foreground/40 normal-case">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="addr-line2"
                      data-ocid="payment.address_line2_input"
                      type="text"
                      value={address.line2}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, line2: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="Landmark, Colony, etc."
                      autoComplete="address-line2"
                    />
                  </div>

                  {/* City + PIN side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="addr-city" className={labelClass}>
                        City <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="addr-city"
                        data-ocid="payment.address_city_input"
                        type="text"
                        value={address.city}
                        onChange={(e) => {
                          setAddress((p) => ({ ...p, city: e.target.value }));
                          setErrors((p) => ({ ...p, city: undefined }));
                        }}
                        className={errors.city ? inputErrorClass : inputClass}
                        placeholder="Mumbai"
                        autoComplete="address-level2"
                      />
                      {errors.city && (
                        <p
                          data-ocid="payment.address_city_error"
                          className="font-body text-[10px] text-destructive mt-1"
                        >
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="addr-pin" className={labelClass}>
                        PIN Code <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="addr-pin"
                        data-ocid="payment.address_pin_input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={address.pinCode}
                        onChange={(e) => {
                          setAddress((p) => ({
                            ...p,
                            pinCode: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          }));
                          setErrors((p) => ({ ...p, pinCode: undefined }));
                        }}
                        className={
                          errors.pinCode ? inputErrorClass : inputClass
                        }
                        placeholder="400001"
                        autoComplete="postal-code"
                      />
                      {errors.pinCode && (
                        <p
                          data-ocid="payment.address_pin_error"
                          className="font-body text-[10px] text-destructive mt-1"
                        >
                          {errors.pinCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="addr-state" className={labelClass}>
                      State <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="addr-state"
                      data-ocid="payment.address_state_select"
                      value={address.state}
                      onChange={(e) => {
                        setAddress((p) => ({ ...p, state: e.target.value }));
                        setErrors((p) => ({ ...p, state: undefined }));
                      }}
                      className={`${errors.state ? inputErrorClass : selectClass}`}
                      style={{ colorScheme: "dark" }}
                      autoComplete="address-level1"
                    >
                      <option value="" disabled>
                        Select state
                      </option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p
                        data-ocid="payment.address_state_error"
                        className="font-body text-[10px] text-destructive mt-1"
                      >
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>
              </ScrollArea>

              <div className="px-6 py-5 border-t border-border/40">
                <motion.button
                  type="button"
                  data-ocid="payment.continue_to_payment_button"
                  onClick={handleContinueToPayment}
                  className="w-full py-3.5 bg-foreground text-background font-display text-sm tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ fontVariationSettings: '"wght" 700' }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Continue to Payment
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col min-h-0 flex-1"
            >
              <DialogHeader className="px-6 pt-5 pb-0 border-b-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-display text-lg tracking-tightest text-foreground">
                    <span style={{ fontVariationSettings: '"wght" 900' }}>
                      Checkout
                    </span>
                  </DialogTitle>
                  <button
                    type="button"
                    data-ocid="payment.payment_close_button"
                    onClick={handleClose}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring p-1"
                    aria-label="Close checkout"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </DialogHeader>

              <StepIndicator current="payment" />

              <ScrollArea className="flex-1 overflow-auto">
                <div className="px-6 py-5 space-y-6">
                  {/* Address summary */}
                  <div
                    data-ocid="payment.address_summary"
                    className="bg-card border border-border/40 px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60 mb-1">
                        Delivering to
                      </p>
                      <p
                        className="font-display text-sm tracking-tight text-foreground"
                        style={{ fontVariationSettings: '"wght" 700' }}
                      >
                        {address.fullName}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {address.city}, {address.state} – {address.pinCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      data-ocid="payment.edit_address_button"
                      onClick={() => setStep("address")}
                      className="font-body text-[10px] tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-2">
                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                      Order Summary
                    </p>
                    <ul className="space-y-1.5">
                      {cartItems.map((item) => (
                        <li
                          key={item.product.id}
                          className="flex justify-between font-body text-xs text-muted-foreground"
                        >
                          <span className="truncate pr-4">
                            {item.product.name}{" "}
                            {item.quantity > 1 && `×${item.quantity}`}
                          </span>
                          <span className="shrink-0">
                            {formatPrice(
                              item.product.priceCents * item.quantity,
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between font-body text-sm text-foreground pt-1.5 border-t border-border/30 mt-2">
                      <span className="tracking-wider uppercase text-xs text-muted-foreground">
                        Total
                      </span>
                      <span
                        className="font-display text-base"
                        style={{ fontVariationSettings: '"wght" 700' }}
                      >
                        {formatPrice(subtotalCents)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3">
                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                      Payment Method
                    </p>
                    <div className="flex flex-col gap-2">
                      {methods.map((m) => (
                        <label
                          key={m.id}
                          data-ocid={`payment.method_${m.id}_button`}
                          className={`flex items-center gap-3 px-4 py-3 border transition-colors duration-200 cursor-pointer focus-within:ring-1 focus-within:ring-foreground ${
                            method === m.id
                              ? "border-foreground bg-foreground/5 text-foreground"
                              : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment-method"
                            value={m.id}
                            checked={method === m.id}
                            onChange={() => setMethod(m.id)}
                            className="sr-only"
                          />
                          <span
                            className={`transition-colors ${method === m.id ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {m.icon}
                          </span>
                          <span className="font-body text-sm tracking-wide">
                            {m.label}
                          </span>
                          <span
                            className={`ml-auto w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              method === m.id
                                ? "border-foreground bg-foreground"
                                : "border-border/60"
                            }`}
                          >
                            {method === m.id && (
                              <span className="w-1.5 h-1.5 rounded-full bg-background" />
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Method-specific form */}
                  <AnimatePresence mode="wait" initial={false}>
                    {method === "card" && (
                      <motion.div
                        key="card"
                        data-ocid="payment.card_panel"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div>
                          <label htmlFor="card-number" className={labelClass}>
                            Card Number
                          </label>
                          <input
                            id="card-number"
                            data-ocid="payment.card_number_input"
                            type="text"
                            inputMode="numeric"
                            value={cardNumber}
                            onChange={(e) =>
                              setCardNumber(formatCardNumber(e.target.value))
                            }
                            className={inputClass}
                            placeholder="1234 5678 9012 3456"
                            autoComplete="cc-number"
                          />
                        </div>
                        <div>
                          <label htmlFor="card-name" className={labelClass}>
                            Cardholder Name
                          </label>
                          <input
                            id="card-name"
                            data-ocid="payment.card_name_input"
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className={inputClass}
                            placeholder="Name on card"
                            autoComplete="cc-name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="card-expiry" className={labelClass}>
                              Expiry (MM/YY)
                            </label>
                            <input
                              id="card-expiry"
                              data-ocid="payment.card_expiry_input"
                              type="text"
                              inputMode="numeric"
                              value={expiry}
                              onChange={(e) =>
                                setExpiry(formatExpiry(e.target.value))
                              }
                              className={inputClass}
                              placeholder="MM/YY"
                              autoComplete="cc-exp"
                            />
                          </div>
                          <div>
                            <label htmlFor="card-cvv" className={labelClass}>
                              CVV
                            </label>
                            <input
                              id="card-cvv"
                              data-ocid="payment.card_cvv_input"
                              type="password"
                              inputMode="numeric"
                              maxLength={4}
                              value={cvv}
                              onChange={(e) =>
                                setCvv(
                                  e.target.value.replace(/\D/g, "").slice(0, 4),
                                )
                              }
                              className={inputClass}
                              placeholder="•••"
                              autoComplete="cc-csc"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {method === "upi" && (
                      <motion.div
                        key="upi"
                        data-ocid="payment.upi_panel"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div>
                          <label htmlFor="upi-id" className={labelClass}>
                            UPI ID
                          </label>
                          <input
                            id="upi-id"
                            data-ocid="payment.upi_input"
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className={inputClass}
                            placeholder="yourname@upi"
                            autoComplete="off"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                            Also accepted:
                          </span>
                          <div className="flex items-center gap-2">
                            {["GPay", "PhonePe", "Paytm"].map((app) => (
                              <span
                                key={app}
                                className="font-body text-[10px] tracking-wider px-2 py-1 border border-border/40 text-muted-foreground"
                              >
                                {app}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {method === "cod" && (
                      <motion.div
                        key="cod"
                        data-ocid="payment.cod_panel"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="bg-card border border-border/40 px-4 py-5"
                      >
                        <div className="flex gap-3 items-start">
                          <Truck className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <p className="font-body text-sm text-foreground tracking-wide">
                              Pay when your order arrives
                            </p>
                            <p className="font-body text-xs text-muted-foreground/70 leading-relaxed">
                              Our delivery partner will collect the payment at
                              the time of delivery. Keep the exact amount ready.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <div className="px-6 py-5 border-t border-border/40 space-y-3">
                <motion.button
                  type="button"
                  data-ocid="payment.place_order_button"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full py-3.5 bg-foreground text-background font-display text-sm tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ fontVariationSettings: '"wght" 700' }}
                  whileHover={!placing ? { scale: 1.01 } : undefined}
                  whileTap={!placing ? { scale: 0.99 } : undefined}
                >
                  {placing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    `Place Order · ${formatPrice(subtotalCents)}`
                  )}
                </motion.button>

                <button
                  type="button"
                  data-ocid="payment.back_button"
                  onClick={() => setStep("address")}
                  className="w-full flex items-center justify-center gap-1.5 font-body text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 py-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Address
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Success ── */}
          {step === "success" && (
            <motion.div
              key="success"
              data-ocid="payment.success_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center gap-6 py-16 px-8 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  delay: 0.1,
                }}
              >
                <CheckCircle2 className="w-16 h-16 text-foreground" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="space-y-2"
              >
                <h2
                  className="font-display text-3xl tracking-tightest text-foreground"
                  style={{ fontVariationSettings: '"wght" 900' }}
                >
                  Order Placed!
                </h2>
                <p className="font-body text-sm text-muted-foreground tracking-wide">
                  Your order {orderNo} is confirmed.
                </p>
                <p className="font-body text-xs text-muted-foreground/60 tracking-wide">
                  Delivering to {address.city}, {address.state}.
                </p>
                <p className="font-body text-xs text-muted-foreground/50 tracking-wide pt-1">
                  You'll receive a confirmation shortly.
                </p>
              </motion.div>
              <motion.button
                type="button"
                data-ocid="payment.continue_button"
                onClick={handleContinueShopping}
                className="mt-4 px-10 py-3 bg-foreground text-background font-display text-xs tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                style={{ fontVariationSettings: '"wght" 700' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue Shopping
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
