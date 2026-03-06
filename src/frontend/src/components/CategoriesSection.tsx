import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type CategoryTree = Record<string, string[]>;

export const DEFAULT_CATEGORY_TREE: CategoryTree = {
  "Men's": ["Tops", "Bottoms", "Outerwear", "Accessories"],
  "Women's": ["Tops", "Bottoms", "Outerwear", "Accessories"],
};

const LS_CATEGORIES = "jade_categories";

function readCategories(): CategoryTree {
  try {
    const raw = localStorage.getItem(LS_CATEGORIES);
    if (!raw) return DEFAULT_CATEGORY_TREE;
    return JSON.parse(raw) as CategoryTree;
  } catch {
    return DEFAULT_CATEGORY_TREE;
  }
}

// ─── CategoriesSection ────────────────────────────────────────────────────────
interface CategoriesSectionProps {
  onFilterChange: (filter: string | null) => void;
  activeFilter: string | null;
}

export function CategoriesSection({
  onFilterChange,
  activeFilter,
}: CategoriesSectionProps) {
  const [tree, setTree] = useState<CategoryTree>(readCategories);
  const [activeGender, setActiveGender] = useState<string | null>(null);

  // Sync from localStorage on mount and on storage events
  useEffect(() => {
    const handleStorage = () => setTree(readCategories());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const genders = Object.keys(tree);

  // When activeFilter changes externally (e.g. reset), sync gender tab
  // biome-ignore lint/correctness/useExhaustiveDependencies: genders array identity changes on every render; string join is stable key
  useEffect(() => {
    if (!activeFilter) {
      setActiveGender(null);
      return;
    }
    const parts = activeFilter.split(" > ");
    const gender = parts[0];
    if (genders.includes(gender)) {
      setActiveGender(gender);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, genders.join(",")]);

  const handleGenderClick = (gender: string | null) => {
    setActiveGender(gender);
    if (gender === null) {
      onFilterChange(null);
    } else {
      // Clicking a gender without sub-category defaults to showing all of that gender
      // Only emit a filter if user then picks a sub-category
      // For "All Men's" behaviour — emit gender filter so ProductsSection knows to show all from that gender
      onFilterChange(`${gender}`);
    }
  };

  const handleSubCategoryClick = (gender: string, sub: string) => {
    const filter = `${gender} > ${sub}`;
    if (activeFilter === filter) {
      // Toggle off — revert to gender-level
      onFilterChange(gender);
    } else {
      onFilterChange(filter);
    }
  };

  const subCategories = activeGender ? (tree[activeGender] ?? []) : [];
  const activeSubCategory = activeFilter?.includes(" > ")
    ? activeFilter.split(" > ")[1]
    : null;

  return (
    <motion.section
      data-ocid="categories.section"
      className="px-6 md:px-12 pt-0 pb-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Gender tabs row */}
      <div className="flex items-center gap-0 border-b border-border/40 mb-0">
        {/* All tab */}
        <button
          type="button"
          data-ocid="categories.gender_tab"
          onClick={() => handleGenderClick(null)}
          className={`relative font-body text-[11px] tracking-[0.28em] uppercase px-5 py-3.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
            activeGender === null
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
          {activeGender === null && (
            <motion.div
              layoutId="gender-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-[1px] bg-foreground"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </button>

        {/* Gender group tabs */}
        {genders.map((gender) => (
          <button
            key={gender}
            type="button"
            data-ocid="categories.gender_tab"
            onClick={() => handleGenderClick(gender)}
            className={`relative font-body text-[11px] tracking-[0.28em] uppercase px-5 py-3.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
              activeGender === gender
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {gender}
            {activeGender === gender && (
              <motion.div
                layoutId="gender-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[1px] bg-foreground"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Sub-category chips row */}
      <AnimatePresence>
        {activeGender !== null && subCategories.length > 0 && (
          <motion.div
            className="flex items-center gap-2 flex-wrap pt-4 pb-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* "All [Gender]" chip */}
            <button
              type="button"
              data-ocid="categories.subcategory_tab"
              onClick={() => {
                onFilterChange(activeGender);
                // Clear sub-category selection
              }}
              className={`font-body text-[10px] tracking-[0.25em] uppercase px-4 py-1.5 border transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                !activeSubCategory
                  ? "border-foreground text-foreground bg-foreground/8"
                  : "border-border/40 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              All {activeGender}
            </button>

            {/* Sub-category chips */}
            {subCategories.map((sub) => (
              <button
                key={sub}
                type="button"
                data-ocid="categories.subcategory_tab"
                onClick={() => handleSubCategoryClick(activeGender, sub)}
                className={`font-body text-[10px] tracking-[0.25em] uppercase px-4 py-1.5 border transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  activeSubCategory === sub
                    ? "border-foreground text-foreground bg-foreground/8"
                    : "border-border/40 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {sub}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
