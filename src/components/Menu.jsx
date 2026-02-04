// import { useMemo } from "react";
// import { t } from "../i18n";

// export default function Menu({
//   lang,
//   categories = [],
//   items = [],
//   loading = false,
//   error = "",
//   activeCategory,
//   setActiveCategory,
//   cart,
//   addToCart,
// }) {
//   const safeCategories = useMemo(() => {
//     const all = { id: "all", name: { en: "All", id: "Semua", ar: "الكل" } };
//     return [all, ...categories];
//   }, [categories]);

//   const filtered = useMemo(() => {
//     if (activeCategory === "all") return items;
//     return items.filter((x) => x.categoryId === activeCategory);
//   }, [activeCategory, items]);

//   if (loading) {
//     return (
//       <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
//         <div className="text-sm font-semibold">Loading menu…</div>
//         <div className="mt-2 text-xs text-zinc-500">
//           Fetching items from Firestore.
//         </div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
//         <div className="text-sm font-semibold text-rose-900">Menu error</div>
//         <div className="mt-2 text-xs text-rose-900">{error}</div>
//       </section>
//     );
//   }

//   return (
//     <section className="space-y-4">
//       <div className="flex items-end justify-between">
//         <div>
//           <div className="text-base font-semibold">{t(lang, "menuTitle")}</div>
//           <div className="text-xs text-zinc-500">{t(lang, "categories")}</div>
//         </div>
//       </div>

//       {/* Categories chips (safe for tiny screens) */}
//       <div className="flex gap-2 overflow-x-auto pb-1 pr-1 [-webkit-overflow-scrolling:touch]">
//         {safeCategories.map((c) => {
//           const label = c?.name?.[lang] || c?.name?.en || c.id;
//           const active = activeCategory === c.id;
//           return (
//             <button
//               key={c.id}
//               onClick={() => setActiveCategory(c.id)}
//               type="button"
//               className={[
//                 "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition active:scale-[0.98]",
//                 active
//                   ? "bg-black text-white border-black"
//                   : "bg-white border-black/10 text-zinc-700 hover:bg-black/5",
//               ].join(" ")}
//             >
//               {label}
//             </button>
//           );
//         })}
//       </div>

//       {/* ✅ Grid: mobile+tablet=2 cols, lg+=3 cols */}
//       <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
//         {filtered.map((it) => {
//           const name = it?.name?.[lang] || it?.name?.en || it.id;
//           const desc = it?.desc?.[lang] || it?.desc?.en || "";
//           const inCartQty = cart[it.id]?.qty || 0;

//           return (
//             <article
//               key={it.id}
//               className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:shadow-md"
//             >
//               {/* Image header */}
//               <div className="relative aspect-[16/10] w-full bg-zinc-100">
//                 {it.imageUrl ? (
//                   <img
//                     src={it.imageUrl}
//                     alt=""
//                     className="h-full w-full object-cover"
//                     loading="lazy"
//                   />
//                 ) : (
//                   <div className="h-full w-full" />
//                 )}

//                 <div className="absolute left-2 top-2 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur">
//                   {it.price} EGP
//                 </div>

//                 {inCartQty > 0 ? (
//                   <div className="absolute right-2 top-2 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
//                     {t(lang, "qty")}: {inCartQty}
//                   </div>
//                 ) : null}
//               </div>

//               <div className="p-4 sm:p-5">
//                 <div className="min-w-0">
//                   <div className="truncate text-sm sm:text-base font-semibold">
//                     {name}
//                   </div>

//                   {desc ? (
//                     <div className="mt-1 line-clamp-2 text-xs sm:text-sm text-zinc-600">
//                       {desc}
//                     </div>
//                   ) : (
//                     <div className="mt-1 text-xs sm:text-sm text-zinc-400">
//                       &nbsp;
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-4 flex items-center justify-between gap-2">
//                   <button
//                     type="button"
//                     onClick={() => addToCart(it)}
//                     className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
//                   >
//                     {t(lang, "add")}
//                   </button>

//                   <div className="hidden sm:block text-xs text-zinc-500">
//                     {inCartQty > 0 ? (
//                       <span>
//                         {t(lang, "qty")}:{" "}
//                         <span className="font-semibold text-zinc-800">
//                           {inCartQty}
//                         </span>
//                       </span>
//                     ) : (
//                       <span className="text-zinc-400"> </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </article>
//           );
//         })}

//         {filtered.length === 0 ? (
//           <div className="col-span-2 lg:col-span-3 rounded-3xl border border-black/10 bg-white p-5 text-sm text-zinc-600">
//             No items in this category yet.
//           </div>
//         ) : null}
//       </div>
//     </section>
//   );
// }

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

  if (loading) {
    return (
      <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold">Loading menu…</div>
        <div className="mt-2 text-xs text-zinc-500">
          Fetching items from Firestore.
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <div className="text-sm font-semibold text-rose-900">Menu error</div>
        <div className="mt-2 text-xs text-rose-900">{error}</div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-base font-semibold">{t(lang, "menuTitle")}</div>
          <div className="text-xs text-zinc-500">{t(lang, "categories")}</div>
        </div>
      </div>

      {/* Categories chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {safeCategories.map((c) => {
          const label = c?.name?.[lang] || c?.name?.en || c.id;
          const active = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              type="button"
              className={[
                "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition active:scale-[0.98]",
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

      {/* ✅ Grid: mobile+tablet = 2 cols, lg = 3 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {filtered.map((it) => {
          const name = it?.name?.[lang] || it?.name?.en || it.id;
          const desc = it?.desc?.[lang] || it?.desc?.en || "";
          const inCartQty = cart[it.id]?.qty || 0;

          return (
            <article
              key={it.id}
              className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* ✅ Smaller image on small screens so 2-col fits nicely */}
              <div className="relative h-28 w-full bg-zinc-100 sm:h-36">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full" />
                )}

                {/* Price badge (smaller on mobile) */}
                <div className="absolute left-2 top-2 rounded-full border border-black/10 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-900 backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
                  {it.price} EGP
                </div>

                {/* Qty badge */}
                {inCartQty > 0 ? (
                  <div className="absolute right-2 top-2 rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold text-white sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
                    {inCartQty}
                  </div>
                ) : null}
              </div>

              {/* ✅ Compact padding on mobile, normal on bigger screens */}
              <div className="p-3 sm:p-5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold sm:text-base">
                    {name}
                  </div>

                  {desc ? (
                    <div className="mt-1 line-clamp-2 text-xs text-zinc-600 sm:text-sm">
                      {desc}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-zinc-400 sm:text-sm">
                      &nbsp;
                    </div>
                  )}
                </div>

                {/* ✅ Button fits small screen nicely */}
                <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => addToCart(it)}
                    className="flex-1 rounded-2xl bg-black px-3 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.99] sm:px-4 sm:py-3"
                  >
                    {t(lang, "add")}
                  </button>

                  {/* Small qty hint (optional) */}
                  <div className="hidden sm:block text-xs text-zinc-500">
                    {inCartQty > 0 ? (
                      <span>
                        {t(lang, "qty")}:{" "}
                        <span className="font-semibold text-zinc-800">
                          {inCartQty}
                        </span>
                      </span>
                    ) : (
                      <span className="text-zinc-400"> </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 ? (
          <div className="col-span-2 lg:col-span-3 rounded-3xl border border-black/10 bg-white p-5 text-sm text-zinc-600">
            No items in this category yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
