import { useMemo } from "react";
import { t } from "../i18n";

export default function Menu({
  lang,
  categories,
  items,
  activeCategory,
  setActiveCategory,
  cart,
  addToCart,
}) {
  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((x) => x.category === activeCategory);
  }, [activeCategory, items]);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold">{t(lang, "menuTitle")}</div>
          <div className="text-xs text-zinc-500">{t(lang, "categories")}</div>
        </div>
      </div>

      {/* Categories chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {categories.map((c) => {
          const label = c.name[lang] || c.name.en;
          const active = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              type="button"
              className={[
                "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition active:scale-[0.98]",
                active
                  ? "bg-black text-white border-black"
                  : "bg-white border-black/10 text-zinc-700 hover:bg-black/5",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {filtered.map((it) => {
          const name = it.name[lang] || it.name.en;
          const desc = it.desc?.[lang] || it.desc?.en || "";
          const inCartQty = cart[it.id]?.qty || 0;

          return (
            <article
              key={it.id}
              className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{name}</div>
                  {desc ? (
                    <div className="mt-1 text-xs text-zinc-600">{desc}</div>
                  ) : null}
                  <div className="mt-2 text-sm font-semibold">
                    {it.price} EGP
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => addToCart(it)}
                    className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white active:scale-[0.98]"
                  >
                    {t(lang, "add")}
                  </button>

                  {inCartQty > 0 ? (
                    <div className="text-xs text-zinc-600">
                      {t(lang, "qty")}:{" "}
                      <span className="font-semibold">{inCartQty}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
