import { useEffect, useMemo, useState } from "react";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { isRtl, t } from "./i18n";
import Menu from "./components/Menu";
import CartBar from "./components/CartBar";
import CheckoutSheet from "./components/CheckoutSheet";
import { CATEGORIES, MENU_ITEMS } from "./mockMenu";
import { TIME_SLOTS } from "./mockSlots";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export default function App() {
  // Feature 1 mock state (later we will replace with Firestore settings)
  const [settings, setSettings] = useState({
    isOpen: true,
    acceptingOrders: true,
    timezone: "Africa/Cairo",
    minLeadMinutes: 30,
  });
  const isOpen = settings.isOpen;

  // Language + RTL
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "id");
  const rtl = useMemo(() => isRtl(lang), [lang]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang, rtl]);

  useEffect(() => {
    const ref = doc(db, "settings", "main");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setSettings((prev) => ({ ...prev, ...snap.data() }));
      }
    });
    return () => unsub();
  }, []);

  // Feature 2: Menu filter + cart
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

  // Feature 3: Checkout sheet
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // IMPORTANT: Put restaurant WhatsApp number here later (international without +)
  // Egypt example: "201234567890"
  const RESTAURANT_WA_NUMBER = ""; // <-- leave empty for now, it will still open WhatsApp with text

  const onCheckout = () => setCheckoutOpen(true);

  const onOrderCreated = (order) => {
    // For now: clear cart after creating order
    clearCart();
    setCheckoutOpen(false);
    // You can also store last order in localStorage if you want later
    console.log("Order created:", order);
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

      {/* Responsive page layout:
          - Mobile/tablet: single column
          - Desktop: two columns */}
      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4">
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          {/* Left column (status + actions) */}
          <div className="space-y-4">
            {/* Open/Closed card */}
            <section
              className={[
                "rounded-3xl p-4 shadow-sm border bg-white",
                isOpen ? "border-emerald-200" : "border-rose-200",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "h-3 w-3 rounded-full",
                      isOpen ? "bg-emerald-500" : "bg-rose-500",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {isOpen ? t(lang, "open") : t(lang, "closed")}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {isOpen ? t(lang, "openNow") : t(lang, "closedNow")}
                    </span>
                  </div>
                </div>

                {/* temporary toggle for testing UI (remove later; admin will control this) */}
                <button
                  type="button"
                  onClick={() => setIsOpen((v) => !v)}
                  className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/70 active:scale-[0.98]"
                  title="Temporary UI toggle"
                >
                  Toggle
                </button>
              </div>
            </section>

            {/* Action buttons (optional) */}
            <section className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-3xl bg-black px-4 py-4 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
              >
                {t(lang, "viewMenu")}
              </button>
              <button
                type="button"
                className="rounded-3xl border border-black/10 bg-white px-4 py-4 text-sm font-semibold text-zinc-900 shadow-sm active:scale-[0.99]"
                onClick={() => setCheckoutOpen(true)}
                disabled={
                  cartCount === 0 ||
                  !settings.isOpen ||
                  !settings.acceptingOrders
                }
              >
                {t(lang, "checkout")}
              </button>
            </section>

            <section className="rounded-3xl border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold">WhatsApp follow-up</div>
              <div className="mt-1 text-xs text-zinc-600">
                Feature 3 opens WhatsApp with a prefilled order message (fastest
                for small restaurants).
              </div>
            </section>
          </div>

          {/* Right column (Menu) */}
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

      {/* Checkout bottom sheet */}
      <CheckoutSheet
        lang={lang}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        total={total}
        slots={TIME_SLOTS}
        restaurantWhatsAppNumber={RESTAURANT_WA_NUMBER}
        onOrderCreated={onOrderCreated}
      />

      {/* Bottom fade for app feel */}
      <div className="fixed bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-zinc-50 to-transparent" />
    </div>
  );
}
