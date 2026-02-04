// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useToast } from "../components/ToastProvider";
// import {
//   doc,
//   onSnapshot,
//   updateDoc,
//   serverTimestamp,
// } from "firebase/firestore";
// import { db } from "../firebase";

// function formatStatus(s) {
//   if (!s) return "—";
//   return s.charAt(0).toUpperCase() + s.slice(1);
// }

// export default function OrderPage() {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [cancelling, setCancelling] = useState(false);
//   const toast = useToast();
//   const [prevStatus, setPrevStatus] = useState(null);

//   useEffect(() => {
//     if (!orderId) return;

//     const ref = doc(db, "orders", orderId);
//     const unsub = onSnapshot(
//       ref,
//       (snap) => {
//         setLoading(false);
//         if (!snap.exists()) {
//           setErr("Order not found.");
//           setOrder(null);
//           return;
//         }
//         setErr("");
//         const next = { id: snap.id, ...snap.data() };
//         setOrder(next);

//         // Toast when status changes to ready
//         const nextStatus = next?.status || null;
//         if (prevStatus && nextStatus && prevStatus !== nextStatus) {
//           if (nextStatus === "ready") {
//             toast.push({
//               title: "Order is ready ✅",
//               message: "You can pick it up now.",
//               variant: "success",
//             });
//           }
//           if (nextStatus === "cancelled") {
//             toast.push({
//               title: "Order cancelled",
//               message: "This order has been cancelled.",
//               variant: "warning",
//             });
//           }
//         }
//         setPrevStatus(nextStatus);
//       },
//       (e) => {
//         console.error(e);
//         setLoading(false);
//         setErr("Failed to load order.");
//       },
//     );

//     return () => unsub();
//   }, [orderId]);

//   const canCancel = useMemo(() => {
//     return order?.status === "pending";
//   }, [order]);

//   const cancelOrder = async () => {
//     if (!canCancel) return;
//     try {
//       setCancelling(true);
//       const ref = doc(db, "orders", orderId);
//       await updateDoc(ref, {
//         status: "cancelled",
//         cancelledAt: serverTimestamp(),
//       });
//       toast.push({
//         title: "Order cancelled",
//         message: "Your order has been cancelled.",
//         variant: "warning",
//       });
//     } catch (e) {
//       console.error(e);
//       alert("Cancel failed. Check Firestore rules.");
//     } finally {
//       setCancelling(false);
//     }
//   };

//   return (
//     <div className="min-h-dvh bg-zinc-50 text-zinc-900">
//       <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur">
//         <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
//           <button
//             type="button"
//             onClick={() => navigate("/")}
//             className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
//           >
//             ← Back
//           </button>
//           <div className="text-sm font-semibold">Order Status</div>
//           <div className="w-16" />
//         </div>
//       </header>

//       <main className="mx-auto w-full max-w-3xl px-4 pb-10 pt-4">
//         {loading ? (
//           <div className="rounded-3xl border border-black/10 bg-white p-4 text-sm">
//             Loading...
//           </div>
//         ) : err ? (
//           <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
//             {err}
//           </div>
//         ) : (
//           <>
//             <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
//               <div className="text-xs text-zinc-500">Order ID</div>
//               <div className="mt-1 font-mono text-sm">{order.id}</div>

//               <div className="mt-4 grid gap-3 sm:grid-cols-3">
//                 <div>
//                   <div className="text-xs text-zinc-500">Status</div>
//                   <div className="mt-1 text-sm font-semibold">
//                     {formatStatus(order.status)}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-xs text-zinc-500">Date</div>
//                   <div className="mt-1 text-sm font-semibold">
//                     {order?.scheduled?.date || "—"}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-xs text-zinc-500">Time</div>
//                   <div className="mt-1 text-sm font-semibold">
//                     {order?.scheduled?.time || "—"}
//                   </div>
//                 </div>
//               </div>
//             </section>

//             <section className="mt-4 rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
//               <div className="text-sm font-semibold">Items</div>
//               <div className="mt-3 space-y-2">
//                 {(order.items || []).map((it, idx) => (
//                   <div
//                     key={`${it.id}-${idx}`}
//                     className="flex items-center justify-between rounded-2xl border border-black/5 bg-zinc-50 px-3 py-2 text-sm"
//                   >
//                     <div className="min-w-0">
//                       <div className="truncate font-semibold">
//                         {it?.name?.en || it.id}
//                       </div>
//                       <div className="text-xs text-zinc-500">
//                         Qty: {it.qty} • {it.price} EGP
//                       </div>
//                     </div>
//                     <div className="font-semibold">{it.qty * it.price} EGP</div>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
//                 <div className="text-sm font-semibold">Total</div>
//                 <div className="text-sm font-semibold">{order.total} EGP</div>
//               </div>
//             </section>

