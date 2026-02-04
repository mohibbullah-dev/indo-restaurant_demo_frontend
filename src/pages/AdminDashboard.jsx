// import { useEffect, useMemo, useRef, useState } from "react";
// import { signOut } from "firebase/auth";
// import { auth, db } from "../firebase";
// import {
//   collection,
//   doc,
//   limit,
//   onSnapshot,
//   orderBy,
//   query,
//   updateDoc,
// } from "firebase/firestore";
// import { t } from "../i18n";
// import LanguageSwitcher from "../components/LanguageSwitcher";
// import { useToast } from "../components/ToastProvider";
// import AdminMenu from "./AdminMenu";
// import { Link } from "react-router-dom";

// function StatusLabel({ status, lang }) {
//   const map = {
//     pending: t(lang, "pending"),
//     preparing: t(lang, "preparing"),
//     ready: t(lang, "ready"),
//     cancelled: t(lang, "cancelled"),
//   };
//   return map[status] || status || "—";
// }

// function beep() {
//   // No file needed; works on modern browsers
//   try {
//     const ctx = new (window.AudioContext || window.webkitAudioContext)();
//     const o = ctx.createOscillator();
//     const g = ctx.createGain();
//     o.type = "sine";
//     o.frequency.value = 880;
//     g.gain.value = 0.05;
//     o.connect(g);
//     g.connect(ctx.destination);
//     o.start();
//     setTimeout(() => {
//       o.stop();
//       ctx.close?.();
//     }, 140);
//   } catch {
//     // ignore
//   }
// }

// function buildWaLink(phone, text) {
//   if (!phone) return null;
//   const safe = encodeURIComponent(text);
//   return `https://wa.me/${phone}?text=${safe}`;
// }

// export default function AdminDashboard({ lang, setLang }) {
//   const [tab, setTab] = useState("orders"); // orders | settings
//   const [filter, setFilter] = useState("all"); // all|pending|preparing|ready|cancelled
//   const [orders, setOrders] = useState([]);
//   const [settings, setSettings] = useState({
//     isOpen: true,
//     acceptingOrders: true,
//   });
//   const toast = useToast();

//   const [selectedId, setSelectedId] = useState(null);

//   const prevIdsRef = useRef(new Set());
//   const firstLoadRef = useRef(true);

//   // Live settings
//   useEffect(() => {
//     const ref = doc(db, "settings", "main");
//     return onSnapshot(ref, (snap) => {
//       if (snap.exists()) setSettings((p) => ({ ...p, ...snap.data() }));
//     });
//   }, []);

//   // Live orders (admin only)
//   useEffect(() => {
//     const q = query(
//       collection(db, "orders"),
//       orderBy("createdAt", "desc"),
//       limit(80),
//     );
//     return onSnapshot(q, (snap) => {
//       const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setOrders(list);

//       // Sound notification for NEW orders (only after first load)
//       const currentIds = new Set(list.map((x) => x.id));
//       if (firstLoadRef.current) {
//         prevIdsRef.current = currentIds;
//         firstLoadRef.current = false;
//         return;
//       }

//       let hasNewPending = false;
//       for (const o of list) {
//         if (!prevIdsRef.current.has(o.id) && o.status === "pending") {
//           hasNewPending = true;

//           break;
//         }
//       }
//       prevIdsRef.current = currentIds;
//       if (hasNewPending) {
//         beep();
//         toast.push({
//           title: t(lang, "newOrder"),
//           message: "New pending order arrived.",
//           variant: "success",
//           actionLabel: "Open orders",
//           onAction: () => {
//             setTab("orders");
//             setSelectedId(null);
//           },
//         });
//       }
//     });
//   }, []);

//   const setOrderStatus = async (id, status) => {
//     await updateDoc(doc(db, "orders", id), { status });
//     toast.push({
//       title: "Status updated",
//       message: `Order ${id} → ${status}`,
//       variant: "default",
//     });
//   };

//   const toggleSetting = async (key) => {
//     const ref = doc(db, "settings", "main");
//     await updateDoc(ref, { [key]: !settings[key] });
//   };

//   const filteredOrders = useMemo(() => {
//     if (filter === "all") return orders;
//     return orders.filter((o) => o.status === filter);
//   }, [orders, filter]);

