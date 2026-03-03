import { MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: number;
  role: "user" | "bot";
  text: string;
}

// ─── FAQ rule-based matcher ───────────────────────────────────────────────────
const FAQ_RULES: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: [
      "size",
      "sizing",
      "fit",
      "measurement",
      "measurements",
      "xs",
      "sm",
      "lg",
      "xl",
    ],
    answer:
      "Our pieces run true to size. We recommend sizing up for an oversized fit.",
  },
  {
    keywords: [
      "ship",
      "shipping",
      "delivery",
      "arrive",
      "arrives",
      "track",
      "tracking",
      "dispatch",
    ],
    answer:
      "We ship worldwide. Standard delivery is 5–7 business days. Express is 2–3 days.",
  },
  {
    keywords: ["return", "returns", "refund", "exchange", "send back"],
    answer:
      "Returns accepted within 30 days of delivery. Items must be unworn and unwashed.",
  },
  {
    keywords: [
      "pay",
      "payment",
      "credit",
      "card",
      "paypal",
      "checkout",
      "stripe",
    ],
    answer: "We accept all major credit cards and PayPal.",
  },
  {
    keywords: [
      "material",
      "fabric",
      "cotton",
      "quality",
      "gsm",
      "blend",
      "sustainable",
      "ethically",
    ],
    answer:
      "We use heavyweight 400gsm cotton and recycled blends. All fabrics are ethically sourced.",
  },
  {
    keywords: ["wholesale", "bulk", "resell", "reseller", "stockist"],
    answer: "For wholesale inquiries, email us at wholesale@jade-brand.com.",
  },
  {
    keywords: ["hi", "hello", "hey", "sup", "what's up"],
    answer:
      "Hey 👋 I'm JADE's support bot. Ask me about sizing, shipping, returns, materials, or payments.",
  },
];

const FALLBACK_ANSWER =
  "Thanks for reaching out. For further help, email support@jade-brand.com.";

function getBotAnswer(message: string): string {
  const lower = message.toLowerCase();
  for (const rule of FAQ_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.answer;
    }
  }
  return FALLBACK_ANSWER;
}

let nextId = 1;
const uid = () => nextId++;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: uid(),
    role: "bot",
    text: "Hey 👋 I'm JADE's support bot. Ask me about sizing, shipping, returns, materials, or payments.",
  },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on messages/typing changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(
      () => {
        const botMsg: ChatMessage = {
          id: uid(),
          role: "bot",
          text: getBotAnswer(trimmed),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      },
      600 + Math.random() * 400,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-ocid="chat.modal"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-[320px] sm:w-[360px] bg-background border border-border/60 flex flex-col overflow-hidden"
            style={{
              boxShadow:
                "0 0 0 1px oklch(0.22 0 0), 0 24px 48px -12px rgba(0,0,0,0.9)",
              maxHeight: "480px",
            }}
          >
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                <span
                  className="font-display text-sm tracking-tightest text-foreground"
                  style={{ fontVariationSettings: '"wght" 700' }}
                >
                  JADE Support
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                aria-label="Close chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 text-sm font-body leading-relaxed ${
                      msg.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-card text-foreground border border-border/40"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                  >
                    <div className="bg-card border border-border/40 px-3 py-2 flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1 h-1 rounded-full bg-muted-foreground/60 block"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 0.8,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Suggested questions */}
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap border-t border-border/30 pt-2">
              {["Sizing", "Shipping", "Returns"].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setInput(topic);
                    inputRef.current?.focus();
                  }}
                  className="font-body text-[10px] tracking-[0.15em] uppercase px-2 py-1 border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors duration-150"
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="flex items-center gap-0 border-t border-border/40 bg-card">
              <input
                ref={inputRef}
                type="text"
                data-ocid="chat.input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question…"
                className="flex-1 bg-transparent px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              <button
                type="button"
                data-ocid="chat.submit_button"
                onClick={sendMessage}
                disabled={!input.trim()}
                className="px-4 py-3 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        type="button"
        data-ocid="chat.open_modal_button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-12 h-12 bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background relative"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-4 h-4" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
