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

//   if (loading)
//     return (
//       <div className="p-10 text-center font-bold animate-pulse">
//         Loading Delicious Food...
//       </div>
//     );
//   if (error)
//     return (
//       <div className="rounded-3xl bg-rose-50 p-6 text-rose-600">{error}</div>
//     );

//   return (
//     <section className="space-y-6">
//       {/* Horizontal Category Scroller */}
//       <div className="sticky top-[72px] z-20 -mx-4 bg-surface-50/80 px-4 py-2 backdrop-blur-sm">
//         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
//           {safeCategories.map((c) => {
//             const label = c?.name?.[lang] || c?.name?.en || c.id;
//             const active = activeCategory === c.id;
//             return (
//               <button
//                 key={c.id}
//                 onClick={() => setActiveCategory(c.id)}
//                 className={`shrink-0 rounded-full border px-5 py-2 text-xs font-black transition-all active:scale-90 ${
//                   active
//                     ? "bg-brand-primary border-brand-primary text-white shadow-md shadow-orange-200"
//                     : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
//                 }`}
//               >
//                 {label}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* The Responsive Grid: 1 col (320px), 2 col (360px+), 3 col (lg+) */}
//       <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filtered.map((it) => {
//           const name = it?.name?.[lang] || it?.name?.en || it.id;
//           const desc = it?.desc?.[lang] || it?.desc?.en || "";
//           const qty = cart[it.id]?.qty || 0;

//           return (
//             <article
//               key={it.id}
//               className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-black/5 bg-white transition-all hover:shadow-xl hover:-translate-y-1"
//             >
//               {/* Image Container */}
//               <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
//                 {it.imageUrl ? (
//                   <img
//                     src={it.imageUrl}
//                     alt={name}
//                     className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
//                     loading="lazy"
//                   />
//                 ) : (
//                   <div className="h-full w-full flex items-center justify-center text-slate-300">
//                     🍽️
//                   </div>
//                 )}

//                 <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-black shadow-sm backdrop-blur">
//                   {it.price} EGP
//                 </div>

//                 {qty > 0 && (
//                   <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary font-black text-white shadow-lg animate-in zoom-in">
//                     {qty}
//                   </div>
//                 )}
//               </div>

//               {/* Content Container */}
//               <div className="flex flex-1 flex-col p-5">
//                 <h3 className="text-sm font-black text-slate-900 line-clamp-1">
//                   {name}
//                 </h3>
//                 <p className="mt-1 flex-1 text-[11px] leading-relaxed text-slate-400 line-clamp-2">
//                   {desc}
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() => addToCart(it)}
//                   className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-xs font-black text-white transition-all hover:bg-brand-primary active:scale-95"
//                 >
//                   <span>{t(lang, "add")}</span>
//                   <svg
//                     className="h-3 w-3"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                     strokeWidth={4}
//                   >
//                     <path d="M12 4v16m8-8H4" />
//                   </svg>
//                 </button>
//               </div>
//             </article>
//           );
//         })}
//       </div>

//       {filtered.length === 0 && (
//         <div className="rounded-[2rem] bg-white p-12 text-center border border-dashed border-slate-200">
//           <p className="text-sm font-bold text-slate-400">
//             No items found in this category.
//           </p>
//         </div>
//       )}
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
    const activeItems = items.filter((it) => it.isActive !== false);
    if (activeCategory === "all") return activeItems;
    return activeItems.filter((x) => x.categoryId === activeCategory);
  }, [activeCategory, items]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="h-12 w-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Preparing Menu...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="rounded-[2rem] bg-rose-50 p-8 text-center border border-rose-100">
        <p className="text-sm font-bold text-rose-600">{error}</p>
      </div>
    );

  return (
    <section className="space-y-8">
      {/* NATIVE-STYLE TAB SCROLLER */}
      <div className="sticky top-[73px] z-30 -mx-4 px-4 py-3 bg-zinc-50/80 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {safeCategories.map((c) => {
            const label = c?.name?.[lang] || c?.name?.en || c.id;
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`shrink-0 rounded-2xl px-6 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                  active
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                    : "bg-white text-zinc-400 border border-zinc-100 hover:text-zinc-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((it) => {
          const name = it?.name?.[lang] || it?.name?.en || it.id;
          const qty = cart[it.id]?.qty || 0;

          return (
            <article
              key={it.id}
              className="group relative flex flex-col bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-zinc-200/50"
            >
              {/* IMAGE AREA */}
              <div className="relative aspect-[1/1] overflow-hidden">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-50 text-zinc-200">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                {/* FLOATING PRICE TAG */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/20">
                    <span className="text-sm font-black text-zinc-900">
                      {it.price}
                    </span>
                    <span className="ml-1 text-[10px] font-bold text-zinc-500 uppercase">
                      EGP
                    </span>
                  </div>
                </div>

                {/* QUANTITY BADGE */}
                {qty > 0 && (
                  <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white font-black shadow-xl animate-in zoom-in duration-300">
                    {qty}
                  </div>
                )}
              </div>

              {/* CONTENT AREA */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1 mb-6">
                  <h3 className="text-lg font-black text-zinc-900 leading-tight mb-2 uppercase tracking-tight">
                    {name}
                  </h3>
                  {/* Category breadcrumb */}
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {safeCategories.find((c) => c.id === it.categoryId)?.name?.[
                      lang
                    ] || "Specialty"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(it)}
                  className="group/btn relative overflow-hidden w-full bg-zinc-900 text-white py-4 rounded-2xl transition-all active:scale-[0.96]"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest">
                      {t(lang, "add")}
                    </span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover/btn:rotate-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 4v16m8-8H4"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {/* Subtle hover shine */}
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[3rem] border border-dashed border-zinc-200">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-zinc-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">
            Nothing found here yet
          </p>
        </div>
      )}
    </section>
  );
}
