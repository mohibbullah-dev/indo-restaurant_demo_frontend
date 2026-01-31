import { useEffect, useMemo, useState } from "react";
import { t } from "../i18n";

function buildWhatsAppLink({ phone, text }) {
  // phone should be international like "201234567890" (no +)
  const safeText = encodeURIComponent(text);
  const base = phone ? `https://wa.me/${phone}` : "https://wa.me/";
  return `${base}?text=${safeText}`;
}

export default function CheckoutSheet({
  lang,
  open,
  onClose,
  cart,
  total,
  slots,
  restaurantWhatsAppNumber, // e.g. "201234567890" later
  onOrderCreated, // callback(order)
}) {
  const [slot, setSlot] = useState(slots?.[0] || "");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setCopied(false);
      setSlot((s) => s || slots?.[0] || "");
    }
  }, [open, slots]);

  const itemsArray = useMemo(() => Object.values(cart), [cart]);
  const canSubmit = itemsArray.length > 0 && !!slot;

  const orderText = useMemo(() => {
    const lines = [];
    lines.push("🧾 NEW ORDER");
    lines.push(`⏰ Time: ${slot}`);
    if (name.trim()) lines.push(`👤 Name: ${name.trim()}`);
    if (notes.trim()) lines.push(`📝 Notes: ${notes.trim()}`);
    lines.push("");
    lines.push("Items:");
    for (const it of itemsArray) {
      const label = it.name?.[lang] || it.name?.en || it.id;
      lines.push(`- ${label} x${it.qty} = ${it.qty * it.price} EGP`);
    }
    lines.push("");
    lines.push(`💰 Total: ${total} EGP`);
    return lines.join("\n");
  }, [itemsArray, lang, name, notes, slot, total]);

  const waLink = useMemo(() => {
    return buildWhatsAppLink({
      phone: restaurantWhatsAppNumber,
      text: orderText,
    });
  }, [restaurantWhatsAppNumber, orderText]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(waLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const placeOrder = () => {
    if (!canSubmit) return;

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order = {
      id: orderId,
      slot,
      name: name.trim(),
      notes: notes.trim(),
      items: itemsArray.map((x) => ({
        id: x.id,
        qty: x.qty,
        price: x.price,
        name: x.name,
      })),
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
      waLink,
    };

    onOrderCreated?.(order);

    // Open WhatsApp immediately (best conversion)
    window.open(waLink, "_blank", "noopener,noreferrer");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
        aria-label="Close"
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-auto w-full max-w-5xl px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="rounded-t-3xl border border-black/10 bg-white shadow-xl">
            {/* Handle */}
            <div className="flex justify-center pt-3">
              <div className="h-1.5 w-12 rounded-full bg-black/10" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 pt-3">
              <div className="text-sm font-semibold">
                {t(lang, "checkoutTitle")}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
              >
                {t(lang, "cancel")}
              </button>
            </div>

            <div className="px-4 pb-4">
              {/* Time slots */}
              <div className="text-xs font-semibold text-zinc-700">
                {t(lang, "chooseTime")}
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                {slots.map((s) => {
                  const active = s === slot;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={[
                        "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold active:scale-[0.98]",
                        active
                          ? "bg-black text-white border-black"
                          : "bg-white border-black/10 text-zinc-700 hover:bg-black/5",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {/* Inputs */}
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    {t(lang, "nameOptional")}
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                    placeholder={t(lang, "nameOptional")}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    {t(lang, "notesOptional")}
                  </span>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                    placeholder={t(lang, "notesOptional")}
                  />
                </label>
              </div>

              {/* Hint */}
              <div className="mt-3 text-xs text-zinc-500">
                {t(lang, "whatsAppPrefillHint")}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={!canSubmit}
                  className={[
                    "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm active:scale-[0.99]",
                    canSubmit
                      ? "bg-black text-white"
                      : "bg-black/20 text-white/70",
                  ].join(" ")}
                >
                  {t(lang, "placeOrder")}
                </button>

                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 active:scale-[0.99]"
                  title={t(lang, "copyLink")}
                >
                  {copied ? t(lang, "copied") : t(lang, "copyLink")}
                </button>
              </div>

              {/* Total */}
              <div className="mt-3 text-sm font-semibold">
                {t(lang, "total")}: {total} EGP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
