import { useMemo } from "react";
import { t } from "../i18n";

export default function Menu({
  lang,
  categories = [],
  items = [],
  loading = false,
  error = "",
  activeCategory,
  setActiveCategory,
  cart,
  addToCart,
}) {
  const safeCategories = useMemo(() => {
    const all = { id: "all", name: { en: "All", id: "Semua", ar: "الكل" } };
    return [all, ...categories];
  }, [categories]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((x) => x.categoryId === activeCategory);
  }, [activeCategory, items]);

  if (loading)
    return (
      <div className="p-10 text-center font-bold animate-pulse">
        Loading Delicious Food...
      </div>
    );
  if (error)
    return (
      <div className="rounded-3xl bg-rose-50 p-6 text-rose-600">{error}</div>
    );

  return (
    <section className="space-y-6">
      {/* Horizontal Category Scroller */}
      <div className="sticky top-[72px] z-20 -mx-4 bg-surface-50/80 px-4 py-2 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {safeCategories.map((c) => {
            const label = c?.name?.[lang] || c?.name?.en || c.id;
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`shrink-0 rounded-full border px-5 py-2 text-xs font-black transition-all active:scale-90 ${
                  active
                    ? "bg-brand-primary border-brand-primary text-white shadow-md shadow-orange-200"
                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* The Responsive Grid: 1 col (320px), 2 col (360px+), 3 col (lg+) */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((it) => {
          const name = it?.name?.[lang] || it?.name?.en || it.id;
          const desc = it?.desc?.[lang] || it?.desc?.en || "";
          const qty = cart[it.id]?.qty || 0;

          return (
            <article
              key={it.id}
              className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-black/5 bg-white transition-all hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-300">
                    🍽️
                  </div>
                )}

                <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-black shadow-sm backdrop-blur">
                  {it.price} EGP
                </div>

                {qty > 0 && (
                  <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary font-black text-white shadow-lg animate-in zoom-in">
                    {qty}
                  </div>
                )}
              </div>

              {/* Content Container */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-sm font-black text-slate-900 line-clamp-1">
                  {name}
                </h3>
                <p className="mt-1 flex-1 text-[11px] leading-relaxed text-slate-400 line-clamp-2">
                  {desc}
                </p>

                <button
                  type="button"
                  onClick={() => addToCart(it)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-xs font-black text-white transition-all hover:bg-brand-primary active:scale-95"
                >
                  <span>{t(lang, "add")}</span>
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-[2rem] bg-white p-12 text-center border border-dashed border-slate-200">
          <p className="text-sm font-bold text-slate-400">
            No items found in this category.
          </p>
        </div>
      )}
    </section>
  );
}
