import { useEffect, useMemo, useRef, useState } from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { t } from "../i18n";
import {
  buildLocalISO,
  isAtLeastMinutesFromNow,
  todayISODate,
} from "../utils/time";
import { db } from "../firebase";
import { useToast } from "./ToastProvider";

function buildWhatsAppLink({ phone, text }) {
  const safeText = encodeURIComponent(text);
  const base = phone ? `https://wa.me/${phone}` : "https://wa.me/";
  return `${base}?text=${safeText}`;
}

function ClockIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 2v3M16 2v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3.5 9h17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 4.5h11A3 3 0 0 1 20.5 7.5v11A3 3 0 0 1 17.5 21.5h-11A3 3 0 0 1 3.5 18.5v-11A3 3 0 0 1 6.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Try to open native picker if supported, otherwise just focus
function focusAndTryPicker(inputEl) {
  if (!inputEl) return;
  inputEl.focus();
  if (typeof inputEl.showPicker === "function") {
    try {
      inputEl.showPicker();
    } catch {
      // Some browsers block showPicker; focus is still helpful
    }
  }
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
  const toast = useToast();

  const [date, setDate] = useState(todayISODate()); // YYYY-MM-DD
  const [time, setTime] = useState(""); // "HH:MM"
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [customerWa, setCustomerWa] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dateRef = useRef(null);
  const timeRef = useRef(null);

  const itemsArray = useMemo(() => Object.values(cart), [cart]);

  // digits only for WhatsApp
  const waClean = useMemo(() => customerWa.replace(/[^\d]/g, ""), [customerWa]);

  // Required fields
  const canSubmitBase = useMemo(() => {
    return (
      itemsArray.length > 0 &&
      !!date &&
      !!time &&
      name.trim().length > 0 &&
      waClean.length > 0
    );
  }, [itemsArray.length, date, time, name, waClean]);

  useEffect(() => {
    if (open) {
      setCopied(false);
      setSaving(false);
      setError("");
      setDate(todayISODate());
      setTime("");
      setName("");
      setNotes("");
      setCustomerWa("");
    }
  }, [open]);

  const tooSoon = useMemo(() => {
    if (!date || !time) return false;
    return !isAtLeastMinutesFromNow(date, time, settings?.minLeadMinutes ?? 0);
  }, [date, time, settings]);

  const canSubmit = canSubmitBase && !tooSoon && !saving;

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      toast.push({
        title: "Copied",
        message: "Link copied to clipboard.",
        variant: "default",
      });
    } catch {
      // ignore
    }
  };

  const validateRequired = () => {
    if (itemsArray.length === 0) {
      toast.push({
        title: "Cart empty",
        message: "Add items first.",
        variant: "warning",
      });
      return false;
    }
    if (!date) {
      toast.push({
        title: "Missing date",
        message: "Please choose a date.",
        variant: "warning",
      });
      return false;
    }
    if (!time) {
      toast.push({
        title: "Missing time",
        message: "Please choose a time.",
        variant: "warning",
      });
      return false;
    }
    if (!name.trim()) {
      toast.push({
        title: "Name required",
        message: "Please enter your name.",
        variant: "warning",
      });
      return false;
    }
    if (!waClean) {
      toast.push({
        title: "WhatsApp required",
        message: "Please enter your WhatsApp number (digits only).",
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    setError("");

    if (!validateRequired()) return;

    if (tooSoon) {
      const mins = settings?.minLeadMinutes ?? 0;
      setError(t(lang, "tooSoon"));
      toast.push({
        title: t(lang, "tooSoon"),
        message: mins
          ? `Minimum lead time is ${mins} minutes.`
          : "Please choose a later time.",
        variant: "warning",
      });
      return;
    }

    try {
      setSaving(true);

      const scheduledAtIso = buildLocalISO(date, time);

      // create doc first to get orderId
      const ref = doc(collection(db, "orders"));
      const orderId = ref.id;

      const trackUrl = `${window.location.origin}/order/${orderId}`;

      // WhatsApp message to restaurant
      const lines = [];
      lines.push("🧾 NEW ORDER");
      lines.push(`🆔 Order ID: ${orderId}`);
      lines.push(`📅 Date: ${date}`);
      lines.push(`⏰ Time: ${time}`);
      lines.push(`👤 Name: ${name.trim()}`);
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
          name: name.trim(),
          notes: notes.trim() || null,
          whatsapp: waClean,
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

      window.open(waLink, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
      setError("Failed to save order. Check Firestore rules / config.");
      toast.push({
        title: "Failed to save",
        message: "Please try again.",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Hide native picker icons (Chrome/Edge) so we don't get double icons */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          display: none;
        }
        input[type="date"], input[type="time"] { appearance: none; }
      `}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 z-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="mx-auto w-full max-w-5xl px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div
            className="rounded-t-3xl border border-black/10 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                {/* Date with single icon */}
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    {t(lang, "date")}
                  </span>

                  <div
                    className="relative"
                    onMouseDown={() => focusAndTryPicker(dateRef.current)}
                    onTouchStart={() => focusAndTryPicker(dateRef.current)}
                  >
                    <input
                      ref={dateRef}
                      type="date"
                      value={date}
                      min={todayISODate()}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-black/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => focusAndTryPicker(dateRef.current)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white p-2 text-zinc-700 active:scale-[0.98]"
                      aria-label="Pick date"
                      title="Pick date"
                    >
                      <CalendarIcon className="h-5 w-5" />
                    </button>
                  </div>
                </label>

                {/* Time with single icon */}
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    {t(lang, "time")}
                  </span>

                  <div
                    className="relative"
                    onMouseDown={() => focusAndTryPicker(timeRef.current)}
                    onTouchStart={() => focusAndTryPicker(timeRef.current)}
                  >
                    <input
                      ref={timeRef}
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      step={300}
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-black/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => focusAndTryPicker(timeRef.current)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white p-2 text-zinc-700 active:scale-[0.98]"
                      aria-label="Pick time"
                      title="Pick time"
                    >
                      <ClockIcon className="h-5 w-5" />
                    </button>
                  </div>
                </label>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    Name <span className="text-rose-600">*</span>
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                    placeholder="Your name"
                    required
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

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    {t(lang, "customerWhatsApp")}{" "}
                    <span className="text-rose-600">*</span>
                  </span>
                  <input
                    value={customerWa}
                    onChange={(e) => setCustomerWa(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                    placeholder="201234567890"
                    inputMode="numeric"
                    required
                  />
                  <div className="text-[11px] text-zinc-500">
                    Digits only (no +, no spaces). Example: 201234567890
                  </div>
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
