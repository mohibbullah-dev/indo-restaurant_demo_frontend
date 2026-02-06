// import {
//   createContext,
//   useCallback,
//   useContext,
//   useMemo,
//   useState,
// } from "react";

// const ToastCtx = createContext(null);

// function uid() {
//   return Math.random().toString(36).slice(2) + Date.now().toString(36);
// }

// export function ToastProvider({ children }) {
//   const [toasts, setToasts] = useState([]);

//   const remove = useCallback((id) => {
//     setToasts((prev) => prev.filter((t) => t.id !== id));
//   }, []);

//   const push = useCallback(
//     (toast) => {
//       const id = uid();
//       const t = {
//         id,
//         title: toast?.title || "",
//         message: toast?.message || "",
//         variant: toast?.variant || "default", // default | success | warning | danger
//         actionLabel: toast?.actionLabel || null,
//         onAction: toast?.onAction || null,
//         durationMs: toast?.durationMs ?? 4500,
//       };

//       setToasts((prev) => [t, ...prev].slice(0, 3)); // max 3 toasts

//       if (t.durationMs > 0) {
//         setTimeout(() => remove(id), t.durationMs);
//       }

//       return id;
//     },
//     [remove],
//   );

//   const api = useMemo(() => ({ push, remove }), [push, remove]);

//   return (
//     <ToastCtx.Provider value={api}>
//       {children}

//       {/* Toast UI */}
//       <div className="pointer-events-none fixed left-0 right-0 top-3 z-[60]">
//         <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-3">
//           {toasts.map((t) => {
//             const tone =
//               t.variant === "success"
//                 ? "border-emerald-200 bg-emerald-50 text-emerald-950"
//                 : t.variant === "warning"
//                   ? "border-amber-200 bg-amber-50 text-amber-950"
//                   : t.variant === "danger"
//                     ? "border-rose-200 bg-rose-50 text-rose-950"
//                     : "border-black/10 bg-white text-zinc-900";

//             return (
//               <div
//                 key={t.id}
//                 className={[
//                   "pointer-events-auto rounded-3xl border p-3 shadow-sm backdrop-blur",
//                   tone,
//                 ].join(" ")}
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="min-w-0">
//                     {t.title ? (
//                       <div className="text-sm font-semibold">{t.title}</div>
//                     ) : null}
//                     {t.message ? (
//                       <div className="mt-0.5 text-xs opacity-80">
//                         {t.message}
//                       </div>
//                     ) : null}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     {t.actionLabel && t.onAction ? (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           try {
//                             t.onAction();
//                           } finally {
//                             remove(t.id);
//                           }
//                         }}
//                         className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold active:scale-[0.98]"
//                       >
//                         {t.actionLabel}
//                       </button>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => remove(t.id)}
//                       className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold active:scale-[0.98]"
//                       aria-label="Close toast"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </ToastCtx.Provider>
//   );
// }

// export function useToast() {
//   const ctx = useContext(ToastCtx);
//   if (!ctx) throw new Error("useToast must be used inside <ToastProvider />");
//   return ctx;
// }

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastCtx = createContext(null);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = uid();
      const t = {
        id,
        title: toast?.title || "",
        message: toast?.message || "",
        variant: toast?.variant || "default", // default | success | warning | danger | delete
        actionLabel: toast?.actionLabel || null,
        onAction: toast?.onAction || null,
        durationMs: toast?.durationMs ?? 4500,
      };

      setToasts((prev) => [t, ...prev].slice(0, 3)); // max 3 toasts

      if (t.durationMs > 0) {
        setTimeout(() => remove(id), t.durationMs);
      }

      return id;
    },
    [remove],
  );

  const api = useMemo(() => ({ push, remove }), [push, remove]);

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* Toast UI */}
      <div className="pointer-events-none fixed left-0 right-0 top-3 z-[9999]">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-3">
          {toasts.map((t) => {
            // ======= Colorful styles by variant (UI only) =======
            const tone =
              t.variant === "success"
                ? {
                    wrap: "border-emerald-300/60 bg-emerald-500/15 text-emerald-950",
                    pill: "bg-emerald-600 text-white",
                    btn: "border-emerald-300/50 bg-white/70 text-emerald-950 hover:bg-white",
                    x: "border-emerald-300/50 bg-white/70 text-emerald-950 hover:bg-white",
                  }
                : t.variant === "warning"
                  ? {
                      wrap: "border-amber-300/60 bg-amber-500/15 text-amber-950",
                      pill: "bg-amber-600 text-white",
                      btn: "border-amber-300/50 bg-white/70 text-amber-950 hover:bg-white",
                      x: "border-amber-300/50 bg-white/70 text-amber-950 hover:bg-white",
                    }
                  : t.variant === "danger"
                    ? {
                        wrap: "border-rose-300/60 bg-rose-500/15 text-rose-950",
                        pill: "bg-rose-600 text-white",
                        btn: "border-rose-300/50 bg-white/70 text-rose-950 hover:bg-white",
                        x: "border-rose-300/50 bg-white/70 text-rose-950 hover:bg-white",
                      }
                    : t.variant === "delete"
                      ? {
                          wrap: "border-fuchsia-300/60 bg-fuchsia-500/15 text-fuchsia-950",
                          pill: "bg-fuchsia-700 text-white",
                          btn: "border-fuchsia-300/50 bg-white/70 text-fuchsia-950 hover:bg-white",
                          x: "border-fuchsia-300/50 bg-white/70 text-fuchsia-950 hover:bg-white",
                        }
                      : {
                          wrap: "border-black/10 bg-white text-zinc-900",
                          pill: "bg-zinc-900 text-white",
                          btn: "border-black/10 bg-white text-zinc-900 hover:bg-zinc-50",
                          x: "border-black/10 bg-white text-zinc-900 hover:bg-zinc-50",
                        };

            const dot =
              t.variant === "success"
                ? "bg-emerald-600"
                : t.variant === "warning"
                  ? "bg-amber-600"
                  : t.variant === "danger"
                    ? "bg-rose-600"
                    : t.variant === "delete"
                      ? "bg-fuchsia-700"
                      : "bg-zinc-900";

            return (
              <div
                key={t.id}
                className={[
                  "pointer-events-auto rounded-3xl border p-3 shadow-sm backdrop-blur",
                  "transition-transform duration-150 ease-out",
                  tone.wrap,
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "h-2.5 w-2.5 shrink-0 rounded-full",
                          dot,
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      {t.title ? (
                        <div className="text-sm font-semibold">{t.title}</div>
                      ) : null}
                      {t.variant && t.variant !== "default" ? (
                        <span
                          className={[
                            "ml-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                            tone.pill,
                          ].join(" ")}
                        >
                          {t.variant === "danger"
                            ? "error"
                            : t.variant === "delete"
                              ? "delete"
                              : t.variant}
                        </span>
                      ) : null}
                    </div>

                    {t.message ? (
                      <div className="mt-1 text-xs opacity-85">{t.message}</div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {t.actionLabel && t.onAction ? (
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            t.onAction();
                          } finally {
                            remove(t.id);
                          }
                        }}
                        className={[
                          "rounded-full border px-3 py-2 text-xs font-semibold active:scale-[0.98]",
                          tone.btn,
                        ].join(" ")}
                      >
                        {t.actionLabel}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      className={[
                        "rounded-full border px-3 py-2 text-xs font-semibold active:scale-[0.98]",
                        tone.x,
                      ].join(" ")}
                      aria-label="Close toast"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider />");
  return ctx;
}
