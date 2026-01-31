import { useEffect, useMemo, useState } from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { t } from "../i18n";
import {
  buildLocalISO,
  isAtLeastMinutesFromNow,
  todayISODate,
} from "../utils/time";
import { db } from "../firebase";

function buildWhatsAppLink({ phone, text }) {
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
  restaurantWhatsAppNumber,
  settings,
  onOrderCreated,
}) {
  const [date, setDate] = useState(todayISODate());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const itemsArray = useMemo(() => Object.values(cart), [cart]);
  const canSubmitBase = itemsArray.length > 0 && !!date && !!time;

  useEffect(() => {
    if (open) {
      setCopied(false);
      setSaving(false);
      setError("");
      setDate(todayISODate());
      setTime("");
    }
  }, [open]);

  const tooSoon = useMemo(() => {
    if (!canSubmitBase) return false;
    return !isAtLeastMinutesFromNow(date, time, settings?.minLeadMinutes ?? 0);
  }, [canSubmitBase, date, time, settings]);

  const canSubmit = canSubmitBase && !tooSoon && !saving;

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const placeOrder = async () => {
    setError("");
    if (!canSubmitBase) return;

    if (tooSoon) {
      setError(t(lang, "tooSoon"));
      return;
    }

    try {
      setSaving(true);

      const scheduledAtIso = buildLocalISO(date, time);

      // Create a document reference FIRST to get orderId
      const ref = doc(collection(db, "orders"));
      const orderId = ref.id;

      const trackUrl = `${window.location.origin}/order/${orderId}`;

      // Build WhatsApp message including orderId + track link
      const lines = [];
      lines.push("🧾 NEW ORDER");
      lines.push(`🆔 Order ID: ${orderId}`);
      lines.push(`📅 Date: ${date}`);
      lines.push(`⏰ Time: ${time}`);
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
      lines.push("");
      lines.push(`🔎 Track/Cancel: ${trackUrl}`);

      const orderText = lines.join("\n");

      const waLink = buildWhatsAppLink({
        phone: restaurantWhatsAppNumber,
        text: orderText,
      });

      const payload = {
        id: orderId,
        channel: "whatsapp",
        customer: {
          name: name.trim() || null,
          notes: notes.trim() || null,
        },
        items: itemsArray.map((x) => ({
          id: x.id,
          qty: x.qty,
          price: x.price,
          name: x.name,
        })),
        total,
        status: "pending",
        scheduled: {
          date,
          time,
          scheduledAtIso,
          timezone: settings?.timezone || "Africa/Cairo",
          minLeadMinutes: settings?.minLeadMinutes ?? 0,
        },
        trackUrl,
        createdAt: serverTimestamp(),
        wa: {
          to: restaurantWhatsAppNumber || null,
          prefillText: orderText,
          prefillLink: waLink,
        },
      };

      await setDoc(ref, payload);

      onOrderCreated?.({ ...payload });

      // Open WhatsApp immediately
      window.open(waLink, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
      setError("Failed to save order. Check Firestore rules / config.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
        aria-label="Close"
      />

      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-auto w-full max-w-5xl px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="rounded-t-3xl border border-black/10 bg-white shadow-xl">
            <div className="flex justify-center pt-3">
              <div className="h-1.5 w-12 rounded-full bg-black/10" />
            </div>

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
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    {t(lang, "date")}
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    {t(lang, "time")}
                  </span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                  />
                </label>
              </div>

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

              {tooSoon ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  {t(lang, "tooSoon")}{" "}
                  {settings?.minLeadMinutes
                    ? `(${settings.minLeadMinutes} min)`
                    : ""}
                </div>
              ) : null}

              {error ? (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                  {error}
                </div>
              ) : null}

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
                  {saving ? t(lang, "saving") : t(lang, "placeOrder")}
                </button>

                <button
                  type="button"
                  onClick={() => copyLink(`${window.location.origin}/`)}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 active:scale-[0.99]"
                  title={t(lang, "copyLink")}
                >
                  {copied ? t(lang, "copied") : t(lang, "copyLink")}
                </button>
              </div>

              <div className="mt-3 text-sm font-semibold">
                {t(lang, "total")}: {total} EGP
              </div>

              <div className="mt-2 text-xs text-zinc-500">
                {t(lang, "whatsAppPrefillHint")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