//             <section className="mt-4 flex gap-2">
//               <button
//                 type="button"
//                 onClick={cancelOrder}
//                 disabled={!canCancel || cancelling}
//                 className={[
//                   "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold active:scale-[0.99]",
//                   canCancel
//                     ? "border border-rose-200 bg-rose-50 text-rose-900"
//                     : "border border-black/10 bg-white text-zinc-400",
//                 ].join(" ")}
//               >
//                 {cancelling ? "Cancelling..." : "Cancel Order"}
//               </button>
//             </section>

//             <div className="mt-3 text-xs text-zinc-500">
//               Cancel is allowed only while status is <b>pending</b>.
//             </div>
//           </>
//         )}
//       </main>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../components/ToastProvider";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-900 border-amber-200",
  ready: "bg-emerald-100 text-emerald-900 border-emerald-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  cancelled: "bg-rose-100 text-rose-900 border-rose-200",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("active"); // active | completed | all
  const toast = useToast();

  useEffect(() => {
    // We order by createdAt so new orders appear at the top
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.push({
        title: "Order Updated",
        message: `Order marked as ${newStatus}`,
        variant: "success",
      });
    } catch (e) {
      toast.push({
        title: "Update Failed",
        message: "Check Firestore permissions.",
        variant: "danger",
      });
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "active")
      return o.status === "pending" || o.status === "ready";
    if (filter === "completed")
      return o.status === "completed" || o.status === "cancelled";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header & Stats */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            Order Management
          </h1>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">
            Real-time Kitchen Display
          </p>
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-2xl border border-black/5">
          {["active", "completed", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                filter === f
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`group relative overflow-hidden rounded-3xl border bg-white p-5 transition-all shadow-sm ${
              order.status === "pending"
                ? "border-amber-200 ring-4 ring-amber-500/5"
                : "border-black/5"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              {/* Order Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_COLORS[order.status]}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-mono text-xs text-zinc-400">
                    #{order.id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-bold text-zinc-900">
                    {order.scheduled?.date} at {order.scheduled?.time}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {order.customer?.name || "Guest User"} •{" "}
                    {order.customer?.phone || "No phone"}
                  </div>
                </div>

                {/* Items List */}
                <div className="flex flex-wrap gap-2">
                  {order.items?.map((it, i) => (
                    <div
                      key={i}
                      className="bg-zinc-50 border border-black/5 rounded-xl px-3 py-2 flex items-center gap-2"
                    >
                      <span className="h-5 w-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                        {it.qty}
                      </span>
                      <span className="text-xs font-semibold text-zinc-700">
                        {it.name?.en}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col justify-end gap-2 min-w-[140px]">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateStatus(order.id, "ready")}
                    className="w-full bg-emerald-600 text-white rounded-2xl py-3 text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === "ready" && (
                  <button
                    onClick={() => updateStatus(order.id, "completed")}
                    className="w-full bg-black text-white rounded-2xl py-3 text-xs font-bold active:scale-95 transition-all"
                  >
                    Complete Order
                  </button>
                )}
                {(order.status === "pending" || order.status === "ready") && (
                  <button
                    onClick={() => updateStatus(order.id, "cancelled")}
                    className="w-full bg-white border border-rose-100 text-rose-600 rounded-2xl py-3 text-xs font-bold hover:bg-rose-50 transition-all"
                  >
                    Cancel
                  </button>
                )}
                {order.status === "completed" && (
                  <div className="text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest p-2">
                    Archived
                  </div>
                )}
              </div>
            </div>

            {/* Total Badge */}
            <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">
                Payment on Pickup
              </div>
              <div className="text-lg font-black text-zinc-900">
                {order.total} EGP
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="py-20 text-center rounded-3xl border-2 border-dashed border-black/5">
            <div className="text-4xl mb-4">🥡</div>
            <p className="text-zinc-400 text-sm font-medium">
              No {filter} orders found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