//   const selectedOrder = useMemo(() => {
//     return orders.find((o) => o.id === selectedId) || null;
//   }, [orders, selectedId]);

//   const closeDetails = () => setSelectedId(null);

//   const replyLink = useMemo(() => {
//     const phone = selectedOrder?.customer?.whatsapp;
//     if (!phone) return null;

//     const items = (selectedOrder.items || [])
//       .map(
//         (it) =>
//           `- ${it?.name?.en || it.id} x${it.qty} = ${it.qty * it.price} EGP`,
//       )
//       .join("\n");

//     const track =
//       selectedOrder.trackUrl ||
//       `${window.location.origin}/order/${selectedOrder.id}`;

//     const msg =
//       `✅ Update for your order\n` +
//       `Order ID: ${selectedOrder.id}\n` +
//       `Status: ${selectedOrder.status}\n` +
//       `Time: ${selectedOrder?.scheduled?.date || ""} ${selectedOrder?.scheduled?.time || ""}\n\n` +
//       `Items:\n${items}\n\n` +
//       `Total: ${selectedOrder.total} EGP\n\n` +
//       `Track/Cancel: ${track}`;

//     return buildWaLink(phone, msg);
//   }, [selectedOrder]);

//   return (
//     <div className="min-h-dvh bg-zinc-50 text-zinc-900">
//       {/* Top bar */}
//       <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur">
//         <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 py-3 sm:px-4">
//           <div className="flex items-center gap-3">
//             <div className="text-base font-semibold">{t(lang, "admin")}</div>

//             {/* Desktop tabs */}
//             <div className="hidden md:flex items-center gap-2 rounded-full border border-black/10 bg-white/70 p-1">
//               <button
//                 type="button"
//                 onClick={() => setTab("orders")}
//                 className={[
//                   "rounded-full px-4 py-2 text-sm font-semibold",
//                   tab === "orders"
//                     ? "bg-black text-white"
//                     : "text-zinc-700 hover:bg-black/5",
//                 ].join(" ")}
//               >
//                 {t(lang, "orders")}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => setTab("menu")}
//                 className={[
//                   "rounded-full px-4 py-2 text-sm font-semibold",
//                   tab === "menu"
//                     ? "bg-black text-white"
//                     : "bg-black/10 text-zinc-800",
//                 ].join(" ")}
//               >
//                 Menu
//               </button>

//               <button
//                 type="button"
//                 onClick={() => setTab("settings")}
//                 className={[
//                   "rounded-full px-4 py-2 text-sm font-semibold",
//                   tab === "settings"
//                     ? "bg-black text-white"
//                     : "text-zinc-700 hover:bg-black/5",
//                 ].join(" ")}
//               >
//                 {t(lang, "settings")}
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             {/* Back to Home */}
//             <Link
//               to="/"
//               className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-black/5 active:scale-[0.98]"
//             >
//               Home
//             </Link>

//             <LanguageSwitcher lang={lang} setLang={setLang} />

//             <button
//               type="button"
//               onClick={() => signOut(auth)}
//               className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
//             >
//               {t(lang, "signOut")}
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto w-full max-w-6xl px-3 pb-24 pt-4 sm:px-4">
//         <div className="grid gap-4 md:grid-cols-[280px_1fr]">
//           {/* Sidebar (desktop/tablet) */}
//           <aside className="hidden md:block space-y-3">
//             <div className="rounded-3xl border border-black/10 bg-white p-4">
//               <div className="text-sm font-semibold">{t(lang, "settings")}</div>
//               <div className="mt-3 space-y-3">
//                 <button
//                   type="button"
//                   onClick={() => toggleSetting("isOpen")}
//                   className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold active:scale-[0.99]"
//                 >
//                   <span>{t(lang, "openStatus")}</span>
//                   <span className="text-xs text-zinc-600">
//                     {settings.isOpen ? t(lang, "open") : t(lang, "closed")}
//                   </span>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => toggleSetting("acceptingOrders")}
//                   className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold active:scale-[0.99]"
//                 >
//                   <span>{t(lang, "acceptingOrders")}</span>
//                   <span className="text-xs text-zinc-600">
//                     {settings.acceptingOrders ? "ON" : "OFF"}
//                   </span>
//                 </button>
//               </div>
//             </div>

