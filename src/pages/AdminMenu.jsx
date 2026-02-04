// import { useEffect, useMemo, useState } from "react";
// import {
//   addDoc,
//   collection,
//   deleteDoc,
//   doc,
//   onSnapshot,
//   orderBy,
//   query,
//   serverTimestamp,
//   updateDoc,
// } from "firebase/firestore";
// import { db } from "../firebase";
// import { useToast } from "../components/ToastProvider";
// import { uploadToCloudinary } from "../lib/cloudinary";

// function Input({ label, children }) {
//   return (
//     <label className="grid gap-1">
//       <span className="text-xs font-semibold text-zinc-700">{label}</span>
//       {children}
//     </label>
//   );
// }

// function pickLabel(obj, lang, fallback) {
//   if (!obj) return fallback;
//   return obj?.[lang] || obj?.en || obj?.id || obj?.ar || fallback;
// }

// export default function AdminMenu({ lang }) {
//   const toast = useToast();

//   const [cats, setCats] = useState([]);
//   const [items, setItems] = useState([]);

//   // Search
//   const [qText, setQText] = useState("");

//   // edit mode
//   const [editingId, setEditingId] = useState(null);

//   // form
//   const [categoryId, setCategoryId] = useState("");
//   const [price, setPrice] = useState("");
//   const [isActive, setIsActive] = useState(true);

//   const [nameEn, setNameEn] = useState("");
//   const [nameId, setNameId] = useState("");
//   const [nameAr, setNameAr] = useState("");

//   const [descEn, setDescEn] = useState("");
//   const [descId, setDescId] = useState("");
//   const [descAr, setDescAr] = useState("");

//   // image
//   const [imageUrl, setImageUrl] = useState(""); // stored URL (Cloudinary secure_url)
//   const [imageFile, setImageFile] = useState(null); // selected file
//   const [imagePreview, setImagePreview] = useState(""); // local preview
//   const [uploadPct, setUploadPct] = useState(0);
//   const [uploading, setUploading] = useState(false);

//   const [saving, setSaving] = useState(false);

//   // Load categories
//   useEffect(() => {
//     const qCats = query(collection(db, "categories"), orderBy("order", "asc"));
//     const unsub = onSnapshot(
//       qCats,
//       (snap) => {
//         const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//         setCats(rows);
//         if (!categoryId && rows[0]?.id) setCategoryId(rows[0].id);
//       },
//       (err) => {
//         console.error(err);
//         toast.push({
//           title: "Categories error",
//           message: "Failed to load categories (rules?)",
//           variant: "danger",
//         });
//       },
//     );
//     return () => unsub();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Load menu items
//   useEffect(() => {
//     const qItems = query(
//       collection(db, "menuItems"),
//       orderBy("createdAt", "desc"),
//     );
//     const unsub = onSnapshot(
//       qItems,
//       (snap) => {
//         const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//         setItems(rows);
//       },
//       (err) => {
//         console.error(err);
//         toast.push({
//           title: "Menu error",
//           message: "Failed to load menu items (rules?)",
//           variant: "danger",
//         });
//       },
//     );
//     return () => unsub();
//   }, [toast]);

//   const catMap = useMemo(() => {
//     const m = new Map();
//     for (const c of cats) m.set(c.id, c);
//     return m;
//   }, [cats]);

//   const filteredItems = useMemo(() => {
//     const q = qText.trim().toLowerCase();
//     if (!q) return items;
//     return items.filter((it) => {
//       const n = it?.name || {};
//       const d = it?.desc || {};
//       const blob = [
//         n.en,
//         n.id,
//         n.ar,
//         d.en,
//         d.id,
//         d.ar,
//         it.categoryId,
//         String(it.price ?? ""),
//       ]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();
//       return blob.includes(q);
//     });
//   }, [items, qText]);

//   const resetForm = () => {
//     setEditingId(null);
//     setPrice("");
//     setIsActive(true);

