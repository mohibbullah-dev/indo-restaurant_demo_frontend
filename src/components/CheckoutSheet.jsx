// import { useEffect, useMemo, useRef, useState } from "react";
// import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
// import { t } from "../i18n";
// import {
//   buildLocalISO,
//   isAtLeastMinutesFromNow,
//   todayISODate,
// } from "../utils/time";
// import { db } from "../firebase";
// import { useToast } from "./ToastProvider";

// function buildWhatsAppLink({ phone, text }) {
//   const safeText = encodeURIComponent(text);
//   const base = phone ? `https://wa.me/${phone}` : "https://wa.me/";
//   return `${base}?text=${safeText}`;
// }

// function ClockIcon({ className = "h-5 w-5" }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className={className}
//       aria-hidden="true"
//     >
//       <path
//         d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
//         stroke="currentColor"
//         strokeWidth="1.8"
//       />
//       <path
//         d="M12 6v6l4 2"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }

// function CalendarIcon({ className = "h-5 w-5" }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       className={className}
//       aria-hidden="true"
//     >
//       <path
//         d="M8 2v3M16 2v3"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//       <path
//         d="M3.5 9h17"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//       <path
//         d="M6.5 4.5h11A3 3 0 0 1 20.5 7.5v11A3 3 0 0 1 17.5 21.5h-11A3 3 0 0 1 3.5 18.5v-11A3 3 0 0 1 6.5 4.5Z"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }

// // Try to open native picker if supported, otherwise just focus
// function focusAndTryPicker(inputEl) {
//   if (!inputEl) return;
//   inputEl.focus();
//   if (typeof inputEl.showPicker === "function") {
//     try {
//       inputEl.showPicker();
//     } catch {
//       // Some browsers block showPicker; focus is still helpful
//     }
//   }
// }

// export default function CheckoutSheet({
//   lang,
//   open,
//   onClose,
//   cart,
//   total,
//   restaurantWhatsAppNumber,
//   settings,
//   onOrderCreated,
// }) {
//   const toast = useToast();

//   const [date, setDate] = useState(todayISODate()); // YYYY-MM-DD
//   const [time, setTime] = useState(""); // "HH:MM"
//   const [name, setName] = useState("");
//   const [notes, setNotes] = useState("");
//   const [customerWa, setCustomerWa] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const dateRef = useRef(null);
//   const timeRef = useRef(null);

//   const itemsArray = useMemo(() => Object.values(cart), [cart]);

//   // digits only for WhatsApp
//   const waClean = useMemo(() => customerWa.replace(/[^\d]/g, ""), [customerWa]);

//   // Required fields
//   const canSubmitBase = useMemo(() => {
//     return (
//       itemsArray.length > 0 &&
//       !!date &&
//       !!time &&
//       name.trim().length > 0 &&
//       waClean.length > 0
//     );
//   }, [itemsArray.length, date, time, name, waClean]);

//   useEffect(() => {
//     if (open) {
//       setCopied(false);
//       setSaving(false);
//       setError("");
//       setDate(todayISODate());
//       setTime("");
//       setName("");
//       setNotes("");
//       setCustomerWa("");
//     }
//   }, [open]);

//   const tooSoon = useMemo(() => {
//     if (!date || !time) return false;
//     return !isAtLeastMinutesFromNow(date, time, settings?.minLeadMinutes ?? 0);
//   }, [date, time, settings]);

//   const canSubmit = canSubmitBase && !tooSoon && !saving;

//   const copyLink = async (link) => {
//     try {
//       await navigator.clipboard.writeText(link);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1200);
//       toast.push({
//         title: "Copied",
//         message: "Link copied to clipboard.",
//         variant: "default",
//       });
//     } catch {
//       // ignore
//     }
//   };

//   const validateRequired = () => {
//     if (itemsArray.length === 0) {
//       toast.push({
//         title: "Cart empty",
//         message: "Add items first.",
//         variant: "warning",
//       });
//       return false;
//     }
//     if (!date) {
//       toast.push({
//         title: "Missing date",
//         message: "Please choose a date.",
//         variant: "warning",
//       });
//       return false;
//     }
//     if (!time) {
//       toast.push({
//         title: "Missing time",
//         message: "Please choose a time.",
//         variant: "warning",
//       });
//       return false;
//     }
//     if (!name.trim()) {
//       toast.push({
//         title: "Name required",
//         message: "Please enter your name.",
//         variant: "warning",
//       });
//       return false;
//     }
//     if (!waClean) {
//       toast.push({
//         title: "WhatsApp required",
//         message: "Please enter your WhatsApp number (digits only).",
//         variant: "warning",
//       });
//       return false;
//     }
//     return true;
//   };

