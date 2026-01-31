import { t } from "../i18n";

export default function CartBar({
  lang,
  cartCount,
  total,
  onClear,
  onCheckout,
}) {
  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-30 px-3">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-3xl bg-black p-3 text-white shadow-lg">
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {t(lang, "cart")} • {cartCount} {t(lang, "items")}
          </div>
          <div className="text-xs text-white/80">
            {t(lang, "total")}:{" "}
            <span className="font-semibold">{total} EGP</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold active:scale-[0.98]"
          >
            {t(lang, "clear")}
          </button>
          <button
            type="button"
            onClick={onCheckout}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black active:scale-[0.98]"
          >
            {t(lang, "checkout")}
          </button>
        </div>
      </div>
    </div>
  );
}