//     setNameEn("");
//     setNameId("");
//     setNameAr("");

//     setDescEn("");
//     setDescId("");
//     setDescAr("");

//     setImageUrl("");
//     setImageFile(null);
//     setImagePreview("");
//     setUploadPct(0);
//     setUploading(false);
//   };

//   const fillFormForEdit = (it) => {
//     setEditingId(it.id);
//     setCategoryId(it.categoryId || "");
//     setPrice(String(it.price ?? ""));
//     setIsActive(!!it.isActive);

//     setNameEn(it?.name?.en || "");
//     setNameId(it?.name?.id || "");
//     setNameAr(it?.name?.ar || "");

//     setDescEn(it?.desc?.en || "");
//     setDescId(it?.desc?.id || "");
//     setDescAr(it?.desc?.ar || "");

//     setImageUrl(it?.imageUrl || "");
//     setImageFile(null);
//     setImagePreview("");
//     setUploadPct(0);
//     setUploading(false);
//   };

//   const validate = () => {
//     const p = Number(price);
//     if (!categoryId) {
//       toast.push({
//         title: "Missing category",
//         message: "Pick a category.",
//         variant: "warning",
//       });
//       return false;
//     }
//     if (!nameEn.trim() || !nameId.trim() || !nameAr.trim()) {
//       toast.push({
//         title: "Missing name",
//         message: "Name is required in EN / ID / AR.",
//         variant: "warning",
//       });
//       return false;
//     }
//     if (!Number.isFinite(p) || p <= 0) {
//       toast.push({
//         title: "Invalid price",
//         message: "Enter a valid price number.",
//         variant: "warning",
//       });
//       return false;
//     }
//     return true;
//   };

