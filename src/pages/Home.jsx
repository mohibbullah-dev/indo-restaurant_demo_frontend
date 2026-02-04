// import { useEffect, useState } from "react";
// import { doc, onSnapshot } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";
// import { Link } from "react-router-dom";

// import LanguageSwitcher from "../components/LanguageSwitcher";
// import Menu from "../components/Menu";
// import CartBar from "../components/CartBar";
// import CheckoutSheet from "../components/CheckoutSheet";

// import { t } from "../i18n";
// import { db, auth } from "../firebase";
// import { useToast } from "../components/ToastProvider";

// export default function Home({
//   lang,
//   setLang,
//   categories = [],
//   items = [],
//   menuLoading = false,
//   menuError = "",
// }) {
//   const [settings, setSettings] = useState({
//     isOpen: true,
//     acceptingOrders: true,
//     timezone: "Africa/Cairo",
//     minLeadMinutes: 30,
//     restaurantWhatsAppNumber: "",
//   });

//   const toast = useToast();
//   const [adminUser, setAdminUser] = useState(null);
//   const [activeCategory, setActiveCategory] = useState("all");
//   const [cart, setCart] = useState({});
//   const [checkoutOpen, setCheckoutOpen] = useState(false);

//   // Sync Auth
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (u) => setAdminUser(u));
//     return () => unsub();
//   }, []);

//   // Sync Settings
//   useEffect(() => {
//     const ref = doc(db, "settings", "main");
//     const unsub = onSnapshot(ref, (snap) => {
//       if (snap.exists()) setSettings((prev) => ({ ...prev, ...snap.data() }));
//     });
//     return () => unsub();
//   }, []);

//   // Cart Logic
//   const addToCart = (item) => {
//     setCart((prev) => {
//       const existing = prev[item.id];
//       const qty = (existing?.qty || 0) + 1;
//       return {
//         ...prev,
//         [item.id]: { ...item, qty },
//       };
//     });
//   };

//   const clearCart = () => setCart({});
//   const cartCount = Object.values(cart).reduce((s, x) => s + x.qty, 0);
//   const total = Object.values(cart).reduce((s, x) => s + x.qty * x.price, 0);

//   const restaurantWa =
//     settings.restaurantWhatsAppNumber || settings.restaurantWa || "";
//   const canCheckout =
//     cartCount > 0 && settings.isOpen && settings.acceptingOrders;

//   const onCheckout = () => {
//     if (!canCheckout) {
//       toast.push({
//         title: t(lang, "error") || "Unavailable",
//         message: "Restaurant is not accepting orders right now.",
//         variant: "warning",
//       });
//       return;
//     }
//     setCheckoutOpen(true);
//   };

//   return (
//     <div className="min-h-screen bg-surface-50 text-slate-900 selection:bg-brand-primary/10">
//       {/* Premium Sticky Header */}
//       <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-md">
//         <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
//           <div className="flex flex-col">
//             <h1 className="text-lg font-black tracking-tight">
//               {t(lang, "brand")}
//             </h1>
//             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
//               {t(lang, "subtitle")}
//             </span>
//           </div>

