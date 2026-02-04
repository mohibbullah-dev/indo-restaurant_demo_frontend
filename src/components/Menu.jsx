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
    const activeItems = items.filter((it) => it.isActive !== false);
    if (activeCategory === "all") return activeItems;
    return activeItems.filter((x) => x.categoryId === activeCategory);
  }, [activeCategory, items]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="h-10 w-10 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Loading Menu...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="rounded-3xl bg-rose-50 p-6 text-center border border-rose-100 text-rose-600 text-sm font-bold">
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* CATEGORY TABS */}
      <div className="sticky top-[68px] z-30 -mx-3 bg-zinc-50/95 px-3 py-3 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {safeCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 rounded-xl px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                activeCategory === c.id
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                  : "bg-white text-zinc-400 border border-zinc-100"
              }`}
            >
              {c?.name?.[lang] || c?.name?.en}
            </button>
          ))}
        </div>
      </div>

      {/* GRID LOGIC */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((it) => {
          const name = it?.name?.[lang] || it?.name?.en;
          const qty = cart[it.id]?.qty || 0;

          return (
            <article
              key={it.id}
              className="group relative flex h-32 flex-row overflow-hidden rounded-2xl border border-zinc-100 bg-white transition-all active:scale-[0.98] sm:h-auto sm:flex-col sm:rounded-[2.5rem] sm:hover:shadow-xl sm:hover:shadow-zinc-200/50"
            >
              {/* IMAGE CONTAINER */}
              <div className="relative aspect-square h-full shrink-0 overflow-hidden sm:h-auto sm:w-full">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 sm:group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-2xl">
                    🍽️
                  </div>
                )}

                {qty > 0 && (
                  <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-black text-white shadow-lg sm:top-4 sm:right-4 sm:h-10 sm:w-10 sm:rounded-2xl sm:text-xs">
                    {qty}
                  </div>
                )}
              </div>

              {/* CONTENT AREA */}
              <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-6">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black uppercase tracking-tight text-zinc-900 sm:text-lg sm:whitespace-normal">
                    {name}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-bold text-emerald-600 sm:mt-1 sm:text-sm">
                    {it.price}{" "}
                    <span className="text-[8px] sm:text-[10px]">EGP</span>
                  </p>
                </div>

                <button
                  onClick={() => addToCart(it)}
                  className="mt-2 flex w-full items-center justify-center rounded-xl bg-zinc-900 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-transform active:scale-95 sm:mt-4 sm:rounded-2xl sm:py-4 sm:text-xs"
                >
                  {t(lang, "add")} +
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-[2.5rem] border border-dashed border-zinc-200 py-20 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            No Items Found
          </p>
        </div>
      )}
    </div>
  );
}