//             <div className="rounded-3xl border border-black/10 bg-white p-4">
//               <div className="text-sm font-semibold">{t(lang, "filter")}</div>
//               <div className="mt-3 grid gap-2">
//                 {["all", "pending", "preparing", "ready", "cancelled"].map(
//                   (k) => (
//                     <button
//                       key={k}
//                       type="button"
//                       onClick={() => setFilter(k)}
//                       className={[
//                         "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold active:scale-[0.99]",
//                         filter === k
//                           ? "bg-black text-white border-black"
//                           : "bg-white border-black/10 text-zinc-800",
//                       ].join(" ")}
//                     >
//                       <span>
//                         {k === "all" ? (
//                           t(lang, "allOrders")
//                         ) : (
//                           <StatusLabel status={k} lang={lang} />
//                         )}
//                       </span>
//                       <span
//                         className={
//                           filter === k
//                             ? "text-white/80 text-xs"
//                             : "text-zinc-500 text-xs"
//                         }
//                       >
//                         {k === "all"
//                           ? orders.length
//                           : orders.filter((o) => o.status === k).length}
//                       </span>
//                     </button>
//                   ),
//                 )}
//               </div>
//             </div>
//           </aside>

//           {/* Main */}
//           <section className="space-y-4">
//             {tab === "settings" ? (
//               <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
//                 <div className="text-sm font-semibold">
//                   {t(lang, "settings")}
//                 </div>
//                 <div className="mt-3 grid gap-3 sm:grid-cols-2">
//                   <button
//                     type="button"
//                     onClick={() => toggleSetting("isOpen")}
//                     className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold active:scale-[0.99]"
//                   >
//                     <span>{t(lang, "openStatus")}</span>
//                     <span className="text-xs text-zinc-600">
//                       {settings.isOpen ? t(lang, "open") : t(lang, "closed")}
//                     </span>
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => toggleSetting("acceptingOrders")}
//                     className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold active:scale-[0.99]"
//                   >
//                     <span>{t(lang, "acceptingOrders")}</span>
//                     <span className="text-xs text-zinc-600">
//                       {settings.acceptingOrders ? "ON" : "OFF"}
//                     </span>
//                   </button>
//                 </div>
//               </div>
//             ) : tab === "menu" ? (
//               <AdminMenu lang={lang} />
//             ) : (
//               <>
//                 {/* Mobile filter chips */}
//                 <div className="md:hidden rounded-3xl border border-black/10 bg-white p-3">
//                   <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
//                     {["all", "pending", "preparing", "ready", "cancelled"].map(
//                       (k) => (
//                         <button
//                           key={k}
//                           type="button"
//                           onClick={() => setFilter(k)}
//                           className={[
//                             "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold active:scale-[0.98]",
//                             filter === k
//                               ? "bg-black text-white border-black"
//                               : "bg-white border-black/10 text-zinc-700",
//                           ].join(" ")}
//                         >
//                           {k === "all" ? (
//                             t(lang, "allOrders")
//                           ) : (
//                             <StatusLabel status={k} lang={lang} />
//                           )}
//                         </button>
//                       ),
//                     )}
//                   </div>
//                 </div>

//                 {/* Orders list */}
//                 <div className="space-y-3">
//                   {filteredOrders.length === 0 ? (
//                     <div className="rounded-3xl border border-black/10 bg-white p-4 text-sm">
//                       {t(lang, "noOrders")}
//                     </div>
//                   ) : (
//                     filteredOrders.map((o) => (
//                       <button
//                         key={o.id}
//                         type="button"
//                         onClick={() => setSelectedId(o.id)}
//                         className="w-full text-left rounded-3xl border border-black/10 bg-white p-4 shadow-sm active:scale-[0.995]"
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="min-w-0">
//                             <div className="font-mono text-xs text-zinc-500">
//                               {o.id}
//                             </div>
//                             <div className="mt-1 text-sm font-semibold">
//                               {o?.customer?.name || "—"}
//                             </div>
//                             <div className="mt-1 text-xs text-zinc-600">
//                               {o?.scheduled?.date} • {o?.scheduled?.time} •{" "}
//                               {o.total} EGP
//                             </div>
//                           </div>
//                           <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold">
//                             <StatusLabel status={o.status} lang={lang} />
//                           </span>
//                         </div>
//                       </button>
//                     ))
//                   )}
//                 </div>
//               </>
//             )}
//           </section>
//         </div>
//       </main>