//           <div className="flex items-center gap-2">
//             {adminUser && (
//               <Link
//                 to="/admin"
//                 className="hidden items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-primary sm:flex"
//               >
//                 Admin
//               </Link>
//             )}
//             <LanguageSwitcher lang={lang} setLang={setLang} />
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto max-w-6xl px-4 pb-32 pt-6">
//         <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
//           {/* Sidebar: Status & Fast Actions */}
//           <aside className="space-y-4">
//             <section
//               className={`overflow-hidden rounded-[2rem] border bg-white p-6 shadow-sm transition-all ${
//                 settings.isOpen ? "border-emerald-100" : "border-rose-100"
//               }`}
//             >
//               <div className="flex items-center gap-4">
//                 <div
//                   className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
//                     settings.isOpen
//                       ? "bg-emerald-50 text-emerald-600"
//                       : "bg-rose-50 text-rose-600"
//                   }`}
//                 >
//                   <span
//                     className={`h-3 w-3 rounded-full animate-pulse ${
//                       settings.isOpen ? "bg-emerald-500" : "bg-rose-500"
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <h2 className="text-sm font-black">
//                     {settings.isOpen ? t(lang, "open") : t(lang, "closed")}
//                   </h2>
//                   <p className="text-xs text-slate-500">
//                     {settings.isOpen
//                       ? t(lang, "openNow")
//                       : t(lang, "closedNow")}
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-6 flex flex-wrap gap-2">
//                 <div className="flex-1 rounded-2xl bg-slate-50 p-3 text-center">
//                   <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">
//                     Lead Time
//                   </p>
//                   <p className="text-xs font-black">
//                     {settings.minLeadMinutes}m
//                   </p>
//                 </div>
//                 <div className="flex-1 rounded-2xl bg-slate-50 p-3 text-center">
//                   <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">
//                     Orders
//                   </p>
//                   <p
//                     className={`text-xs font-black ${settings.acceptingOrders ? "text-emerald-600" : "text-rose-600"}`}
//                   >
//                     {settings.acceptingOrders ? "ON" : "OFF"}
//                   </p>
//                 </div>
//               </div>
//             </section>

//             <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
//               <button
//                 type="button"
//                 className="rounded-3xl bg-slate-900 py-4 text-sm font-black text-white shadow-lg shadow-slate-200 active:scale-95 transition-all"
//                 onClick={() =>
//                   document
//                     .getElementById("menuSection")
//                     ?.scrollIntoView({ behavior: "smooth" })
//                 }
//               >
//                 {t(lang, "viewMenu")}
//               </button>

//               <button
//                 type="button"
//                 onClick={onCheckout}
//                 disabled={!canCheckout}
//                 className={`rounded-3xl border py-4 text-sm font-black active:scale-95 transition-all ${
//                   canCheckout
//                     ? "border-slate-200 bg-white text-slate-900 shadow-sm"
//                     : "bg-slate-50 text-slate-300"
//                 }`}
//               >
//                 {t(lang, "checkout")}
//               </button>
//             </div>
//           </aside>

//           {/* Menu Area */}
//           <div id="menuSection" className="scroll-mt-24">
//             <Menu
//               lang={lang}
//               categories={categories}
//               items={items}
//               loading={menuLoading}
//               error={menuError}
//               activeCategory={activeCategory}
//               setActiveCategory={setActiveCategory}
//               cart={cart}
//               addToCart={addToCart}
//             />
//           </div>
//         </div>
//       </main>

//       <CartBar
//         lang={lang}
//         cartCount={cartCount}
//         total={total}
//         onClear={clearCart}
//         onCheckout={onCheckout}
//       />

//       <CheckoutSheet
//         lang={lang}
//         open={checkoutOpen}
//         onClose={() => setCheckoutOpen(false)}
//         cart={cart}
//         total={total}
//         restaurantWhatsAppNumber={restaurantWa}
//         settings={settings}
//         onOrderCreated={clearCart}
//       />
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { doc, onSnapshot } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";
// import { Link } from "react-router-dom";

// import LanguageSwitcher from "../components/LanguageSwitcher";
// import Menu from "../components/Menu";
// import CartBar from "../components/CartBar";
// import CheckoutSheet from "../components/CheckoutSheet";

// import { t } from "../i18n";
// import { db, auth } from "../firebase";
// import { useToast } from "../components/ToastProvider";

// export default function Home({
//   lang,
//   setLang,
//   categories = [],
//   items = [],
//   menuLoading = false,
//   menuError = "",
// }) {
//   const [settings, setSettings] = useState({
//     isOpen: true,
//     acceptingOrders: true,
//     timezone: "Africa/Cairo",
//     minLeadMinutes: 30,
//     restaurantWhatsAppNumber: "",
//   });

//   const toast = useToast();
//   const [adminUser, setAdminUser] = useState(null);
//   const [activeCategory, setActiveCategory] = useState("all");
//   const [cart, setCart] = useState({});
//   const [checkoutOpen, setCheckoutOpen] = useState(false);

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (u) => setAdminUser(u));
//     return () => unsub();
//   }, []);