//   const placeOrder = async () => {
//     setError("");

//     if (!validateRequired()) return;

//     if (tooSoon) {
//       const mins = settings?.minLeadMinutes ?? 0;
//       setError(t(lang, "tooSoon"));
//       toast.push({
//         title: t(lang, "tooSoon"),
//         message: mins
//           ? `Minimum lead time is ${mins} minutes.`
//           : "Please choose a later time.",
//         variant: "warning",
//       });
//       return;
//     }

//     try {
//       setSaving(true);

//       const scheduledAtIso = buildLocalISO(date, time);

//       // create doc first to get orderId
//       const ref = doc(collection(db, "orders"));
//       const orderId = ref.id;

//       const trackUrl = `${window.location.origin}/order/${orderId}`;

//       // WhatsApp message to restaurant
//       const lines = [];
//       lines.push("🧾 NEW ORDER");
//       lines.push(`🆔 Order ID: ${orderId}`);
//       lines.push(`📅 Date: ${date}`);
//       lines.push(`⏰ Time: ${time}`);
//       lines.push(`👤 Name: ${name.trim()}`);
//       if (notes.trim()) lines.push(`📝 Notes: ${notes.trim()}`);
//       lines.push("");
//       lines.push("Items:");
//       for (const it of itemsArray) {
//         const label = it.name?.[lang] || it.name?.en || it.id;
//         lines.push(`- ${label} x${it.qty} = ${it.qty * it.price} EGP`);
//       }
//       lines.push("");
//       lines.push(`💰 Total: ${total} EGP`);
//       lines.push("");
//       lines.push(`🔎 Track/Cancel: ${trackUrl}`);

//       const orderText = lines.join("\n");

//       const waLink = buildWhatsAppLink({
//         phone: restaurantWhatsAppNumber,
//         text: orderText,
//       });

//       const payload = {
//         id: orderId,
//         channel: "whatsapp",
//         customer: {
//           name: name.trim(),
//           notes: notes.trim() || null,
//           whatsapp: waClean,
//         },
//         items: itemsArray.map((x) => ({
//           id: x.id,
//           qty: x.qty,
//           price: x.price,
//           name: x.name,
//         })),
//         total,
//         status: "pending",
//         scheduled: {
//           date,
//           time,
//           scheduledAtIso,
//           timezone: settings?.timezone || "Africa/Cairo",
//           minLeadMinutes: settings?.minLeadMinutes ?? 0,
//         },
//         trackUrl,
//         createdAt: serverTimestamp(),
//         wa: {
//           to: restaurantWhatsAppNumber || null,
//           prefillText: orderText,
//           prefillLink: waLink,
//         },
//       };

//       await setDoc(ref, payload);

//       onOrderCreated?.({ ...payload });

//       window.open(waLink, "_blank", "noopener,noreferrer");
//     } catch (e) {
//       console.error(e);
//       setError("Failed to save order. Check Firestore rules / config.");
//       toast.push({
//         title: "Failed to save",
//         message: "Please try again.",
//         variant: "danger",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-40">
//       {/* Hide native picker icons (Chrome/Edge) so we don't get double icons */}
//       <style>{`
//         input[type="date"]::-webkit-calendar-picker-indicator,
//         input[type="time"]::-webkit-calendar-picker-indicator {
//           opacity: 0;
//           display: none;
//         }
//         input[type="date"], input[type="time"] { appearance: none; }
//       `}</style>

//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-black/30 z-0"
//         onClick={onClose}
//         aria-hidden="true"
//       />

//       {/* Sheet */}
//       <div className="absolute bottom-0 left-0 right-0 z-10">
//         <div className="mx-auto w-full max-w-5xl px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
//           <div
//             className="rounded-t-3xl border border-black/10 bg-white shadow-xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex justify-center pt-3">
//               <div className="h-1.5 w-12 rounded-full bg-black/10" />
//             </div>

//             <div className="flex items-center justify-between px-4 pb-3 pt-3">
//               <div className="text-sm font-semibold">
//                 {t(lang, "checkoutTitle")}
//               </div>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
//               >
//                 {t(lang, "cancel")}
//               </button>
//             </div>