//       {/* Mobile bottom nav */}
//       <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-white/90 backdrop-blur md:hidden">
//         <div className="mx-auto flex w-full max-w-6xl items-center justify-around px-3 py-2">
//           <button
//             type="button"
//             onClick={() => setTab("orders")}
//             className={[
//               "rounded-full px-4 py-2 text-sm font-semibold",
//               tab === "orders" ? "bg-black text-white" : "text-zinc-700",
//             ].join(" ")}
//           >
//             {t(lang, "orders")}
//           </button>

//           <button
//             type="button"
//             onClick={() => setTab("menu")}
//             className={[
//               "rounded-full px-4 py-2 text-sm font-semibold",
//               tab === "menu" ? "bg-black text-white" : "text-zinc-700",
//             ].join(" ")}
//           >
//             Menu
//           </button>

//           <button
//             type="button"
//             onClick={() => setTab("settings")}
//             className={[
//               "rounded-full px-4 py-2 text-sm font-semibold",
//               tab === "settings" ? "bg-black text-white" : "text-zinc-700",
//             ].join(" ")}
//           >
//             {t(lang, "settings")}
//           </button>
//         </div>
//       </nav>

//       {/* Details panel (drawer on mobile, side panel on desktop) */}
//       {selectedOrder ? (
//         <div className="fixed inset-0 z-40">
//           <button
//             type="button"
//             onClick={closeDetails}
//             className="absolute inset-0 bg-black/30"
//             aria-label="Close details"
//           />

//           <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-0 md:right-0 md:left-auto md:h-full md:w-[min(420px,100vw)]">
//             <div className="h-full rounded-t-3xl md:rounded-none md:rounded-l-3xl border border-black/10 bg-white shadow-xl">
//               <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
//                 <div className="text-sm font-semibold">
//                   {t(lang, "orderDetails")}
//                 </div>
//                 <button
//                   type="button"
//                   onClick={closeDetails}
//                   className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
//                 >
//                   Close
//                 </button>
//               </div>

//               <div className="p-4 space-y-4 overflow-auto max-h-[75vh] md:max-h-none md:h-[calc(100%-56px)]">
//                 <div className="rounded-3xl border border-black/10 bg-zinc-50 p-3">
//                   <div className="font-mono text-xs text-zinc-500">
//                     {selectedOrder.id}
//                   </div>
//                   <div className="mt-1 text-sm font-semibold">
//                     {selectedOrder?.customer?.name || "—"}
//                   </div>
//                   <div className="mt-1 text-xs text-zinc-600">
//                     {selectedOrder?.scheduled?.date} •{" "}
//                     {selectedOrder?.scheduled?.time}
//                   </div>
//                   <div className="mt-2 flex items-center justify-between">
//                     <span className="text-xs text-zinc-500">Status</span>
//                     <span className="text-xs font-semibold">
//                       <StatusLabel status={selectedOrder.status} lang={lang} />
//                     </span>
//                   </div>
//                 </div>

//                 <div className="rounded-3xl border border-black/10 bg-white p-3">
//                   <div className="text-sm font-semibold">Items</div>
//                   <div className="mt-2 space-y-2">
//                     {(selectedOrder.items || []).map((it, idx) => (
//                       <div
//                         key={`${it.id}-${idx}`}
//                         className="flex items-center justify-between rounded-2xl border border-black/5 bg-zinc-50 px-3 py-2 text-sm"
//                       >
//                         <div className="min-w-0">
//                           <div className="truncate font-semibold">
//                             {it?.name?.en || it.id}
//                           </div>
//                           <div className="text-xs text-zinc-500">
//                             Qty: {it.qty} • {it.price} EGP
//                           </div>
//                         </div>
//                         <div className="font-semibold">
//                           {it.qty * it.price} EGP
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
//                     <div className="text-sm font-semibold">
//                       {t(lang, "total")}
//                     </div>
//                     <div className="text-sm font-semibold">
//                       {selectedOrder.total} EGP
//                     </div>
//                   </div>
//                 </div>

