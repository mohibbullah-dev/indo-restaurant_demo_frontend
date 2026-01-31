import { useEffect, useMemo, useState } from "react";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { isRtl, t } from "./i18n";

export default function App() {
  // Feature 1 mock state (later we will replace with Firestore settings)
  const [isOpen, setIsOpen] = useState(true);

  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "id");
  const rtl = useMemo(() => isRtl(lang), [lang]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang, rtl]);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      {/* Top app bar */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-tight">
              {t(lang, "brand")}
            </span>
            <span className="text-xs text-zinc-500">{t(lang, "subtitle")}</span>
          </div>

          <LanguageSwitcher lang={lang} setLang={setLang} />
        </div>
      </header>

      {/* Page */}
      <main className="mx-auto w-full max-w-md px-4 pb-24 pt-4">
        {/* Open/Closed card */}
        <section
          className={[
            "rounded-3xl p-4 shadow-sm border",
            isOpen ? "bg-white border-emerald-200" : "bg-white border-rose-200",
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

        {/* Action buttons */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-3xl bg-black px-4 py-4 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
          >
            {t(lang, "viewMenu")}
          </button>
          <button
            type="button"
            className="rounded-3xl border border-black/10 bg-white px-4 py-4 text-sm font-semibold text-zinc-900 shadow-sm active:scale-[0.99]"
          >
            {t(lang, "quickOrder")}
          </button>
        </section>

        {/* Placeholder content */}
        <section className="mt-4 rounded-3xl border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold">Next: Menu</div>
          <div className="mt-1 text-xs text-zinc-600">
            In Feature 2 we’ll load menu items (later from Firestore) and show
            categories.
          </div>
        </section>
      </main>

      {/* Bottom safe padding 느낌 */}
      <div className="fixed bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-zinc-50 to-transparent" />
    </div>
  );
}
