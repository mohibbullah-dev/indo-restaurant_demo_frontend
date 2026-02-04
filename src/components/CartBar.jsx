// import { t } from "../i18n";

// export default function CartBar({
//   lang,
//   cartCount,
//   total,
//   onClear,
//   onCheckout,
// }) {
//   if (cartCount === 0) return null;

//   return (
//     <div className="fixed bottom-3 left-0 right-0 z-30 px-3 sm:px-4">
//       <div className="mx-auto w-full max-w-5xl rounded-3xl bg-black p-3 text-white shadow-lg">
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//           <div className="min-w-0">
//             <div className="text-sm font-semibold">
//               {t(lang, "cart")} • {cartCount} {t(lang, "items")}
//             </div>
//             <div className="text-xs text-white/80">
//               {t(lang, "total")}:{" "}
//               <span className="font-semibold">{total} EGP</span>
//             </div>
//           </div>

//           <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
//             <button
//               type="button"
//               onClick={onClear}
//               className="w-full sm:w-auto rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold active:scale-[0.98]"
//             >
//               {t(lang, "clear")}
//             </button>
//             <button
//               type="button"
//               onClick={onCheckout}
//               className="w-full sm:w-auto rounded-full bg-white px-4 py-2 text-xs font-semibold text-black active:scale-[0.98]"
//             >
//               {t(lang, "checkout")}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
    <div className="fixed bottom-0 left-0 right-0 z-30 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-4">
        <div className="rounded-3xl border border-black/5 bg-black p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Cart Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">
                  {cartCount} {cartCount === 1 ? t(lang, "item") : t(lang, "items")}
                </div>
                <div className="text-xs text-white/70">
                  {t(lang, "total")}:{" "}
                  <span className="font-semibold text-white">{total} EGP</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={onClear}
                className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98] sm:flex-none"
              >
                {t(lang, "clear")}
              </button>
              <button
                type="button"
                onClick={onCheckout}
                className="flex-1 rounded-2xl bg-white px-5 py-2.5 text-xs font-semibold text-black shadow-lg transition hover:bg-white/90 active:scale-[0.98] sm:flex-none"
              >
                {t(lang, "checkout")} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}