//                 <div className="rounded-3xl border border-black/10 bg-white p-3">
//                   <div className="text-sm font-semibold">
//                     {t(lang, "markAs")}
//                   </div>
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {["pending", "preparing", "ready", "cancelled"].map((s) => (
//                       <button
//                         key={s}
//                         type="button"
//                         onClick={() => setOrderStatus(selectedOrder.id, s)}
//                         className={[
//                           "rounded-full px-3 py-2 text-xs font-semibold active:scale-[0.98] border",
//                           s === "cancelled"
//                             ? "border-rose-200 bg-rose-50 text-rose-900"
//                             : "border-black/10 bg-white text-zinc-800",
//                         ].join(" ")}
//                       >
//                         <StatusLabel status={s} lang={lang} />
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="rounded-3xl border border-black/10 bg-white p-3">
//                   <div className="text-sm font-semibold">
//                     {t(lang, "replyCustomer")}
//                   </div>
//                   <div className="mt-1 text-xs text-zinc-500">
//                     {selectedOrder?.customer?.whatsapp
//                       ? selectedOrder.customer.whatsapp
//                       : "No customer WhatsApp saved in this order."}
//                   </div>

//                   <button
//                     type="button"
//                     disabled={!replyLink}
//                     onClick={() =>
//                       replyLink &&
//                       window.open(replyLink, "_blank", "noopener,noreferrer")
//                     }
//                     className={[
//                       "mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold active:scale-[0.99]",
//                       replyLink
//                         ? "bg-black text-white"
//                         : "bg-black/20 text-white/70",
//                     ].join(" ")}
//                   >
//                     {t(lang, "openWhatsApp")}
//                   </button>

//                   <button
//                     type="button"
//                     disabled={!replyLink || selectedOrder.status !== "ready"}
//                     onClick={() =>
//                       replyLink &&
//                       window.open(replyLink, "_blank", "noopener,noreferrer")
//                     }
//                     className={[
//                       "mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold active:scale-[0.99]",
//                       replyLink && selectedOrder.status === "ready"
//                         ? "bg-emerald-600 text-white"
//                         : "bg-emerald-600/20 text-white/70",
//                     ].join(" ")}
//                   >
//                     Notify customer (Ready)
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { t } from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useToast } from "../components/ToastProvider";
import AdminMenu from "./AdminMenu";
import { Link } from "react-router-dom";

// Icons for a professional look
const OrderIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);
const MenuIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M4 6h16M4 12h16M4 18h7"
    />
  </svg>
);
const SettingsIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

function StatusLabel({ status, lang }) {
  const map = {
    pending: t(lang, "pending"),
    preparing: t(lang, "preparing"),
    ready: t(lang, "ready"),
    cancelled: t(lang, "cancelled"),
  };
  return map[status] || status || "—";
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close?.();
    }, 140);
  } catch {
    /* ignore */
  }
}