//   useEffect(() => {
//     const ref = doc(db, "settings", "main");
//     const unsub = onSnapshot(ref, (snap) => {
//       if (snap.exists()) setSettings((prev) => ({ ...prev, ...snap.data() }));
//     });
//     return () => unsub();
//   }, []);

//   const addToCart = (item) => {
//     setCart((prev) => {
//       const existing = prev[item.id];
//       const qty = (existing?.qty || 0) + 1;
//       return { ...prev, [item.id]: { ...item, qty } };
//     });
//   };

//   const clearCart = () => setCart({});
//   const cartCount = Object.values(cart).reduce((s, x) => s + x.qty, 0);
//   const total = Object.values(cart).reduce((s, x) => s + x.qty * x.price, 0);

//   const restaurantWa =
//     settings.restaurantWhatsAppNumber || settings.restaurantWa || "";
//   const canCheckout =
//     cartCount > 0 && settings.isOpen && settings.acceptingOrders;

//   const onCheckout = () => {
//     if (!canCheckout) {
//       toast.push({
//         title: t(lang, "error") || "Unavailable",
//         message: "Restaurant is not accepting orders right now.",
//         variant: "warning",
//       });
//       return;
//     }
//     setCheckoutOpen(true);
//   };

//   return (
//     <div className="min-h-screen bg-zinc-50 font-sans selection:bg-black/5">
//       {/* NATIVE-STYLE HEADER */}
//       <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-zinc-100 px-5 py-4">
//         <div className="mx-auto flex max-w-6xl items-center justify-between">
//           <div className="flex flex-col">
//             <h1 className="text-xl font-black leading-tight tracking-tight text-zinc-900">
//               {t(lang, "brand")}
//             </h1>
//             <div className="flex items-center gap-1.5">
//               <span
//                 className={`h-1.5 w-1.5 rounded-full ${settings.isOpen ? "bg-emerald-500" : "bg-rose-500"}`}
//               />
//               <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">
//                 {settings.isOpen ? t(lang, "openNow") : t(lang, "closedNow")}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             {adminUser && (
//               <Link
//                 to="/admin"
//                 className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-transform active:scale-90"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2.5"
//                     d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2.5"
//                     d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                   />
//                 </svg>
//               </Link>
//             )}
//             <LanguageSwitcher lang={lang} setLang={setLang} />
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto max-w-6xl px-4 pb-40 pt-6">
//         <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
//           {/* QUICK INFO BAR - Reimagined as a "Control Center" */}
//           <aside className="space-y-4">
//             <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-zinc-100">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
//                     Preparation
//                   </p>
//                   <div className="flex items-baseline gap-1">
//                     <span className="text-xl font-black text-zinc-900">
//                       {settings.minLeadMinutes}
//                     </span>
//                     <span className="text-xs font-bold text-zinc-500">min</span>
//                   </div>
//                 </div>
//                 <div className="space-y-1 text-right">
//                   <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
//                     Status
//                   </p>
//                   <p
//                     className={`text-sm font-black ${settings.acceptingOrders ? "text-emerald-500" : "text-rose-500"}`}
//                   >
//                     {settings.acceptingOrders ? "Live" : "Busy"}
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-6 pt-6 border-t border-zinc-50">
//                 <button
//                   onClick={() =>
//                     document
//                       .getElementById("menuSection")
//                       ?.scrollIntoView({ behavior: "smooth" })
//                   }
//                   className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-4 rounded-[1.5rem] text-sm font-black transition-all active:scale-[0.97]"
//                 >
//                   {t(lang, "viewMenu")}
//                 </button>
//               </div>
//             </div>

//             {/* PROMO / ALERT (Optional) */}
//             {!settings.acceptingOrders && (
//               <div className="bg-rose-50 rounded-[2rem] p-5 border border-rose-100 text-center">
//                 <p className="text-xs font-bold text-rose-700">
//                   We're currently overwhelmed with orders. Please check back
//                   shortly!
//                 </p>
//               </div>
//             )}
//           </aside>

//           {/* MENU AREA */}
//           <div id="menuSection" className="scroll-mt-28">
//             <Menu
//               lang={lang}
//               categories={categories}
//               items={items}
//               loading={menuLoading}
//               error={menuError}
//               activeCategory={activeCategory}
//               setActiveCategory={setActiveCategory}
//               cart={cart}
//               addToCart={addToCart}
//             />
//           </div>
//         </div>
//       </main>

