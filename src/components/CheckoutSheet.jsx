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

// Optimized SVG Icons
const ClockIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

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
  const [date, setDate] = useState(todayISODate());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [customerWa, setCustomerWa] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dateRef = useRef(null);
  const timeRef = useRef(null);

  const itemsArray = useMemo(() => Object.values(cart), [cart]);
  const waClean = useMemo(() => customerWa.replace(/[^\d]/g, ""), [customerWa]);

  // Validation logic to show real-time error messages
  const tooSoon = useMemo(() => {
    if (!date || !time) return false;
    return !isAtLeastMinutesFromNow(date, time, settings?.minLeadMinutes ?? 0);
  }, [date, time, settings]);

  const validationError = useMemo(() => {
    if (itemsArray.length === 0) return "Cart is empty";
    if (!date) return "Select a date";
    if (!time) return "Select a time";
    if (tooSoon)
      return `Min. lead time is ${settings?.minLeadMinutes || 0} mins`;
    if (!name.trim()) return "Enter your name";
    if (waClean.length < 8) return "Enter valid WhatsApp";
    return null;
  }, [itemsArray, date, time, tooSoon, name, waClean, settings]);

  const canSubmit = !validationError && !saving;

  // Function to explicitly trigger the system picker
  const handleOpenPicker = (ref) => {
    if (ref.current && typeof ref.current.showPicker === "function") {
      try {
        ref.current.showPicker();
      } catch (e) {
        ref.current.focus();
      }
    } else {
      ref.current?.focus();
    }
  };

  useEffect(() => {
    if (open) {
      setError("");
      setDate(todayISODate());
      setTime("");
    }
  }, [open]);

  const placeOrder = async () => {
    if (!canSubmit) return;
    try {
      setSaving(true);
      const scheduledAtIso = buildLocalISO(date, time);
      const ref = doc(collection(db, "orders"));
      const orderId = ref.id;

      const lines = [
        "🧾 *NEW ORDER*",
        `🆔 ID: ${orderId}`,
        `👤 Name: ${name.trim()}`,
        `📅 Date: ${date} | ⏰ Time: ${time}`,
        "",
        `💰 *Total: ${total} EGP*`,
      ];

      const waLink = `https://wa.me/${restaurantWhatsAppNumber}?text=${encodeURIComponent(lines.join("\n"))}`;

      const payload = {
        id: orderId,
        customer: {
          name: name.trim(),
          notes: notes.trim() || null,
          whatsapp: waClean,
        },
        total,
        status: "pending",
        scheduled: { date, time, scheduledAtIso },
        createdAt: serverTimestamp(),
      };

      await setDoc(ref, payload);
      onOrderCreated?.(payload);
      window.open(waLink, "_blank", "noopener,noreferrer");
      onClose();
    } catch (e) {
      setError("Failed to save order. Check connection.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* CRITICAL CSS: 
         1. Makes the native hidden picker fill the entire input box.
         2. Hides the "blue squares" and default browser icons.
      */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          position: absolute;
          left: 0; top: 0; right: 0; bottom: 0;
          width: 100%; height: 100%;
          margin: 0; padding: 0;
          cursor: pointer;
          opacity: 0;
        }
        input::-webkit-inner-spin-button, 
        input::-webkit-clear-button { display: none; }
      `}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Main Sheet Container */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-t-[2.5rem] sm:rounded-[3rem] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        {/* Mobile drag handle indicator */}
        <div className="flex justify-center pt-4 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        <div className="p-8 sm:p-10">
          <header className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Checkout
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              Review your schedule and details
            </p>
          </header>

          <div className="space-y-5">
            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Date
                </label>
                <div
                  className="relative group cursor-pointer"
                  onClick={() => handleOpenPicker(dateRef)}
                >
                  <input
                    ref={dateRef}
                    type="date"
                    min={todayISODate()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent rounded-2xl p-4 text-sm font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  {/* pointer-events-none ensures clicks hit the input behind it */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-900 pointer-events-none">
                    <CalendarIcon />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Time
                </label>
                <div
                  className="relative group cursor-pointer"
                  onClick={() => handleOpenPicker(timeRef)}
                >
                  <input
                    ref={timeRef}
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent rounded-2xl p-4 text-sm font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-900 pointer-events-none">
                    <ClockIcon />
                  </div>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-100 border-2 border-transparent rounded-2xl p-4 text-sm font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                WhatsApp Number
              </label>
              <input
                value={customerWa}
                onChange={(e) => setCustomerWa(e.target.value)}
                placeholder="e.g. 201234567890"
                inputMode="numeric"
                className="w-full bg-slate-100 border-2 border-transparent rounded-2xl p-4 text-sm font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions?"
                rows={2}
                className="w-full bg-slate-100 border-2 border-transparent rounded-2xl p-4 text-sm font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none resize-none"
              />
            </div>

            {/* Error Indicator */}
            {validationError && (
              <div className="flex items-center gap-2 px-2 py-1 transition-all animate-in fade-in slide-in-from-left-2">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
                  {validationError}
                </span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600">
                {error}
              </div>
            )}
          </div>

          <footer className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <span className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">
                Grand Total
              </span>
              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                {total} EGP
              </span>
            </div>

            <button
              onClick={placeOrder}
              disabled={!canSubmit}
              className={`w-full py-5 rounded-[2.5rem] font-black text-sm transition-all active:scale-95 shadow-xl ${
                canSubmit
                  ? "bg-slate-900 text-white shadow-slate-200"
                  : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
              }`}
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Place Order on WhatsApp"
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full mt-5 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
            >
              Go Back
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