function buildWaLink(phone, text) {
  if (!phone) return null;
  const safe = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${safe}`;
}

export default function AdminDashboard({ lang, setLang }) {
  const [tab, setTab] = useState("orders");
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    isOpen: true,
    acceptingOrders: true,
  });
  const toast = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const prevIdsRef = useRef(new Set());
  const firstLoadRef = useRef(true);

  useEffect(() => {
    const ref = doc(db, "settings", "main");
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setSettings((p) => ({ ...p, ...snap.data() }));
    });
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(80),
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);

      const currentIds = new Set(list.map((x) => x.id));
      if (firstLoadRef.current) {
        prevIdsRef.current = currentIds;
        firstLoadRef.current = false;
        return;
      }

      let hasNewPending = false;
      for (const o of list) {
        if (!prevIdsRef.current.has(o.id) && o.status === "pending") {
          hasNewPending = true;
          break;
        }
      }
      prevIdsRef.current = currentIds;
      if (hasNewPending) {
        beep();
        toast.push({
          title: t(lang, "newOrder"),
          message: "New pending order arrived.",
          variant: "success",
          onAction: () => {
            setTab("orders");
            setSelectedId(null);
          },
        });
      }
    });
  }, []);

  const setOrderStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
    toast.push({
      title: "Status updated",
      message: `Order → ${status}`,
      variant: "default",
    });
  };

  const toggleSetting = async (key) => {
    const ref = doc(db, "settings", "main");
    await updateDoc(ref, { [key]: !settings[key] });
  };

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedId) || null;
  }, [orders, selectedId]);

  const closeDetails = () => setSelectedId(null);

  const replyLink = useMemo(() => {
    const phone = selectedOrder?.customer?.whatsapp;
    if (!phone) return null;
    const items = (selectedOrder.items || [])
      .map(
        (it) =>
          `- ${it?.name?.en || it.id} x${it.qty} = ${it.qty * it.price} EGP`,
      )
      .join("\n");
    const track =
      selectedOrder.trackUrl ||
      `${window.location.origin}/order/${selectedOrder.id}`;
    const msg = `✅ Update for your order\nOrder ID: ${selectedOrder.id}\nStatus: ${selectedOrder.status}\nTime: ${selectedOrder?.scheduled?.date || ""} ${selectedOrder?.scheduled?.time || ""}\n\nItems:\n${items}\n\nTotal: ${selectedOrder.total} EGP\n\nTrack/Cancel: ${track}`;
    return buildWaLink(phone, msg);
  }, [selectedOrder]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">
              Dashboard
            </h1>

            {/* Desktop Tabs */}
            <nav className="hidden md:flex bg-slate-100 p-1 rounded-2xl">
              {[
                { id: "orders", label: t(lang, "orders"), icon: <OrderIcon /> },
                { id: "menu", label: "Menu", icon: <MenuIcon /> },
                {
                  id: "settings",
                  label: t(lang, "settings"),
                  icon: <SettingsIcon />,
                },
              ].map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => setTab(tItem.id)}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-black rounded-xl transition-all ${
                    tab === tItem.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tItem.icon}
                  {tItem.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              Home
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block mx-2" />
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <button
              onClick={() => signOut(auth)}
              className="ml-2 p-2 px-4 rounded-xl bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-tight hover:bg-rose-100 transition-all"
            >
              {t(lang, "signOut")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">
                Store Controls
              </h3>
              <div className="space-y-3">
                {[
                  {
                    key: "isOpen",
                    label: t(lang, "openStatus"),
                    val: settings.isOpen ? t(lang, "open") : t(lang, "closed"),
                  },
                  {
                    key: "acceptingOrders",
                    label: t(lang, "acceptingOrders"),
                    val: settings.acceptingOrders ? "ON" : "OFF",
                  },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => toggleSetting(s.key)}
                    className="group w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all active:scale-[0.98]"
                  >
                    <span className="text-sm font-black text-slate-700">
                      {s.label}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-lg ${s.val === "OFF" || s.val === "Closed" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}
                    >
                      {s.val}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">
                Filter by Status
              </h3>
              <div className="grid gap-2">
                {["all", "pending", "preparing", "ready", "cancelled"].map(
                  (k) => (
                    <button
                      key={k}
                      onClick={() => setFilter(k)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-black transition-all active:scale-[0.98] ${
                        filter === k
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>
                        {k === "all" ? (
                          t(lang, "allOrders")
                        ) : (
                          <StatusLabel status={k} lang={lang} />
                        )}
                      </span>
                      <span className="text-[10px] opacity-60">
                        {k === "all"
                          ? orders.length
                          : orders.filter((o) => o.status === k).length}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <section className="min-h-[60vh]">
            {tab === "settings" ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight mb-8">
                  Store Settings
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Mobile version of side controls */}
                  <button
                    onClick={() => toggleSetting("isOpen")}
                    className="flex flex-col gap-1 p-6 rounded-3xl bg-slate-50 border-2 border-transparent hover:border-slate-900 transition-all text-left"
                  >
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {t(lang, "openStatus")}
                    </span>
                    <span className="text-xl font-black">
                      {settings.isOpen ? t(lang, "open") : t(lang, "closed")}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleSetting("acceptingOrders")}
                    className="flex flex-col gap-1 p-6 rounded-3xl bg-slate-50 border-2 border-transparent hover:border-slate-900 transition-all text-left"
                  >
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {t(lang, "acceptingOrders")}
                    </span>
                    <span className="text-xl font-black">
                      {settings.acceptingOrders ? "Active" : "Paused"}
                    </span>
                  </button>
                </div>
              </div>
            ) : tab === "menu" ? (
              <AdminMenu lang={lang} />
            ) : (
              <div className="space-y-4">
                {/* Mobile Filter Scroll */}
                <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {["all", "pending", "preparing", "ready", "cancelled"].map(
                    (k) => (
                      <button
                        key={k}
                        onClick={() => setFilter(k)}
                        className={`shrink-0 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-tight transition-all ${
                          filter === k
                            ? "bg-slate-900 text-white shadow-lg"
                            : "bg-white border border-slate-200 text-slate-600"
                        }`}
                      >
                        {k === "all" ? (
                          t(lang, "allOrders")
                        ) : (
                          <StatusLabel status={k} lang={lang} />
                        )}
                      </button>
                    ),
                  )}
                </div>

                {/* Orders List */}
                <div className="grid gap-3">
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
                      {t(lang, "noOrders")}
                    </div>
                  ) : (
                    filteredOrders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedId(o.id)}
                        className="group w-full text-left bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black font-mono text-slate-400">
                                #{o.id.slice(-6).toUpperCase()}
                              </span>
                              <span
                                className={`h-2 w-2 rounded-full ${o.status === "pending" ? "bg-amber-400 animate-pulse" : "bg-slate-200"}`}
                              />
                            </div>
                            <h4 className="text-lg font-black text-slate-900">
                              {o?.customer?.name || "Anonymous"}
                            </h4>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">
                              {o?.scheduled?.date} • {o?.scheduled?.time} •{" "}
                              <span className="text-slate-900">
                                {o.total} EGP
                              </span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                o.status === "pending"
                                  ? "bg-amber-50 border-amber-200 text-amber-700"
                                  : o.status === "ready"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : o.status === "cancelled"
                                      ? "bg-rose-50 border-rose-200 text-rose-700"
                                      : "bg-slate-50 border-slate-200 text-slate-600"
                              }`}
                            >
                              <StatusLabel status={o.status} lang={lang} />
                            </span>
                            <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-900 transition-colors">
                              Details →
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/80 backdrop-blur-2xl border-t border-slate-100 pb-safe">
        <div className="flex items-center justify-around p-4">
          {[
            { id: "orders", label: "Orders", icon: <OrderIcon /> },
            { id: "menu", label: "Menu", icon: <MenuIcon /> },
            { id: "settings", label: "Setup", icon: <SettingsIcon /> },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setTab(b.id)}
              className={`flex flex-col items-center gap-1 transition-all ${tab === b.id ? "text-slate-900 scale-110" : "text-slate-400"}`}
            >
              <div
                className={`p-2 rounded-xl ${tab === b.id ? "bg-slate-100" : ""}`}
              >
                {b.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {b.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Details Side-Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-end overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeDetails}
          />

          <div className="relative w-full md:w-[480px] h-[90vh] md:h-full bg-white rounded-t-[3rem] md:rounded-l-[3rem] md:rounded-tr-none shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black font-mono text-slate-400">
                  ORDER DETAILS
                </span>
                <h2 className="text-xl font-black tracking-tight">
                  {selectedOrder.customer?.name}
                </h2>
              </div>
              <button
                onClick={closeDetails}
                className="p-3 bg-slate-100 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all"
              >
                CLOSE
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Order ID
                  </span>
                  <span className="text-xs font-mono font-bold">
                    {selectedOrder.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Schedule
                  </span>
                  <span className="text-xs font-black">
                    {selectedOrder?.scheduled?.date} at{" "}
                    {selectedOrder?.scheduled?.time}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
                  Order Items
                </h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div
                      key={`${it.id}-${idx}`}
                      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                    >
                      <div>
                        <div className="font-black text-sm">
                          {it?.name?.en || it.id}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">
                          QTY {it.qty} × {it.price} EGP
                        </div>
                      </div>
                      <div className="font-black text-sm">
                        {it.qty * it.price} EGP
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center px-2">
                  <span className="text-lg font-black">Total</span>
                  <span className="text-2xl font-black tracking-tighter text-slate-900">
                    {selectedOrder.total} EGP
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
                  Update Status
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {["pending", "preparing", "ready", "cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setOrderStatus(selectedOrder.id, s)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        selectedOrder.status === s
                          ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                          : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <StatusLabel status={s} lang={lang} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pb-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
                  Customer Contact
                </h4>
                <button
                  disabled={!replyLink}
                  onClick={() => replyLink && window.open(replyLink, "_blank")}
                  className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] ${
                    replyLink
                      ? "bg-emerald-600 text-white shadow-xl shadow-emerald-100"
                      : "bg-slate-100 text-slate-300"
                  }`}
                >
                  Send Status via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
