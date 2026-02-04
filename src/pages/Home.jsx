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

  // Sync Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAdminUser(u));
    return () => unsub();
  }, []);

  // Sync Settings
  useEffect(() => {
    const ref = doc(db, "settings", "main");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setSettings((prev) => ({ ...prev, ...snap.data() }));
    });
    return () => unsub();
  }, []);

  // Cart Logic
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const qty = (existing?.qty || 0) + 1;
      return {
        ...prev,
        [item.id]: { ...item, qty },
      };
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
    <div className="min-h-screen bg-surface-50 text-slate-900 selection:bg-brand-primary/10">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight">
              {t(lang, "brand")}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t(lang, "subtitle")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {adminUser && (
              <Link
                to="/admin"
                className="hidden items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-primary sm:flex"
              >
                Admin
              </Link>
            )}
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-6">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Sidebar: Status & Fast Actions */}
          <aside className="space-y-4">
            <section
              className={`overflow-hidden rounded-[2rem] border bg-white p-6 shadow-sm transition-all ${
                settings.isOpen ? "border-emerald-100" : "border-rose-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    settings.isOpen
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  <span
                    className={`h-3 w-3 rounded-full animate-pulse ${
                      settings.isOpen ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="text-sm font-black">
                    {settings.isOpen ? t(lang, "open") : t(lang, "closed")}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {settings.isOpen
                      ? t(lang, "openNow")
                      : t(lang, "closedNow")}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <div className="flex-1 rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">
                    Lead Time
                  </p>
                  <p className="text-xs font-black">
                    {settings.minLeadMinutes}m
                  </p>
                </div>
                <div className="flex-1 rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">
                    Orders
                  </p>
                  <p
                    className={`text-xs font-black ${settings.acceptingOrders ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {settings.acceptingOrders ? "ON" : "OFF"}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <button
                type="button"
                className="rounded-3xl bg-slate-900 py-4 text-sm font-black text-white shadow-lg shadow-slate-200 active:scale-95 transition-all"
                onClick={() =>
                  document
                    .getElementById("menuSection")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t(lang, "viewMenu")}
              </button>

              <button
                type="button"
                onClick={onCheckout}
                disabled={!canCheckout}
                className={`rounded-3xl border py-4 text-sm font-black active:scale-95 transition-all ${
                  canCheckout
                    ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-300"
                }`}
              >
                {t(lang, "checkout")}
              </button>
            </div>
          </aside>

          {/* Menu Area */}
          <div id="menuSection" className="scroll-mt-24">
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
