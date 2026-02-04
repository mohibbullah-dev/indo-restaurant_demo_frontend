import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import LanguageSwitcher from "../components/LanguageSwitcher";
import Menu from "../components/Menu";
import CartBar from "../components/CartBar";
import CheckoutSheet from "../components/CheckoutSheet";

import { t } from "../i18n";
import { db } from "../firebase";
import { useToast } from "../components/ToastProvider";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

export default function Home({
  lang,
  setLang,
  categories = [],
  items = [],
  menuLoading = false,
  menuError = "",
}) {
  // Settings from Firestore
  const [settings, setSettings] = useState({
    isOpen: true,
    acceptingOrders: true,
    timezone: "Africa/Cairo",
    minLeadMinutes: 30,
    restaurantWhatsAppNumber: "",
  });

  const toast = useToast();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAdminUser(u); // u === null → not logged in
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const ref = doc(db, "settings", "main");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setSettings((prev) => ({ ...prev, ...snap.data() }));
      }
    });
    return () => unsub();
  }, []);

  // Menu filter + cart
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState({}); // { [itemId]: { id, price, qty, name } }

  // keep activeCategory valid when categories change
  useEffect(() => {
    if (activeCategory === "all") return;
    const exists = categories.some((c) => c.id === activeCategory);
    if (!exists) setActiveCategory("all");
  }, [categories, activeCategory]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const qty = (existing?.qty || 0) + 1;

      // keep full item data (so CheckoutSheet can use name in 3 languages)
      return {
        ...prev,
        [item.id]: {
          ...item,
          id: item.id,
          price: item.price,
          qty,
          name: item.name,
        },
      };
    });
  };

  const clearCart = () => setCart({});

  const cartCount = Object.values(cart).reduce((s, x) => s + x.qty, 0);
  const total = Object.values(cart).reduce((s, x) => s + x.qty * x.price, 0);

  // Checkout sheet
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const restaurantWa =
    settings.restaurantWhatsAppNumber || settings.restaurantWa || "";

  const canCheckout =
    cartCount > 0 && settings.isOpen && settings.acceptingOrders;

  const onCheckout = () => {
    if (!canCheckout) {
      toast.push({
        title: "Ordering unavailable",
        message: "Restaurant is closed or not accepting orders right now.",
        variant: "warning",
      });
      return;
    }

    setCheckoutOpen(true);
  };

  const onOrderCreated = () => {
    clearCart();
    setCheckoutOpen(false);
    toast.push({
      title: "Order created",
      message: "WhatsApp opened with your order details.",
      variant: "success",
    });
  };

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      {/* Top app bar */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-tight">
              {t(lang, "brand")}
            </span>
            <span className="text-xs text-zinc-500">{t(lang, "subtitle")}</span>
          </div>

          <div className="flex items-center gap-2">
            {adminUser ? (
              <Link
                to="/admin"
                className="rounded-full border border-black/10 bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-black/90"
              >
                Admin
              </Link>
            ) : null}

            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>
        </div>
      </header>

      {/* Responsive layout */}
      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4">
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          {/* Left column */}
          <div className="space-y-4">
            {/* Open/Closed card */}
            <section
              className={[
                "rounded-3xl p-4 shadow-sm border bg-white",
                settings.isOpen ? "border-emerald-200" : "border-rose-200",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "h-3 w-3 rounded-full",
                      settings.isOpen ? "bg-emerald-500" : "bg-rose-500",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {settings.isOpen ? t(lang, "open") : t(lang, "closed")}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {settings.isOpen
                        ? t(lang, "openNow")
                        : t(lang, "closedNow")}
                    </span>
                  </div>
                </div>

                <span className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700">
                  {settings.acceptingOrders ? "ON" : "OFF"}
                </span>
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                Lead time:{" "}
                <span className="font-semibold">
                  {settings.minLeadMinutes ?? 0} min
                </span>
                {" • "}
                TZ:{" "}
                <span className="font-semibold">
                  {settings.timezone || "Africa/Cairo"}
                </span>
              </div>
            </section>

            {/* Action buttons */}
            <section className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-3xl bg-black px-4 py-4 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
                onClick={() => {
                  // scroll to menu section
                  document.getElementById("menuSection")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {t(lang, "viewMenu")}
              </button>

              <button
                type="button"
                onClick={onCheckout}
                disabled={!canCheckout}
                className={[
                  "rounded-3xl px-4 py-4 text-sm font-semibold shadow-sm active:scale-[0.99]",
                  canCheckout
                    ? "border border-black/10 bg-white text-zinc-900"
                    : "border border-black/10 bg-white text-zinc-400",
                ].join(" ")}
              >
                {t(lang, "checkout")}
              </button>
            </section>

            {/* Help text */}
            {!settings.isOpen || !settings.acceptingOrders ? (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-semibold">Notice</div>
                <div className="mt-1 text-xs text-amber-900">
                  Ordering is currently disabled (closed or not accepting
                  orders).
                </div>
              </section>
            ) : null}

            {/* Menu fetch state (optional small card on left) */}
            {menuLoading ? (
              <section className="rounded-3xl border border-black/10 bg-white p-4">
                <div className="text-sm font-semibold">Loading menu…</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Fetching categories and items.
                </div>
              </section>
            ) : null}

            {menuError ? (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
                <div className="text-sm font-semibold text-rose-900">
                  Menu error
                </div>
                <div className="mt-1 text-xs text-rose-900">{menuError}</div>
              </section>
            ) : null}
          </div>

          {/* Right column */}
          <div className="space-y-4" id="menuSection">
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

      {/* Cart bar */}
      <CartBar
        lang={lang}
        cartCount={cartCount}
        total={total}
        onClear={clearCart}
        onCheckout={onCheckout}
      />

      {/* Checkout bottom sheet */}
      <CheckoutSheet
        lang={lang}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        total={total}
        restaurantWhatsAppNumber={restaurantWa}
        settings={settings}
        onOrderCreated={onOrderCreated}
      />

      {/* Bottom fade */}
      <div className="fixed bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-zinc-50 to-transparent" />
    </div>
  );
}
