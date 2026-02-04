import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

function formatStatus(s) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function OrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();
  const [prevStatus, setPrevStatus] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const ref = doc(db, "orders", orderId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setLoading(false);
        if (!snap.exists()) {
          setErr("Order not found.");
          setOrder(null);
          return;
        }
        setErr("");
        const next = { id: snap.id, ...snap.data() };
        setOrder(next);

        // Toast when status changes to ready
        const nextStatus = next?.status || null;
        if (prevStatus && nextStatus && prevStatus !== nextStatus) {
          if (nextStatus === "ready") {
            toast.push({
              title: "Order is ready ✅",
              message: "You can pick it up now.",
              variant: "success",
            });
          }
          if (nextStatus === "cancelled") {
            toast.push({
              title: "Order cancelled",
              message: "This order has been cancelled.",
              variant: "warning",
            });
          }
        }
        setPrevStatus(nextStatus);
      },
      (e) => {
        console.error(e);
        setLoading(false);
        setErr("Failed to load order.");
      },
    );

    return () => unsub();
  }, [orderId]);

  const canCancel = useMemo(() => {
    return order?.status === "pending";
  }, [order]);

  const cancelOrder = async () => {
    if (!canCancel) return;
    try {
      setCancelling(true);
      const ref = doc(db, "orders", orderId);
      await updateDoc(ref, {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
      });
      toast.push({
        title: "Order cancelled",
        message: "Your order has been cancelled.",
        variant: "warning",
      });
    } catch (e) {
      console.error(e);
      alert("Cancel failed. Check Firestore rules.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
          >
            ← Back
          </button>
          <div className="text-sm font-semibold">Order Status</div>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-10 pt-4">
        {loading ? (
          <div className="rounded-3xl border border-black/10 bg-white p-4 text-sm">
            Loading...
          </div>
        ) : err ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {err}
          </div>
        ) : (
          <>
            <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-xs text-zinc-500">Order ID</div>
              <div className="mt-1 font-mono text-sm">{order.id}</div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-zinc-500">Status</div>
                  <div className="mt-1 text-sm font-semibold">
                    {formatStatus(order.status)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Date</div>
                  <div className="mt-1 text-sm font-semibold">
                    {order?.scheduled?.date || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Time</div>
                  <div className="mt-1 text-sm font-semibold">
                    {order?.scheduled?.time || "—"}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold">Items</div>
              <div className="mt-3 space-y-2">
                {(order.items || []).map((it, idx) => (
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
                    <div className="font-semibold">{it.qty * it.price} EGP</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                <div className="text-sm font-semibold">Total</div>
                <div className="text-sm font-semibold">{order.total} EGP</div>
              </div>
            </section>

            <section className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={cancelOrder}
                disabled={!canCancel || cancelling}
                className={[
                  "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold active:scale-[0.99]",
                  canCancel
                    ? "border border-rose-200 bg-rose-50 text-rose-900"
                    : "border border-black/10 bg-white text-zinc-400",
                ].join(" ")}
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </section>

            <div className="mt-3 text-xs text-zinc-500">
              Cancel is allowed only while status is <b>pending</b>.
            </div>
          </>
        )}
      </main>
    </div>
  );
}