//   const onPickImage = (file) => {
//     if (!file) return;
//     if (!file.type?.startsWith("image/")) {
//       toast.push({
//         title: "Invalid file",
//         message: "Please choose an image.",
//         variant: "warning",
//       });
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       toast.push({
//         title: "Image too big",
//         message: "Max 5MB. Choose smaller image.",
//         variant: "warning",
//       });
//       return;
//     }

//     setImageFile(file);
//     setUploadPct(0);

//     const url = URL.createObjectURL(file);
//     setImagePreview(url);
//   };

//   const uploadSelectedImage = async () => {
//     if (!imageFile) {
//       toast.push({
//         title: "No image",
//         message: "Choose an image first.",
//         variant: "warning",
//       });
//       return null;
//     }

//     try {
//       setUploading(true);
//       setUploadPct(0);

//       const data = await uploadToCloudinary(imageFile, {
//         onProgress: (pct) => setUploadPct(pct),
//       });

//       const url = data?.secure_url || data?.url || "";
//       if (!url) throw new Error("Cloudinary returned no image URL");

//       setImageUrl(url);
//       setImageFile(null);
//       setImagePreview("");
//       toast.push({
//         title: "Uploaded",
//         message: "Image uploaded to Cloudinary.",
//         variant: "success",
//       });

//       return url;
//     } catch (e) {
//       console.error(e);
//       toast.push({
//         title: "Upload failed",
//         message: e?.message || "Check Cloudinary preset / env vars.",
//         variant: "danger",
//       });
//       return null;
//     } finally {
//       setUploading(false);
//     }
//   };

//   const save = async () => {
//     if (!validate()) return;
//     if (saving || uploading) return;

//     try {
//       setSaving(true);

//       // If user selected a new file but didn't upload yet: upload now
//       let finalImageUrl = imageUrl.trim() || null;
//       if (imageFile) {
//         toast.push({
//           title: "Uploading",
//           message: "Uploading image...",
//           variant: "default",
//         });
//         const url = await uploadSelectedImage();
//         finalImageUrl = url || finalImageUrl;
//       }

//       const data = {
//         name: { en: nameEn.trim(), id: nameId.trim(), ar: nameAr.trim() },
//         desc: {
//           en: descEn.trim() || "",
//           id: descId.trim() || "",
//           ar: descAr.trim() || "",
//         },
//         categoryId,
//         price: Number(price),
//         imageUrl: finalImageUrl,
//         isActive: !!isActive,
//         updatedAt: serverTimestamp(),
//       };

//       if (editingId) {
//         await updateDoc(doc(db, "menuItems", editingId), data);
//         toast.push({
//           title: "Updated",
//           message: "Menu item updated.",
//           variant: "success",
//         });
//       } else {
//         await addDoc(collection(db, "menuItems"), {
//           ...data,
//           createdAt: serverTimestamp(),
//         });
//         toast.push({
//           title: "Saved",
//           message: "Menu item created.",
//           variant: "success",
//         });
//       }

//       resetForm();
//     } catch (e) {
//       console.error(e);
//       toast.push({
//         title: "Save failed",
//         message: "Check Firestore rules / login.",
//         variant: "danger",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const toggleItemActive = async (it) => {
//     try {
//       await updateDoc(doc(db, "menuItems", it.id), {
//         isActive: !it.isActive,
//         updatedAt: serverTimestamp(),
//       });
//       toast.push({
//         title: "Updated",
//         message: `${pickLabel(it.name, lang, it.id)} → ${!it.isActive ? "Active" : "Hidden"}`,
//         variant: "default",
//       });
//     } catch (e) {
//       console.error(e);
//       toast.push({
//         title: "Update failed",
//         message: "Could not update item.",
//         variant: "danger",
//       });
//     }
//   };

//   const removeItem = async (it) => {
//     const ok = window.confirm(
//       `Delete "${pickLabel(it.name, lang, it.id)}"? This cannot be undone.`,
//     );
//     if (!ok) return;
//     try {
//       await deleteDoc(doc(db, "menuItems", it.id));
//       toast.push({
//         title: "Deleted",
//         message: "Menu item removed.",
//         variant: "warning",
//       });
//       if (editingId === it.id) resetForm();
//     } catch (e) {
//       console.error(e);
//       toast.push({
//         title: "Delete failed",
//         message: "Could not delete item.",
//         variant: "danger",
//       });
//     }
//   };

//   return (
//     <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
//       {/* Left: Create/Edit */}
//       <section className="rounded-3xl border border-black/10 bg-white p-4">
//         <div className="flex items-start justify-between gap-3">
//           <div>
//             <div className="text-sm font-semibold">
//               {editingId ? "Edit menu item" : "Create menu item"}
//             </div>
//             <div className="mt-1 text-xs text-zinc-500">
//               Cloudinary upload → store URL in Firestore.
//             </div>
//           </div>
//           {editingId ? (
//             <button
//               type="button"
//               onClick={resetForm}
//               className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
//             >
//               Cancel edit
//             </button>
//           ) : null}
//         </div>

//         <div className="mt-4 grid gap-3">
//           <Input label="Category">
//             <select
//               value={categoryId}
//               onChange={(e) => setCategoryId(e.target.value)}
//               className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//             >
//               {cats.map((c) => (
//                 <option key={c.id} value={c.id}>
//                   {pickLabel(c.name, lang, c.id)}
//                 </option>
//               ))}
//             </select>
//           </Input>

//           <Input label="Price (EGP)">
//             <input
//               value={price}
//               onChange={(e) => setPrice(e.target.value)}
//               inputMode="decimal"
//               className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//               placeholder="85"
//             />
//           </Input>

//           <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3">
//             <div className="text-sm font-semibold">Active</div>
//             <button
//               type="button"
//               onClick={() => setIsActive((v) => !v)}
//               className={[
//                 "rounded-full px-3 py-2 text-xs font-semibold",
//                 isActive
//                   ? "bg-emerald-600 text-white"
//                   : "bg-black/10 text-zinc-700",
//               ].join(" ")}
//             >
//               {isActive ? "ON" : "OFF"}
//             </button>
//           </div>

//           {/* Image uploader */}
//           <div className="rounded-3xl border border-black/10 bg-white p-3">
//             <div className="text-xs font-semibold text-zinc-700">
//               Image (Cloudinary)
//             </div>

//             <div className="mt-2 flex items-center gap-3">
//               <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-zinc-50">
//                 {imagePreview ? (
//                   <img
//                     src={imagePreview}
//                     alt=""
//                     className="h-full w-full object-cover"
//                   />
//                 ) : imageUrl ? (
//                   <img
//                     src={imageUrl}
//                     alt=""
//                     className="h-full w-full object-cover"
//                   />
//                 ) : null}
//               </div>

//               <div className="min-w-0 flex-1">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   capture="environment"
//                   onChange={(e) => onPickImage(e.target.files?.[0] || null)}
//                   className="block w-full text-xs"
//                 />
//                 <div className="mt-1 text-[11px] text-zinc-500">
//                   Choose image → press Upload (or Save will upload
//                   automatically).
//                 </div>

//                 {uploading ? (
//                   <div className="mt-2">
//                     <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
//                       <div
//                         className="h-2 rounded-full bg-black"
//                         style={{ width: `${uploadPct}%` }}
//                       />
//                     </div>
//                     <div className="mt-1 text-[11px] text-zinc-500">
//                       {uploadPct}%
//                     </div>
//                   </div>
//                 ) : null}

//                 <div className="mt-2 flex gap-2">
//                   <button
//                     type="button"
//                     onClick={uploadSelectedImage}
//                     disabled={!imageFile || uploading}
//                     className={[
//                       "rounded-full px-3 py-2 text-xs font-semibold border active:scale-[0.98]",
//                       !imageFile || uploading
//                         ? "border-black/10 bg-black/5 text-zinc-500"
//                         : "border-black/10 bg-white text-zinc-800",
//                     ].join(" ")}
//                   >
//                     Upload
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => {
//                       setImageFile(null);
//                       setImagePreview("");
//                       setUploadPct(0);
//                     }}
//                     className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
//                   >
//                     Clear
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-3 grid gap-1">
//               <span className="text-[11px] font-semibold text-zinc-600">
//                 Saved image URL (auto)
//               </span>
//               <input
//                 value={imageUrl || ""}
//                 onChange={(e) => setImageUrl(e.target.value)}
//                 className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//                 placeholder="(will fill after upload)"
//               />
//             </div>
//           </div>

//           <div className="grid gap-3 rounded-3xl border border-black/10 bg-zinc-50 p-3">
//             <div className="text-xs font-semibold text-zinc-700">
//               Name (required)
//             </div>
//             <Input label="EN">
//               <input
//                 value={nameEn}
//                 onChange={(e) => setNameEn(e.target.value)}
//                 className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//               />
//             </Input>
//             <Input label="ID">
//               <input
//                 value={nameId}
//                 onChange={(e) => setNameId(e.target.value)}
//                 className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//               />
//             </Input>
//             <Input label="AR">
//               <input
//                 value={nameAr}
//                 onChange={(e) => setNameAr(e.target.value)}
//                 className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//               />
//             </Input>
//           </div>

//           <div className="grid gap-3 rounded-3xl border border-black/10 bg-zinc-50 p-3">
//             <div className="text-xs font-semibold text-zinc-700">
//               Description (optional)
//             </div>
//             <Input label="EN">
//               <input
//                 value={descEn}
//                 onChange={(e) => setDescEn(e.target.value)}
//                 className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//               />
//             </Input>
//             <Input label="ID">
//               <input
//                 value={descId}
//                 onChange={(e) => setDescId(e.target.value)}
//                 className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//               />
//             </Input>
//             <Input label="AR">
//               <input
//                 value={descAr}
//                 onChange={(e) => setDescAr(e.target.value)}
//                 className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//               />
//             </Input>
//           </div>

//           <button
//             type="button"
//             onClick={save}
//             disabled={saving || uploading || cats.length === 0}
//             className={[
//               "rounded-3xl px-4 py-4 text-sm font-semibold shadow-sm active:scale-[0.99]",
//               saving || uploading || cats.length === 0
//                 ? "bg-black/20 text-white/70"
//                 : "bg-black text-white",
//             ].join(" ")}
//           >
//             {uploading
//               ? `Uploading... ${uploadPct}%`
//               : saving
//                 ? "Saving..."
//                 : editingId
//                   ? "Save changes"
//                   : "Create item"}
//           </button>
//         </div>
//       </section>

//       {/* Right: list + search */}
//       <section className="rounded-3xl border border-black/10 bg-white p-4">
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <div className="text-sm font-semibold">Menu items</div>
//             <div className="mt-1 text-xs text-zinc-500">
//               Showing {filteredItems.length} / {items.length}
//             </div>
//           </div>

//           <div className="w-full sm:w-[320px]">
//             <Input label="Search">
//               <input
//                 value={qText}
//                 onChange={(e) => setQText(e.target.value)}
//                 className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
//                 placeholder="Search name / desc / price..."
//               />
//             </Input>
//           </div>
//         </div>

//         <div className="mt-4 grid gap-3">
//           {filteredItems.map((it) => {
//             const cat = catMap.get(it.categoryId);
//             const label = pickLabel(it.name, lang, it.id);
//             const catLabel = pickLabel(cat?.name, lang, it.categoryId);

//             return (
//               <div
//                 key={it.id}
//                 className="rounded-3xl border border-black/10 bg-white p-3"
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <button
//                     type="button"
//                     onClick={() => fillFormForEdit(it)}
//                     className="min-w-0 text-left"
//                     title="Tap to edit"
//                   >
//                     <div className="text-sm font-semibold truncate">
//                       {label}
//                     </div>
//                     <div className="mt-0.5 text-xs text-zinc-500">
//                       {catLabel} • {it.price} EGP •{" "}
//                       {it.isActive ? "Active" : "Hidden"}
//                     </div>
//                   </button>

//                   <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-zinc-50">
//                     {it.imageUrl ? (
//                       <img
//                         src={it.imageUrl}
//                         alt=""
//                         className="h-full w-full object-cover"
//                         loading="lazy"
//                       />
//                     ) : null}
//                   </div>
//                 </div>

//                 <div className="mt-3 flex flex-wrap gap-2">
//                   <button
//                     type="button"
//                     onClick={() => toggleItemActive(it)}
//                     className={[
//                       "rounded-full px-3 py-2 text-xs font-semibold active:scale-[0.98] border",
//                       it.isActive
//                         ? "border-emerald-200 bg-emerald-50 text-emerald-900"
//                         : "border-black/10 bg-white text-zinc-800",
//                     ].join(" ")}
//                   >
//                     {it.isActive ? "Active" : "Hidden"}
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => fillFormForEdit(it)}
//                     className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 active:scale-[0.98]"
//                   >
//                     Edit
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => removeItem(it)}
//                     className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-900 active:scale-[0.98]"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             );
//           })}

//           {filteredItems.length === 0 ? (
//             <div className="rounded-3xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-600">
//               No items match your search.
//             </div>
//           ) : null}
//         </div>
//       </section>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../components/ToastProvider";
import { uploadToCloudinary } from "../lib/cloudinary";

/**
 * Reusable Input Wrapper
 */
function Input({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function pickLabel(obj, lang, fallback) {
  if (!obj) return fallback;
  return obj?.[lang] || obj?.en || obj?.id || obj?.ar || fallback;
}

export default function AdminMenu({ lang }) {
  const toast = useToast();

  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);

  // UI State
  const [qText, setQText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [nameEn, setNameEn] = useState("");
  const [nameId, setNameId] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descId, setDescId] = useState("");
  const [descAr, setDescAr] = useState("");

  // Image State
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);

  // --- CLEANUP: Memory Management for Object URLs ---
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Load Categories
  useEffect(() => {
    const qCats = query(collection(db, "categories"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      qCats,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCats(rows);
        if (!categoryId && rows[0]?.id) setCategoryId(rows[0].id);
      },
      (err) => {
        console.error(err);
        toast.push({
          title: "Error",
          message: "Failed to load categories.",
          variant: "danger",
        });
      },
    );
    return () => unsub();
  }, [categoryId, toast]);

  // Load Menu Items
  useEffect(() => {
    const qItems = query(
      collection(db, "menuItems"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      qItems,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error(err);
        toast.push({
          title: "Error",
          message: "Failed to load menu.",
          variant: "danger",
        });
      },
    );
    return () => unsub();
  }, [toast]);

  const catMap = useMemo(() => {
    const m = new Map();
    cats.forEach((c) => m.set(c.id, c));
    return m;
  }, [cats]);

  const filteredItems = useMemo(() => {
    const q = qText.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const blob = [
        it?.name?.en,
        it?.name?.id,
        it?.name?.ar,
        it?.desc?.en,
        it?.desc?.id,
        it?.desc?.ar,
        String(it.price ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [items, qText]);

  const resetForm = () => {
    setEditingId(null);
    setPrice("");
    setIsActive(true);
    setNameEn("");
    setNameId("");
    setNameAr("");
    setDescEn("");
    setDescId("");
    setDescAr("");
    setImageUrl("");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setUploadPct(0);
    setUploading(false);
  };

  const fillFormForEdit = (it) => {
    setEditingId(it.id);
    setCategoryId(it.categoryId || "");
    setPrice(String(it.price ?? ""));
    setIsActive(!!it.isActive);
    setNameEn(it?.name?.en || "");
    setNameId(it?.name?.id || "");
    setNameAr(it?.name?.ar || "");
    setDescEn(it?.desc?.en || "");
    setDescId(it?.desc?.id || "");
    setDescAr(it?.desc?.ar || "");
    setImageUrl(it?.imageUrl || "");
    setImageFile(null);
    setImagePreview("");
  };

  const onPickImage = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast.push({
        title: "Invalid file",
        message: "Image only.",
        variant: "warning",
      });
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadSelectedImage = async () => {
    if (!imageFile) return imageUrl;
    try {
      setUploading(true);
      const data = await uploadToCloudinary(imageFile, {
        onProgress: (pct) => setUploadPct(pct),
      });
      const url = data?.secure_url || data?.url;
      if (!url) throw new Error("Cloudinary error");
      setImageUrl(url);
      return url;
    } catch (e) {
      toast.push({
        title: "Upload Failed",
        message: e.message,
        variant: "danger",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const p = Number(price);
    if (!nameEn || !nameId || !nameAr || isNaN(p) || p <= 0) {
      toast.push({
        title: "Validation",
        message: "Check name and price.",
        variant: "warning",
      });
      return;
    }

    try {
      setSaving(true);
      const finalImageUrl = await uploadSelectedImage();

      const data = {
        name: { en: nameEn.trim(), id: nameId.trim(), ar: nameAr.trim() },
        desc: { en: descEn.trim(), id: descId.trim(), ar: descAr.trim() },
        categoryId,
        price: p,
        imageUrl: finalImageUrl || "",
        isActive,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "menuItems", editingId), data);
        toast.push({
          title: "Updated",
          message: "Item saved.",
          variant: "success",
        });
      } else {
        await addDoc(collection(db, "menuItems"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast.push({
          title: "Created",
          message: "New item added.",
          variant: "success",
        });
      }
      resetForm();
    } catch (e) {
      toast.push({
        title: "Error",
        message: "Database failure.",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (it) => {
    if (!window.confirm(`Delete ${pickLabel(it.name, lang, "item")}?`)) return;
    await deleteDoc(doc(db, "menuItems", it.id));
    toast.push({
      title: "Deleted",
      message: "Item removed.",
      variant: "warning",
    });
    if (editingId === it.id) resetForm();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-start">
      {/* --- FORM SECTION --- */}
      <section className="sticky top-6 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">
            {editingId ? "Edit Item" : "New Menu Item"}
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <Input label="Category">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
            >
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {pickLabel(c.name, lang, c.id)}
                </option>
              ))}
            </select>
          </Input>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (EGP)">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
              />
            </Input>
            <Input label="Visibility">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full h-[46px] rounded-2xl border font-bold text-[10px] transition-all ${
                  isActive
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-zinc-100 border-zinc-200 text-zinc-500"
                }`}
              >
                {isActive ? "● VISIBLE" : "○ HIDDEN"}
              </button>
            </Input>
          </div>

          <div className="rounded-2xl border border-dashed border-black/10 p-4 bg-zinc-50/50">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-white shadow-inner">
                {imagePreview || imageUrl ? (
                  <img
                    src={imagePreview || imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickImage(e.target.files?.[0])}
                  className="block w-full text-xs text-zinc-500 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-900 file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-white file:hover:bg-zinc-700"
                />
              </div>
            </div>
            {uploading && (
              <div className="mt-3 h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            )}
          </div>

          <div className="grid gap-3 bg-zinc-50 p-4 rounded-2xl">
            <div className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
              Name Localizations
            </div>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="English Name"
              className="w-full rounded-xl border border-black/5 p-3 text-sm outline-none focus:border-black/20"
            />
            <input
              value={nameId}
              onChange={(e) => setNameId(e.target.value)}
              placeholder="Indonesian Name"
              className="w-full rounded-xl border border-black/5 p-3 text-sm outline-none focus:border-black/20"
            />
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="Arabic Name"
              className="w-full rounded-xl border border-black/5 p-3 text-sm text-right outline-none focus:border-black/20"
            />
          </div>

          <button
            onClick={save}
            disabled={saving || uploading || cats.length === 0}
            className="w-full rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-xl shadow-black/10 hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-30 transition-all"
          >
            {uploading
              ? `Uploading ${uploadPct}%...`
              : saving
                ? "Saving..."
                : editingId
                  ? "Update Menu Item"
                  : "Create Menu Item"}
          </button>
        </div>
      </section>

      {/* --- LIST SECTION --- */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <h2 className="text-xl font-black text-zinc-900">Live Menu</h2>
            <p className="text-xs text-zinc-500">
              {filteredItems.length} items found
            </p>
          </div>
          <input
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Search items..."
            className="w-full md:w-64 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>

        <div className="grid gap-3">
          {filteredItems.map((it) => (
            <div
              key={it.id}
              className="group relative flex items-center gap-4 rounded-3xl border border-black/5 bg-white p-3 hover:border-black/20 transition-all"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 border border-black/5">
                {it.imageUrl && (
                  <img
                    src={it.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-zinc-900 truncate">
                  {pickLabel(it.name, lang, it.id)}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                  <span className="font-bold text-zinc-700">
                    {it.price} EGP
                  </span>
                  <span>•</span>
                  <span>
                    {pickLabel(
                      catMap.get(it.categoryId)?.name,
                      lang,
                      "No Category",
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fillFormForEdit(it)}
                  className="rounded-full bg-zinc-100 px-4 py-2 text-[11px] font-bold text-zinc-700 hover:bg-zinc-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeItem(it)}
                  className="rounded-full bg-white border border-rose-100 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>

              {!it.isActive && (
                <div className="absolute top-2 right-2 rounded-full bg-zinc-900 px-2 py-0.5 text-[8px] font-black text-white uppercase">
                  Hidden
                </div>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-20 text-center text-zinc-400 text-sm italic">
              No items match your criteria...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
