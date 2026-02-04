import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { t } from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useToast } from "../components/ToastProvider";
import AdminMenu from "./AdminMenu";
import { Link } from "react-router-dom";

function StatusLabel({ status, lang }) {
  const map = {
    pending: t(lang, "pending"),
    preparing: t(lang, "preparing"),
    ready: t(lang, "ready"),
    cancelled: t(lang, "cancelled"),
  };
  return map[status] || status || "—";
}

function beep() {
  // No file needed; works on modern browsers
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close?.();
    }, 140);
  } catch {
    // ignore
  }
}

function buildWaLink(phone, text) {
  if (!phone) return null;
  const safe = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${safe}`;
}

export default function AdminDashboard({ lang, setLang }) {
  const [tab, setTab] = useState("orders"); // orders | settings
  const [filter, setFilter] = useState("all"); // all|pending|preparing|ready|cancelled
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    isOpen: true,
    acceptingOrders: true,
  });
  const toast = useToast();

  const [selectedId, setSelectedId] = useState(null);

  const prevIdsRef = useRef(new Set());
  const firstLoadRef = useRef(true);

  // Live settings
  useEffect(() => {
    const ref = doc(db, "settings", "main");
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setSettings((p) => ({ ...p, ...snap.data() }));
    });
  }, []);

  // Live orders (admin only)
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(80),
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);

      // Sound notification for NEW orders (only after first load)
      const currentIds = new Set(list.map((x) => x.id));
      if (firstLoadRef.current) {
        prevIdsRef.current = currentIds;
        firstLoadRef.current = false;
        return;
      }

      let hasNewPending = false;
      for (const o of list) {
        if (!prevIdsRef.current.has(o.id) && o.status === "pending") {
          hasNewPending = true;

          break;
        }
      }
      prevIdsRef.current = currentIds;
      if (hasNewPending) {
        beep();
        toast.push({
          title: t(lang, "newOrder"),
          message: "New pending order arrived.",
          variant: "success",
          actionLabel: "Open orders",
          onAction: () => {
            setTab("orders");
            setSelectedId(null);
          },
        });
      }
    });
  }, []);

  const setOrderStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
    toast.push({
      title: "Status updated",
      message: `Order ${id} → ${status}`,
      variant: "default",
    });
  };

  const toggleSetting = async (key) => {
    const ref = doc(db, "settings", "main");
    await updateDoc(ref, { [key]: !settings[key] });
  };

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedId) || null;
  }, [orders, selectedId]);

  const closeDetails = () => setSelectedId(null);

  const replyLink = useMemo(() => {
    const phone = selectedOrder?.customer?.whatsapp;
    if (!phone) return null;

    const items = (selectedOrder.items || [])
      .map(
        (it) =>
          `- ${it?.name?.en || it.id} x${it.qty} = ${it.qty * it.price} EGP`,
      )
      .join("\n");

    const track =
      selectedOrder.trackUrl ||
      `${window.location.origin}/order/${selectedOrder.id}`;

    const msg =
      `✅ Update for your order\n` +
      `Order ID: ${selectedOrder.id}\n` +
      `Status: ${selectedOrder.status}\n` +
      `Time: ${selectedOrder?.scheduled?.date || ""} ${selectedOrder?.scheduled?.time || ""}\n\n` +
      `Items:\n${items}\n\n` +
      `Total: ${selectedOrder.total} EGP\n\n` +
      `Track/Cancel: ${track}`;

    return buildWaLink(phone, msg);
  }, [selectedOrder]);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-base font-semibold">{t(lang, "admin")}</div>

            {/* Desktop tabs */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-black/10 bg-white/70 p-1">
              <button
                type="button"
                onClick={() => setTab("orders")}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  tab === "orders"
                    ? "bg-black text-white"
                    : "text-zinc-700 hover:bg-black/5",
                ].join(" ")}
              >
                {t(lang, "orders")}
              </button>

              <button
                type="button"
                onClick={() => setTab("menu")}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  tab === "menu"
                    ? "bg-black text-white"
                    : "bg-black/10 text-zinc-800",
                ].join(" ")}
              >
                Menu
              </button>

              <button
                type="button"
                onClick={() => setTab("settings")}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  tab === "settings"
                    ? "bg-black text-white"
                    : "text-zinc-700 hover:bg-black/5",
                ].join(" ")}
              >
                {t(lang, "settings")}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Back to Home */}
            <Link
              to="/"
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-black/5 active:scale-[0.98]"
            >
              Home
            </Link>

            <LanguageSwitcher lang={lang} setLang={setLang} />

            <button
              type="button"
              onClick={() => signOut(auth)}
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
            >
              {t(lang, "signOut")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          {/* Sidebar (desktop/tablet) */}
          <aside className="hidden md:block space-y-3">
            <div className="rounded-3xl border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold">{t(lang, "settings")}</div>
              <div className="mt-3 space-y-3">
                <button
                  type="button"
                  onClick={() => toggleSetting("isOpen")}
                  className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold active:scale-[0.99]"
                >
                  <span>{t(lang, "openStatus")}</span>
                  <span className="text-xs text-zinc-600">
                    {settings.isOpen ? t(lang, "open") : t(lang, "closed")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSetting("acceptingOrders")}
                  className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold active:scale-[0.99]"
                >
                  <span>{t(lang, "acceptingOrders")}</span>
                  <span className="text-xs text-zinc-600">
                    {settings.acceptingOrders ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold">{t(lang, "filter")}</div>
              <div className="mt-3 grid gap-2">
                {["all", "pending", "preparing", "ready", "cancelled"].map(
                  (k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setFilter(k)}
                      className={[
                        "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold active:scale-[0.99]",
                        filter === k
                          ? "bg-black text-white border-black"
                          : "bg-white border-black/10 text-zinc-800",
                      ].join(" ")}
                    >
                      <span>
                        {k === "all" ? (
                          t(lang, "allOrders")
                        ) : (
                          <StatusLabel status={k} lang={lang} />
                        )}
                      </span>
                      <span
                        className={
                          filter === k
                            ? "text-white/80 text-xs"
                            : "text-zinc-500 text-xs"
                        }
                      >
                        {k === "all"
                          ? orders.length
                          : orders.filter((o) => o.status === k).length}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>
          </aside>

          {/* Main */}
          <section className="space-y-4">
            {tab === "settings" ? (
              <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold">
                  {t(lang, "settings")}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => toggleSetting("isOpen")}
                    className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold active:scale-[0.99]"
                  >
                    <span>{t(lang, "openStatus")}</span>
                    <span className="text-xs text-zinc-600">
                      {settings.isOpen ? t(lang, "open") : t(lang, "closed")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSetting("acceptingOrders")}
                    className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold active:scale-[0.99]"
                  >
                    <span>{t(lang, "acceptingOrders")}</span>
                    <span className="text-xs text-zinc-600">
                      {settings.acceptingOrders ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
              </div>
            ) : tab === "menu" ? (
              <AdminMenu lang={lang} />
            ) : (
              <>
                {/* Mobile filter chips */}
                <div className="md:hidden rounded-3xl border border-black/10 bg-white p-3">
                  <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                    {["all", "pending", "preparing", "ready", "cancelled"].map(
                      (k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setFilter(k)}
                          className={[
                            "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold active:scale-[0.98]",
                            filter === k
                              ? "bg-black text-white border-black"
                              : "bg-white border-black/10 text-zinc-700",
                          ].join(" ")}
                        >
                          {k === "all" ? (
                            t(lang, "allOrders")
                          ) : (
                            <StatusLabel status={k} lang={lang} />
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Orders list */}
                <div className="space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className="rounded-3xl border border-black/10 bg-white p-4 text-sm">
                      {t(lang, "noOrders")}
                    </div>
                  ) : (
                    filteredOrders.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelectedId(o.id)}
                        className="w-full text-left rounded-3xl border border-black/10 bg-white p-4 shadow-sm active:scale-[0.995]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-mono text-xs text-zinc-500">
                              {o.id}
                            </div>
                            <div className="mt-1 text-sm font-semibold">
                              {o?.customer?.name || "—"}
                            </div>
                            <div className="mt-1 text-xs text-zinc-600">
                              {o?.scheduled?.date} • {o?.scheduled?.time} •{" "}
                              {o.total} EGP
                            </div>
                          </div>
                          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold">
                            <StatusLabel status={o.status} lang={lang} />
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-white/90 backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-around px-3 py-2">
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold",
              tab === "orders" ? "bg-black text-white" : "text-zinc-700",
            ].join(" ")}
          >
            {t(lang, "orders")}
          </button>

          <button
            type="button"
            onClick={() => setTab("menu")}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold",
              tab === "menu" ? "bg-black text-white" : "text-zinc-700",
            ].join(" ")}
          >
            Menu
          </button>

          <button
            type="button"
            onClick={() => setTab("settings")}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold",
              tab === "settings" ? "bg-black text-white" : "text-zinc-700",
            ].join(" ")}
          >
            {t(lang, "settings")}
          </button>
        </div>
      </nav>

      {/* Details panel (drawer on mobile, side panel on desktop) */}
      {selectedOrder ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            onClick={closeDetails}
            className="absolute inset-0 bg-black/30"
            aria-label="Close details"
          />

          <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-0 md:right-0 md:left-auto md:h-full md:w-[420px]">
            <div className="h-full rounded-t-3xl md:rounded-none md:rounded-l-3xl border border-black/10 bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                <div className="text-sm font-semibold">
                  {t(lang, "orderDetails")}
                </div>
                <button
                  type="button"
                  onClick={closeDetails}
                  className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
                >
                  Close
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-auto max-h-[75vh] md:max-h-none md:h-[calc(100%-56px)]">
                <div className="rounded-3xl border border-black/10 bg-zinc-50 p-3">
                  <div className="font-mono text-xs text-zinc-500">
                    {selectedOrder.id}
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {selectedOrder?.customer?.name || "—"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    {selectedOrder?.scheduled?.date} •{" "}
                    {selectedOrder?.scheduled?.time}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Status</span>
                    <span className="text-xs font-semibold">
                      <StatusLabel status={selectedOrder.status} lang={lang} />
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-white p-3">
                  <div className="text-sm font-semibold">Items</div>
                  <div className="mt-2 space-y-2">
                    {(selectedOrder.items || []).map((it, idx) => (
                      <div
                        key={`${it.id}-${idx}`}
                        className="flex items-center justify-between rounded-2xl border border-black/5 bg-zinc-50 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-semibold">
                            {it?.name?.en || it.id}
                          </div>
                          <div className="text-xs text-zinc-500">
                            Qty: {it.qty} • {it.price} EGP
                          </div>
                        </div>
                        <div className="font-semibold">
                          {it.qty * it.price} EGP
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                    <div className="text-sm font-semibold">
                      {t(lang, "total")}
                    </div>
                    <div className="text-sm font-semibold">
                      {selectedOrder.total} EGP
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-white p-3">
                  <div className="text-sm font-semibold">
                    {t(lang, "markAs")}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["pending", "preparing", "ready", "cancelled"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setOrderStatus(selectedOrder.id, s)}
                        className={[
                          "rounded-full px-3 py-2 text-xs font-semibold active:scale-[0.98] border",
                          s === "cancelled"
                            ? "border-rose-200 bg-rose-50 text-rose-900"
                            : "border-black/10 bg-white text-zinc-800",
                        ].join(" ")}
                      >
                        <StatusLabel status={s} lang={lang} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-white p-3">
                  <div className="text-sm font-semibold">
                    {t(lang, "replyCustomer")}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {selectedOrder?.customer?.whatsapp
                      ? selectedOrder.customer.whatsapp
                      : "No customer WhatsApp saved in this order."}
                  </div>

                  <button
                    type="button"
                    disabled={!replyLink}
                    onClick={() =>
                      replyLink &&
                      window.open(replyLink, "_blank", "noopener,noreferrer")
                    }
                    className={[
                      "mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold active:scale-[0.99]",
                      replyLink
                        ? "bg-black text-white"
                        : "bg-black/20 text-white/70",
                    ].join(" ")}
                  >
                    {t(lang, "openWhatsApp")}
                  </button>

                  <button
                    type="button"
                    disabled={!replyLink || selectedOrder.status !== "ready"}
                    onClick={() =>
                      replyLink &&
                      window.open(replyLink, "_blank", "noopener,noreferrer")
                    }
                    className={[
                      "mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold active:scale-[0.99]",
                      replyLink && selectedOrder.status === "ready"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-600/20 text-white/70",
                    ].join(" ")}
                  >
                    Notify customer (Ready)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