//             <div className="px-4 pb-4">
//               <div className="grid gap-3 sm:grid-cols-2">
//                 {/* Date with single icon */}
//                 <label className="grid gap-1">
//                   <span className="text-xs font-semibold text-zinc-700">
//                     {t(lang, "date")}
//                   </span>

//                   <div
//                     className="relative"
//                     onMouseDown={() => focusAndTryPicker(dateRef.current)}
//                     onTouchStart={() => focusAndTryPicker(dateRef.current)}
//                   >
//                     <input
//                       ref={dateRef}
//                       type="date"
//                       value={date}
//                       min={todayISODate()}
//                       onChange={(e) => setDate(e.target.value)}
//                       className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-black/30"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => focusAndTryPicker(dateRef.current)}
//                       className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white p-2 text-zinc-700 active:scale-[0.98]"
//                       aria-label="Pick date"
//                       title="Pick date"
//                     >
//                       <CalendarIcon className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </label>

//                 {/* Time with single icon */}
//                 <label className="grid gap-1">
//                   <span className="text-xs font-semibold text-zinc-700">
//                     {t(lang, "time")}
//                   </span>

//                   <div
//                     className="relative"
//                     onMouseDown={() => focusAndTryPicker(timeRef.current)}
//                     onTouchStart={() => focusAndTryPicker(timeRef.current)}
//                   >
//                     <input
//                       ref={timeRef}
//                       type="time"
//                       value={time}
//                       onChange={(e) => setTime(e.target.value)}
//                       step={300}
//                       className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-black/30"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => focusAndTryPicker(timeRef.current)}
//                       className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white p-2 text-zinc-700 active:scale-[0.98]"
//                       aria-label="Pick time"
//                       title="Pick time"
//                     >
//                       <ClockIcon className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </label>
//               </div>

//               <div className="mt-4 grid gap-3">
//                 <label className="grid gap-1">
//                   <span className="text-xs font-semibold text-zinc-700">
//                     Name <span className="text-rose-600">*</span>
//                   </span>
//                   <input
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//                     placeholder="Your name"
//                     required
//                   />
//                 </label>

//                 <label className="grid gap-1">
//                   <span className="text-xs font-semibold text-zinc-700">
//                     {t(lang, "notesOptional")}
//                   </span>
//                   <input
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                     className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//                     placeholder={t(lang, "notesOptional")}
//                   />
//                 </label>

//                 <label className="grid gap-1">
//                   <span className="text-xs font-semibold text-zinc-700">
//                     {t(lang, "customerWhatsApp")}{" "}
//                     <span className="text-rose-600">*</span>
//                   </span>
//                   <input
//                     value={customerWa}
//                     onChange={(e) => setCustomerWa(e.target.value)}
//                     className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//                     placeholder="201234567890"
//                     inputMode="numeric"
//                     required
//                   />
//                   <div className="text-[11px] text-zinc-500">
//                     Digits only (no +, no spaces). Example: 201234567890
//                   </div>
//                 </label>
//               </div>

//               {tooSoon ? (
//                 <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
//                   {t(lang, "tooSoon")}{" "}
//                   {settings?.minLeadMinutes
//                     ? `(${settings.minLeadMinutes} min)`
//                     : ""}
//                 </div>
//               ) : null}

//               {error ? (
//                 <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
//                   {error}
//                 </div>
//               ) : null}

//               <div className="mt-4 flex items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={placeOrder}
//                   disabled={!canSubmit}
//                   className={[
//                     "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm active:scale-[0.99]",
//                     canSubmit
//                       ? "bg-black text-white"
//                       : "bg-black/20 text-white/70",
//                   ].join(" ")}
//                 >
//                   {saving ? t(lang, "saving") : t(lang, "placeOrder")}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => copyLink(`${window.location.origin}/`)}
//                   className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 active:scale-[0.99]"
//                   title={t(lang, "copyLink")}
//                 >
//                   {copied ? t(lang, "copied") : t(lang, "copyLink")}
//                 </button>
//               </div>

//               <div className="mt-3 text-sm font-semibold">
//                 {t(lang, "total")}: {total} EGP
//               </div>

//               <div className="mt-2 text-xs text-zinc-500">
//                 {t(lang, "whatsAppPrefillHint")}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
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
