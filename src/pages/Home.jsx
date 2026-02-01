import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import LanguageSwitcher from "../components/LanguageSwitcher";
import Menu from "../components/Menu";
import CartBar from "../components/CartBar";
import CheckoutSheet from "../components/CheckoutSheet";

import { t } from "../i18n";
import { db } from "../firebase";
import { CATEGORIES, MENU_ITEMS } from "../mockMenu";

export default function Home({ lang, setLang }) {
  // Settings from Firestore
  const [settings, setSettings] = useState({
    isOpen: true,
    acceptingOrders: true,
    timezone: "Africa/Cairo",
    minLeadMinutes: 30,
  });

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

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const qty = (existing?.qty || 0) + 1;
      return {
        ...prev,
        [item.id]: { id: item.id, price: item.price, qty, name: item.name },
      };
    });
  };

  const clearCart = () => setCart({});

  const cartCount = Object.values(cart).reduce((s, x) => s + x.qty, 0);
  const total = Object.values(cart).reduce((s, x) => s + x.qty * x.price, 0);

  // Checkout sheet
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Put restaurant WhatsApp number here later (international without +)
  // Egypt example: "201234567890"
  const RESTAURANT_WA_NUMBER = ""; // keep empty until you have the real number

  const canCheckout =
    cartCount > 0 && settings.isOpen && settings.acceptingOrders;

  const onCheckout = () => {
    if (!canCheckout) return;
    setCheckoutOpen(true);
  };

  const onOrderCreated = () => {
    // After saving order in Firestore, clear cart and close sheet
    clearCart();
    setCheckoutOpen(false);
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

          <LanguageSwitcher lang={lang} setLang={setLang} />
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
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <Menu
              lang={lang}
              categories={CATEGORIES}
              items={MENU_ITEMS}
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

      {/* Checkout bottom sheet (Firestore save + WhatsApp link with orderId) */}
      <CheckoutSheet
        lang={lang}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        total={total}
        restaurantWhatsAppNumber={RESTAURANT_WA_NUMBER}
        settings={settings}
        onOrderCreated={onOrderCreated}
      />

      {/* Bottom fade */}
      <div className="fixed bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-zinc-50 to-transparent" />
    </div>
  );
}
