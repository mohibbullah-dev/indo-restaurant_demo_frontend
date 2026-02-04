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
        variant: toast?.variant || "default", // default | success | warning | danger
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
      <div className="pointer-events-none fixed left-0 right-0 top-3 z-[60]">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-3">
          {toasts.map((t) => {
            const tone =
              t.variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : t.variant === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : t.variant === "danger"
                    ? "border-rose-200 bg-rose-50 text-rose-950"
                    : "border-black/10 bg-white text-zinc-900";

            return (
              <div
                key={t.id}
                className={[
                  "pointer-events-auto rounded-3xl border p-3 shadow-sm backdrop-blur",
                  tone,
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {t.title ? (
                      <div className="text-sm font-semibold">{t.title}</div>
                    ) : null}
                    {t.message ? (
                      <div className="mt-0.5 text-xs opacity-80">
                        {t.message}
                      </div>
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
                        className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold active:scale-[0.98]"
                      >
                        {t.actionLabel}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold active:scale-[0.98]"
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
