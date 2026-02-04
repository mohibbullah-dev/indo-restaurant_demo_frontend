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

//       {/* Categories chips */}
//       <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
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

//       {/* ✅ Grid: mobile+tablet = 2 cols, lg = 3 cols */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
//         {filtered.map((it) => {
//           const name = it?.name?.[lang] || it?.name?.en || it.id;
//           const desc = it?.desc?.[lang] || it?.desc?.en || "";
//           const inCartQty = cart[it.id]?.qty || 0;

//           return (
//             <article
//               key={it.id}
//               className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:shadow-md"
//             >
//               {/* ✅ Smaller image on small screens so 2-col fits nicely */}
//               <div className="relative h-28 w-full bg-zinc-100 sm:h-36">
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

//                 {/* Price badge (smaller on mobile) */}
//                 <div className="absolute left-2 top-2 rounded-full border border-black/10 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-900 backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
//                   {it.price} EGP
//                 </div>

//                 {/* Qty badge */}
//                 {inCartQty > 0 ? (
//                   <div className="absolute right-2 top-2 rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold text-white sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
//                     {inCartQty}
//                   </div>
//                 ) : null}
//               </div>

//               {/* ✅ Compact padding on mobile, normal on bigger screens */}
//               <div className="p-3 sm:p-5">
//                 <div className="min-w-0">
//                   <div className="truncate text-sm font-semibold sm:text-base">
//                     {name}
//                   </div>

//                   {desc ? (
//                     <div className="mt-1 line-clamp-2 text-xs text-zinc-600 sm:text-sm">
//                       {desc}
//                     </div>
//                   ) : (
//                     <div className="mt-1 text-xs text-zinc-400 sm:text-sm">
//                       &nbsp;
//                     </div>
//                   )}
//                 </div>

//                 {/* ✅ Button fits small screen nicely */}
//                 <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
//                   <button
//                     type="button"
//                     onClick={() => addToCart(it)}
//                     className="flex-1 rounded-2xl bg-black px-3 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.99] sm:px-4 sm:py-3"
//                   >
//                     {t(lang, "add")}
//                   </button>

//                   {/* Small qty hint (optional) */}
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

//       {/* Categories chips */}
//       <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
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

//       {/* ✅ FIX: 320px = 1 col, >=360px = 2 cols, lg = 3 cols */}
//       <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
//         {filtered.map((it) => {
//           const name = it?.name?.[lang] || it?.name?.en || it.id;
//           const desc = it?.desc?.[lang] || it?.desc?.en || "";
//           const inCartQty = cart[it.id]?.qty || 0;

//           return (
//             <article
//               key={it.id}
//               className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:shadow-md"
//             >
//               <div className="relative h-28 w-full bg-zinc-100 sm:h-36">
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

//                 <div className="absolute left-2 top-2 rounded-full border border-black/10 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-900 backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
//                   {it.price} EGP
//                 </div>

//                 {inCartQty > 0 ? (
//                   <div className="absolute right-2 top-2 rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold text-white sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
//                     {inCartQty}
//                   </div>
//                 ) : null}
//               </div>

//               <div className="p-3 sm:p-5">
//                 <div className="truncate text-sm font-semibold sm:text-base">
//                   {name}
//                 </div>

//                 {desc ? (
//                   <div className="mt-1 line-clamp-2 text-xs text-zinc-600 sm:text-sm">
//                     {desc}
//                   </div>
//                 ) : (
//                   <div className="mt-1 text-xs text-zinc-400 sm:text-sm">
//                     &nbsp;
//                   </div>
//                 )}

//                 <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
//                   <button
//                     type="button"
//                     onClick={() => addToCart(it)}
//                     className="flex-1 rounded-2xl bg-black px-3 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.99] sm:px-4 sm:py-3"
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
//           <div className="col-span-1 min-[360px]:col-span-2 lg:col-span-3 rounded-3xl border border-black/10 bg-white p-5 text-sm text-zinc-600">
//             No items in this category yet.
//           </div>
//         ) : null}
//       </div>
//     </section>
//   );
// }

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

//   if (loading) return <MenuSkeleton />;
//   if (error) return <MenuError error={error} />;

//   return (
//     <section className="space-y-6">
//       <div className="flex items-center justify-between sticky top-[65px] z-10 bg-zinc-50/95 py-2 backdrop-blur-sm">
//         <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
//           {safeCategories.map((c) => {
//             const label = c?.name?.[lang] || c?.name?.en || c.id;
//             const active = activeCategory === c.id;
//             return (
//               <button
//                 key={c.id}
//                 onClick={() => setActiveCategory(c.id)}
//                 className={`shrink-0 rounded-full border px-5 py-2 text-xs font-bold transition-all active:scale-95 ${
//                   active
//                     ? "bg-brand-primary border-brand-primary text-white shadow-md shadow-orange-200"
//                     : "bg-white border-black/5 text-zinc-600 hover:bg-zinc-100"
//                 }`}
//               >
//                 {label}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filtered.map((it) => {
//           const name = it?.name?.[lang] || it?.name?.en || it.id;
//           const desc = it?.desc?.[lang] || it?.desc?.en || "";
//           const inCartQty = cart[it.id]?.qty || 0;

//           return (
//             <article
//               key={it.id}
//               className="group flex flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
//             >
//               <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
//                 {it.imageUrl ? (
//                   <img
//                     src={it.imageUrl}
//                     alt={name}
//                     className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
//                     loading="lazy"
//                   />
//                 ) : (
//                   <div className="flex h-full items-center justify-center text-zinc-300">
//                     No Image
//                   </div>
//                 )}

//                 {/* Price Tag */}
//                 <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-1.5 text-sm font-bold text-zinc-900 backdrop-blur-md shadow-sm">
//                   {it.price} EGP
//                 </div>

//                 {inCartQty > 0 && (
//                   <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary font-bold text-white shadow-lg animate-in zoom-in">
//                     {inCartQty}
//                   </div>
//                 )}
//               </div>

//               <div className="flex flex-1 flex-col p-4 sm:p-5">
//                 <h3 className="text-base font-bold text-zinc-900 line-clamp-1">
//                   {name}
//                 </h3>
//                 <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500 line-clamp-2">
//                   {desc}
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() => addToCart(it)}
//                   className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3 text-sm font-bold text-white transition-all hover:bg-brand-primary active:scale-[0.97]"
//                 >
//                   <span>{t(lang, "add")}</span>
//                   <svg
//                     className="h-4 w-4"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={3}
//                       d="M12 4v16m8-8H4"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </article>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

// // Sub-components for cleaner code
// function MenuSkeleton() {
//   return (
//     <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
//       {[1, 2, 3, 4].map((i) => (
//         <div key={i} className="h-64 rounded-[2rem] bg-zinc-200" />
//       ))}
//     </div>
//   );
// }

// function MenuError({ error }) {
//   return (
//     <div className="rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center">
//       <p className="text-sm font-bold text-rose-800">Unable to load menu</p>
//       <p className="text-xs text-rose-600 mt-1">{error}</p>
//     </div>
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
