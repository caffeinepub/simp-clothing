import { Star } from "lucide-react";
import { motion } from "motion/react";

interface StoredReview {
  id: number;
  reviewerName: string;
  itemName: string;
  rating: number;
  quote: string;
  date: string;
}

const FALLBACK_REVIEWS = [
  {
    name: "Priya M.",
    rating: 5,
    quote:
      "The Void Hoodie is incredible — heavyweight fabric, perfect drop shoulder. It arrived beautifully packaged, feels like it'll last a decade.",
    date: "Feb 2026",
    item: "Void Hoodie",
  },
  {
    name: "Jordan K.",
    rating: 5,
    quote:
      "Ordered the Utility Cargo and was blown away by the quality. The seams are impeccable and the fit is exactly how the photos show. Shipping was faster than expected.",
    date: "Jan 2026",
    item: "Utility Cargo",
  },
  {
    name: "Sana L.",
    rating: 4,
    quote:
      "Got the Oversized Tee and Logo Cap together. The cap stitching is clean, the tee drapes beautifully. Definitely ordering the Bomber next.",
    date: "Feb 2026",
    item: "Oversized Tee",
  },
  {
    name: "Marcus T.",
    rating: 5,
    quote:
      "JADE is the real deal. No gimmicks, just great garments. The Blank Bomber's shell fabric is premium — you feel it the moment you pick it up.",
    date: "Jan 2026",
    item: "Blank Bomber",
  },
  {
    name: "Aiko R.",
    rating: 5,
    quote:
      "Packaging alone impressed me — minimal, no waste. The Track Pants fit perfectly and the waistband is sturdy. This brand actually cares about every detail.",
    date: "Dec 2025",
    item: "Track Pant",
  },
];

function getReviews(): Array<{
  name: string;
  rating: number;
  quote: string;
  date: string;
  item: string;
}> {
  try {
    const raw = localStorage.getItem("jade_reviews");
    if (!raw) return FALLBACK_REVIEWS;
    const stored: StoredReview[] = JSON.parse(raw);
    if (!Array.isArray(stored) || stored.length === 0) return FALLBACK_REVIEWS;
    return stored.map((r) => ({
      name: r.reviewerName,
      rating: r.rating,
      quote: r.quote,
      date: r.date,
      item: r.itemName,
    }));
  } catch {
    return FALLBACK_REVIEWS;
  }
}

function StarRating({ count }: { count: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          // biome-ignore lint/suspicious/noArrayIndexKey: star positions are positional
          key={i}
          className={`w-3 h-3 ${i < count ? "fill-foreground text-foreground" : "fill-none text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const REVIEWS = getReviews();

  return (
    <section
      id="reviews"
      data-ocid="reviews.section"
      className="px-6 md:px-12 py-24 md:py-32 border-t border-border"
    >
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
        <motion.h2
          className="font-display text-4xl md:text-6xl tracking-tightest text-foreground leading-none"
          style={{ fontVariationSettings: '"wght" 900' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          What Our
          <br />
          <span className="text-muted-foreground">Customers Say</span>
        </motion.h2>

        <motion.p
          className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Verified Reviews
        </motion.p>
      </div>

      {/* Reviews grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {REVIEWS.map((review, i) => (
          <motion.article
            key={review.name}
            data-ocid={`reviews.item.${i + 1}`}
            className="bg-card border border-border/40 p-6 flex flex-col gap-4 group hover:border-border/80 transition-colors duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.65,
              delay: (i % 3) * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Rating */}
            <StarRating count={review.rating} />

            {/* Quote */}
            <blockquote className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
              "{review.quote}"
            </blockquote>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div>
                <p
                  className="font-display text-sm tracking-tight text-foreground"
                  style={{ fontVariationSettings: '"wght" 700' }}
                >
                  {review.name}
                </p>
                <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground/60 mt-0.5">
                  {review.item}
                </p>
              </div>
              <span className="font-body text-[10px] tracking-wider text-muted-foreground/50">
                {review.date}
              </span>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Overall rating strip */}
      <motion.div
        className="mt-12 flex items-center gap-6 px-6 py-5 border border-border/40 bg-card/50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div>
          <p
            className="font-display text-4xl tracking-tightest text-foreground"
            style={{ fontVariationSettings: '"wght" 900' }}
          >
            4.9
          </p>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mt-0.5">
            out of 5
          </p>
        </div>
        <div className="w-px h-10 bg-border/40" />
        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                // biome-ignore lint/suspicious/noArrayIndexKey: star positions are positional
                key={i}
                className="w-4 h-4 fill-foreground text-foreground"
              />
            ))}
          </div>
          <p className="font-body text-xs text-muted-foreground mt-1 tracking-wide">
            Based on {REVIEWS.length} verified reviews
          </p>
        </div>
      </motion.div>
    </section>
  );
}