//       {/* FIXED BOTTOM COMPONENTS */}
//       <CartBar
//         lang={lang}
//         cartCount={cartCount}
//         total={total}
//         onClear={clearCart}
//         onCheckout={onCheckout}
//       />

//       <CheckoutSheet
//         lang={lang}
//         open={checkoutOpen}
//         onClose={() => setCheckoutOpen(false)}
//         cart={cart}
//         total={total}
//         restaurantWhatsAppNumber={restaurantWa}
//         settings={settings}
//         onOrderCreated={clearCart}
//       />
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

import LanguageSwitcher from "../components/LanguageSwitcher";
import Menu from "../components/Menu";
import CartBar from "../components/CartBar";
import CheckoutSheet from "../components/CheckoutSheet";

import { t } from "../i18n";
import { db, auth } from "../firebase";
import { useToast } from "../components/ToastProvider";

export default function Home({
  lang,
  setLang,
  categories = [],
  items = [],
  menuLoading = false,
  menuError = "",
}) {
  const [settings, setSettings] = useState({
    isOpen: true,
    acceptingOrders: true,
    timezone: "Africa/Cairo",
    minLeadMinutes: 30,
    restaurantWhatsAppNumber: "",
  });

  const toast = useToast();
  const [adminUser, setAdminUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAdminUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const ref = doc(db, "settings", "main");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setSettings((prev) => ({ ...prev, ...snap.data() }));
    });
    return () => unsub();
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const qty = (existing?.qty || 0) + 1;
      return { ...prev, [item.id]: { ...item, qty } };
    });
  };

  const clearCart = () => setCart({});
  const cartCount = Object.values(cart).reduce((s, x) => s + x.qty, 0);
  const total = Object.values(cart).reduce((s, x) => s + x.qty * x.price, 0);

  const restaurantWa =
    settings.restaurantWhatsAppNumber || settings.restaurantWa || "";
  const canCheckout =
    cartCount > 0 && settings.isOpen && settings.acceptingOrders;

  const onCheckout = () => {
    if (!canCheckout) {
      toast.push({
        title: t(lang, "error") || "Unavailable",
        message: "Restaurant is not accepting orders right now.",
        variant: "warning",
      });
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* APP HEADER */}
      <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tighter uppercase sm:text-xl">
              {t(lang, "brand")}
            </h1>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${settings.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {settings.isOpen ? t(lang, "openNow") : t(lang, "closedNow")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {adminUser && (
              <Link
                to="/admin"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white active:scale-90 transition-transform"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
            )}
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 pb-32 pt-6 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* SIDEBAR WIDGET */}
          <aside className="w-full shrink-0 lg:w-72">
            <div className="rounded-[2rem] border border-zinc-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Lead Time
                  </p>
                  <p className="text-lg font-black">
                    {settings.minLeadMinutes}m
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Ordering
                  </p>
                  <p
                    className={`text-sm font-black ${settings.acceptingOrders ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {settings.acceptingOrders ? "ACTIVE" : "BUSY"}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  document
                    .getElementById("menuSection")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="mt-4 w-full rounded-2xl bg-zinc-50 py-3 text-xs font-black uppercase tracking-widest text-zinc-900 transition-colors hover:bg-zinc-100 active:scale-95"
              >
                {t(lang, "viewMenu")}
              </button>
            </div>
          </aside>

          {/* MENU GRID AREA */}
          <div id="menuSection" className="flex-1 scroll-mt-24">
            <Menu
              lang={lang}
              categories={categories}
              items={items}
              loading={menuLoading}
              error={menuError}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              cart={cart}
              addToCart={addToCart}
            />
          </div>
        </div>
      </main>

      <CartBar
        lang={lang}
        cartCount={cartCount}
        total={total}
        onClear={clearCart}
        onCheckout={onCheckout}
      />
      <CheckoutSheet
        lang={lang}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        total={total}
        restaurantWhatsAppNumber={restaurantWa}
        settings={settings}
        onOrderCreated={clearCart}
      />
    </div>
  );
}
