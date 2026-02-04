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

// /**
//  * Reusable Input Wrapper
//  */
// function Input({ label, children }) {
//   return (
//     <label className="grid gap-1">
//       <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">
//         {label}
//       </span>
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

//   // UI State
//   const [qText, setQText] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [saving, setSaving] = useState(false);

//   // Form State
//   const [categoryId, setCategoryId] = useState("");
//   const [price, setPrice] = useState("");
//   const [isActive, setIsActive] = useState(true);
//   const [nameEn, setNameEn] = useState("");
//   const [nameId, setNameId] = useState("");
//   const [nameAr, setNameAr] = useState("");
//   const [descEn, setDescEn] = useState("");
//   const [descId, setDescId] = useState("");
//   const [descAr, setDescAr] = useState("");

//   // Image State
//   const [imageUrl, setImageUrl] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [uploadPct, setUploadPct] = useState(0);
//   const [uploading, setUploading] = useState(false);

//   // --- CLEANUP: Memory Management for Object URLs ---
//   useEffect(() => {
//     return () => {
//       if (imagePreview) URL.revokeObjectURL(imagePreview);
//     };
//   }, [imagePreview]);

//   // Load Categories
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
//           title: "Error",
//           message: "Failed to load categories.",
//           variant: "danger",
//         });
//       },
//     );
//     return () => unsub();
//   }, [categoryId, toast]);

//   // Load Menu Items
//   useEffect(() => {
//     const qItems = query(
//       collection(db, "menuItems"),
//       orderBy("createdAt", "desc"),
//     );
//     const unsub = onSnapshot(
//       qItems,
//       (snap) => {
//         setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
//       },
//       (err) => {
//         console.error(err);
//         toast.push({
//           title: "Error",
//           message: "Failed to load menu.",
//           variant: "danger",
//         });
//       },
//     );
//     return () => unsub();
//   }, [toast]);

//   const catMap = useMemo(() => {
//     const m = new Map();
//     cats.forEach((c) => m.set(c.id, c));
//     return m;
//   }, [cats]);

//   const filteredItems = useMemo(() => {
//     const q = qText.trim().toLowerCase();
//     if (!q) return items;
//     return items.filter((it) => {
//       const blob = [
//         it?.name?.en,
//         it?.name?.id,
//         it?.name?.ar,
//         it?.desc?.en,
//         it?.desc?.id,
//         it?.desc?.ar,
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
//     if (imagePreview) URL.revokeObjectURL(imagePreview);
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
//   };

//   const onPickImage = (file) => {
//     if (!file) return;
//     if (!file.type?.startsWith("image/")) {
//       toast.push({
//         title: "Invalid file",
//         message: "Image only.",
//         variant: "warning",
//       });
//       return;
//     }
//     if (imagePreview) URL.revokeObjectURL(imagePreview);
//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const uploadSelectedImage = async () => {
//     if (!imageFile) return imageUrl;
//     try {
//       setUploading(true);
//       const data = await uploadToCloudinary(imageFile, {
//         onProgress: (pct) => setUploadPct(pct),
//       });
//       const url = data?.secure_url || data?.url;
//       if (!url) throw new Error("Cloudinary error");
//       setImageUrl(url);
//       return url;
//     } catch (e) {
//       toast.push({
//         title: "Upload Failed",
//         message: e.message,
//         variant: "danger",
//       });
//       return null;
//     } finally {
//       setUploading(false);
//     }
//   };

//   const save = async () => {
//     const p = Number(price);
//     if (!nameEn || !nameId || !nameAr || isNaN(p) || p <= 0) {
//       toast.push({
//         title: "Validation",
//         message: "Check name and price.",
//         variant: "warning",
//       });
//       return;
//     }

//     try {
//       setSaving(true);
//       const finalImageUrl = await uploadSelectedImage();

//       const data = {
//         name: { en: nameEn.trim(), id: nameId.trim(), ar: nameAr.trim() },
//         desc: { en: descEn.trim(), id: descId.trim(), ar: descAr.trim() },
//         categoryId,
//         price: p,
//         imageUrl: finalImageUrl || "",
//         isActive,
//         updatedAt: serverTimestamp(),
//       };

//       if (editingId) {
//         await updateDoc(doc(db, "menuItems", editingId), data);
//         toast.push({
//           title: "Updated",
//           message: "Item saved.",
//           variant: "success",
//         });
//       } else {
//         await addDoc(collection(db, "menuItems"), {
//           ...data,
//           createdAt: serverTimestamp(),
//         });
//         toast.push({
//           title: "Created",
//           message: "New item added.",
//           variant: "success",
//         });
//       }
//       resetForm();
//     } catch (e) {
//       toast.push({
//         title: "Error",
//         message: "Database failure.",
//         variant: "danger",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const removeItem = async (it) => {
//     if (!window.confirm(`Delete ${pickLabel(it.name, lang, "item")}?`)) return;
//     await deleteDoc(doc(db, "menuItems", it.id));
//     toast.push({
//       title: "Deleted",
//       message: "Item removed.",
//       variant: "warning",
//     });
//     if (editingId === it.id) resetForm();
//   };

//   return (
//     <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-start">
//       {/* --- FORM SECTION --- */}
//       <section className="sticky top-6 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-lg font-bold tracking-tight text-zinc-900">
//             {editingId ? "Edit Item" : "New Menu Item"}
//           </h2>
//           {editingId && (
//             <button
//               onClick={resetForm}
//               className="text-xs font-bold text-rose-600 hover:underline"
//             >
//               Cancel Edit
//             </button>
//           )}
//         </div>

//         <div className="space-y-4">
//           <Input label="Category">
//             <select
//               value={categoryId}
//               onChange={(e) => setCategoryId(e.target.value)}
//               className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
//             >
//               {cats.map((c) => (
//                 <option key={c.id} value={c.id}>
//                   {pickLabel(c.name, lang, c.id)}
//                 </option>
//               ))}
//             </select>
//           </Input>

//           <div className="grid grid-cols-2 gap-4">
//             <Input label="Price (EGP)">
//               <input
//                 value={price}
//                 onChange={(e) => setPrice(e.target.value)}
//                 placeholder="0.00"
//                 className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
//               />
//             </Input>
//             <Input label="Visibility">
//               <button
//                 type="button"
//                 onClick={() => setIsActive(!isActive)}
//                 className={`w-full h-[46px] rounded-2xl border font-bold text-[10px] transition-all ${
//                   isActive
//                     ? "bg-emerald-50 border-emerald-200 text-emerald-700"
//                     : "bg-zinc-100 border-zinc-200 text-zinc-500"
//                 }`}
//               >
//                 {isActive ? "● VISIBLE" : "○ HIDDEN"}
//               </button>
//             </Input>
//           </div>

//           <div className="rounded-2xl border border-dashed border-black/10 p-4 bg-zinc-50/50">
//             <div className="flex items-center gap-4">
//               <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-white shadow-inner">
//                 {imagePreview || imageUrl ? (
//                   <img
//                     src={imagePreview || imageUrl}
//                     alt=""
//                     className="h-full w-full object-cover"
//                   />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
//                     No Image
//                   </div>
//                 )}
//               </div>
//               <div className="flex-1">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => onPickImage(e.target.files?.[0])}
//                   className="block w-full text-xs text-zinc-500 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-900 file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-white file:hover:bg-zinc-700"
//                 />
//               </div>
//             </div>
//             {uploading && (
//               <div className="mt-3 h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-black transition-all"
//                   style={{ width: `${uploadPct}%` }}
//                 />
//               </div>
//             )}
//           </div>

//           <div className="grid gap-3 bg-zinc-50 p-4 rounded-2xl">
//             <div className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
//               Name Localizations
//             </div>
//             <input
//               value={nameEn}
//               onChange={(e) => setNameEn(e.target.value)}
//               placeholder="English Name"
//               className="w-full rounded-xl border border-black/5 p-3 text-sm outline-none focus:border-black/20"
//             />
//             <input
//               value={nameId}
//               onChange={(e) => setNameId(e.target.value)}
//               placeholder="Indonesian Name"
//               className="w-full rounded-xl border border-black/5 p-3 text-sm outline-none focus:border-black/20"
//             />
//             <input
//               value={nameAr}
//               onChange={(e) => setNameAr(e.target.value)}
//               placeholder="Arabic Name"
//               className="w-full rounded-xl border border-black/5 p-3 text-sm text-right outline-none focus:border-black/20"
//             />
//           </div>

//           <button
//             onClick={save}
//             disabled={saving || uploading || cats.length === 0}
//             className="w-full rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-xl shadow-black/10 hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-30 transition-all"
//           >
//             {uploading
//               ? `Uploading ${uploadPct}%...`
//               : saving
//                 ? "Saving..."
//                 : editingId
//                   ? "Update Menu Item"
//                   : "Create Menu Item"}
//           </button>
//         </div>
//       </section>

//       {/* --- LIST SECTION --- */}
//       <section className="space-y-4">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
//           <div>
//             <h2 className="text-xl font-black text-zinc-900">Live Menu</h2>
//             <p className="text-xs text-zinc-500">
//               {filteredItems.length} items found
//             </p>
//           </div>
//           <input
//             value={qText}
//             onChange={(e) => setQText(e.target.value)}
//             placeholder="Search items..."
//             className="w-full md:w-64 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30"
//           />
//         </div>

//         <div className="grid gap-3">
//           {filteredItems.map((it) => (
//             <div
//               key={it.id}
//               className="group relative flex items-center gap-4 rounded-3xl border border-black/5 bg-white p-3 hover:border-black/20 transition-all"
//             >
//               <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 border border-black/5">
//                 {it.imageUrl && (
//                   <img
//                     src={it.imageUrl}
//                     alt=""
//                     className="h-full w-full object-cover"
//                     loading="lazy"
//                   />
//                 )}
//               </div>

//               <div className="min-w-0 flex-1">
//                 <div className="text-sm font-bold text-zinc-900 truncate">
//                   {pickLabel(it.name, lang, it.id)}
//                 </div>
//                 <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
//                   <span className="font-bold text-zinc-700">
//                     {it.price} EGP
//                   </span>
//                   <span>•</span>
//                   <span>
//                     {pickLabel(
//                       catMap.get(it.categoryId)?.name,
//                       lang,
//                       "No Category",
//                     )}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => fillFormForEdit(it)}
//                   className="rounded-full bg-zinc-100 px-4 py-2 text-[11px] font-bold text-zinc-700 hover:bg-zinc-200"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => removeItem(it)}
//                   className="rounded-full bg-white border border-rose-100 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
//                 >
//                   Delete
//                 </button>
//               </div>

//               {!it.isActive && (
//                 <div className="absolute top-2 right-2 rounded-full bg-zinc-900 px-2 py-0.5 text-[8px] font-black text-white uppercase">
//                   Hidden
//                 </div>
//               )}
//             </div>
//           ))}

//           {filteredItems.length === 0 && (
//             <div className="py-20 text-center text-zinc-400 text-sm italic">
//               No items match your criteria...
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

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
//       <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">
//         {label}
//       </span>
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
//   const [qText, setQText] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [saving, setSaving] = useState(false);

//   // Form State
//   const [categoryId, setCategoryId] = useState("");
//   const [price, setPrice] = useState("");
//   const [isActive, setIsActive] = useState(true);
//   const [nameEn, setNameEn] = useState("");
//   const [nameId, setNameId] = useState("");
//   const [nameAr, setNameAr] = useState("");
//   const [descEn, setDescEn] = useState("");
//   const [descId, setDescId] = useState("");
//   const [descAr, setDescAr] = useState("");

//   // Image State
//   const [imageUrl, setImageUrl] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [uploadPct, setUploadPct] = useState(0);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     return () => {
//       if (imagePreview) URL.revokeObjectURL(imagePreview);
//     };
//   }, [imagePreview]);

//   useEffect(() => {
//     const qCats = query(collection(db, "categories"), orderBy("order", "asc"));
//     const unsub = onSnapshot(qCats, (snap) => {
//       const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setCats(rows);
//       if (!categoryId && rows[0]?.id) setCategoryId(rows[0].id);
//     });
//     return () => unsub();
//   }, [categoryId]);

//   useEffect(() => {
//     const qItems = query(
//       collection(db, "menuItems"),
//       orderBy("createdAt", "desc"),
//     );
//     const unsub = onSnapshot(qItems, (snap) => {
//       setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
//     });
//     return () => unsub();
//   }, []);

//   const catMap = useMemo(() => {
//     const m = new Map();
//     cats.forEach((c) => m.set(c.id, c));
//     return m;
//   }, [cats]);

//   const filteredItems = useMemo(() => {
//     const q = qText.trim().toLowerCase();
//     if (!q) return items;
//     return items.filter((it) => {
//       const blob = [
//         it?.name?.en,
//         it?.name?.id,
//         it?.name?.ar,
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
//     if (imagePreview) URL.revokeObjectURL(imagePreview);
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
//     window.scrollTo({ top: 0, behavior: "smooth" }); // Better for mobile UX
//   };

//   const onPickImage = (file) => {
//     if (!file || !file.type?.startsWith("image/")) return;
//     if (imagePreview) URL.revokeObjectURL(imagePreview);
//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const save = async () => {
//     const p = Number(price);
//     if (!nameEn || isNaN(p) || p <= 0) {
//       toast.push({
//         title: "Validation",
//         message: "Name and Price required",
//         variant: "warning",
//       });
//       return;
//     }
//     try {
//       setSaving(true);
//       let finalUrl = imageUrl;
//       if (imageFile) {
//         setUploading(true);
//         const data = await uploadToCloudinary(imageFile, {
//           onProgress: (pct) => setUploadPct(pct),
//         });
//         finalUrl = data?.secure_url || data?.url;
//         setUploading(false);
//       }
//       const data = {
//         name: { en: nameEn.trim(), id: nameId.trim(), ar: nameAr.trim() },
//         desc: { en: descEn.trim(), id: descId.trim(), ar: descAr.trim() },
//         categoryId,
//         price: p,
//         imageUrl: finalUrl || "",
//         isActive,
//         updatedAt: serverTimestamp(),
//       };
//       if (editingId) {
//         await updateDoc(doc(db, "menuItems", editingId), data);
//         toast.push({
//           title: "Success",
//           message: "Item updated",
//           variant: "success",
//         });
//       } else {
//         await addDoc(collection(db, "menuItems"), {
//           ...data,
//           createdAt: serverTimestamp(),
//         });
//         toast.push({
//           title: "Success",
//           message: "Item created",
//           variant: "success",
//         });
//       }
//       resetForm();
//     } catch (e) {
//       toast.push({
//         title: "Error",
//         message: "Failed to save",
//         variant: "danger",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 items-start max-w-7xl mx-auto">
//       {/* FORM: Top on mobile, Left Sidebar on Desktop */}
//       <section className="w-full lg:w-[400px] lg:sticky lg:top-6 space-y-4">
//         <div className="bg-white rounded-3xl border border-black/10 p-5 shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-bold tracking-tight">
//               {editingId ? "Edit Item" : "New Item"}
//             </h2>
//             {editingId && (
//               <button
//                 onClick={resetForm}
//                 className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>

//           <div className="space-y-4">
//             <Input label="Category">
//               <select
//                 value={categoryId}
//                 onChange={(e) => setCategoryId(e.target.value)}
//                 className="w-full rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm font-medium outline-none focus:bg-white transition-all"
//               >
//                 {cats.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {pickLabel(c.name, lang, c.id)}
//                   </option>
//                 ))}
//               </select>
//             </Input>

//             <div className="grid grid-cols-2 gap-4">
//               <Input label="Price (EGP)">
//                 <input
//                   value={price}
//                   onChange={(e) => setPrice(e.target.value)}
//                   placeholder="0.00"
//                   className="w-full rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm outline-none focus:bg-white"
//                 />
//               </Input>
//               <Input label="Status">
//                 <button
//                   type="button"
//                   onClick={() => setIsActive(!isActive)}
//                   className={`w-full h-full rounded-2xl border font-bold text-[10px] min-h-[50px] transition-all ${isActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-zinc-100 border-zinc-200 text-zinc-500"}`}
//                 >
//                   {isActive ? "VISIBLE" : "HIDDEN"}
//                 </button>
//               </Input>
//             </div>

//             <div className="rounded-2xl border border-dashed border-black/10 p-4 bg-zinc-50/50 flex items-center gap-4">
//               <div className="h-16 w-16 shrink-0 rounded-xl bg-white border border-black/5 overflow-hidden">
//                 {(imagePreview || imageUrl) && (
//                   <img
//                     src={imagePreview || imageUrl}
//                     alt=""
//                     className="h-full w-full object-cover"
//                   />
//                 )}
//               </div>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => onPickImage(e.target.files?.[0])}
//                 className="text-[10px] w-full file:bg-black file:text-white file:rounded-full file:px-3 file:py-1 file:border-0"
//               />
//             </div>

//             <div className="space-y-2 bg-zinc-50 p-3 rounded-2xl">
//               <input
//                 value={nameEn}
//                 onChange={(e) => setNameEn(e.target.value)}
//                 placeholder="Name (English)"
//                 className="w-full rounded-xl border border-black/5 p-3 text-sm outline-none focus:bg-white"
//               />
//               <input
//                 value={nameId}
//                 onChange={(e) => setNameId(e.target.value)}
//                 placeholder="Name (Indonesian)"
//                 className="w-full rounded-xl border border-black/5 p-3 text-sm outline-none focus:bg-white"
//               />
//               <input
//                 value={nameAr}
//                 onChange={(e) => setNameAr(e.target.value)}
//                 placeholder="الاسم (عربي)"
//                 className="w-full rounded-xl border border-black/5 p-3 text-sm text-right outline-none focus:bg-white"
//               />
//             </div>

//             <button
//               onClick={save}
//               disabled={saving || uploading}
//               className="w-full rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-30"
//             >
//               {uploading
//                 ? `Uploading ${uploadPct}%...`
//                 : saving
//                   ? "Saving..."
//                   : editingId
//                     ? "Save Changes"
//                     : "Add to Menu"}
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* LIST: Responsive Grid */}
//       <section className="flex-1 w-full space-y-4">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
//           <h2 className="text-2xl font-black">
//             Menu Items{" "}
//             <span className="text-zinc-400 text-sm font-normal">
//               ({filteredItems.length})
//             </span>
//           </h2>
//           <input
//             value={qText}
//             onChange={(e) => setQText(e.target.value)}
//             placeholder="Search..."
//             className="w-full md:w-64 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-black/5"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {filteredItems.map((it) => (
//             <div
//               key={it.id}
//               className="bg-white rounded-3xl border border-black/5 p-4 flex gap-4 hover:border-black/20 transition-all group"
//             >
//               <div className="h-20 w-20 shrink-0 rounded-2xl bg-zinc-100 overflow-hidden border border-black/5">
//                 {it.imageUrl && (
//                   <img
//                     src={it.imageUrl}
//                     alt=""
//                     className="h-full w-full object-cover"
//                   />
//                 )}
//               </div>
//               <div className="flex-1 min-w-0 flex flex-col justify-between">
//                 <div>
//                   <div className="font-bold text-zinc-900 truncate">
//                     {pickLabel(it.name, lang, it.id)}
//                   </div>
//                   <div className="text-xs text-zinc-500 font-medium">
//                     {catMap.get(it.categoryId)?.name?.en} • {it.price} EGP
//                   </div>
//                 </div>
//                 <div className="flex gap-2 mt-3">
//                   <button
//                     onClick={() => fillFormForEdit(it)}
//                     className="flex-1 bg-zinc-100 hover:bg-zinc-200 py-2 rounded-xl text-[11px] font-bold transition-colors"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => {
//                       if (window.confirm("Delete?"))
//                         deleteDoc(doc(db, "menuItems", it.id));
//                     }}
//                     className="px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
//                   >
//                     🗑
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
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

export default function AdminMenu({ lang }) {
  const toast = useToast();
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [qText, setQText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false); // Toggle for mobile focus

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [nameEn, setNameEn] = useState("");
  const [nameId, setNameId] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const qCats = query(collection(db, "categories"), orderBy("order", "asc"));
    return onSnapshot(qCats, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCats(rows);
      if (rows[0]?.id && !categoryId) setCategoryId(rows[0].id);
    });
  }, []);

  useEffect(() => {
    const qItems = query(
      collection(db, "menuItems"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(qItems, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, []);

  const save = async () => {
    if (!nameEn || !price)
      return toast.push({
        title: "Error",
        message: "Name & Price required",
        variant: "warning",
      });
    try {
      setUploading(true);
      let finalUrl = imageUrl;
      if (imageFile) {
        const data = await uploadToCloudinary(imageFile);
        finalUrl = data?.secure_url;
      }
      const payload = {
        name: { en: nameEn, id: nameId, ar: nameAr },
        categoryId,
        price: Number(price),
        imageUrl: finalUrl || "",
        isActive,
        updatedAt: serverTimestamp(),
      };
      if (editingId) {
        await updateDoc(doc(db, "menuItems", editingId), payload);
      } else {
        await addDoc(collection(db, "menuItems"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      setEditingId(null);
      setPrice("");
      setNameEn("");
      setNameId("");
      setNameAr("");
      setImagePreview("");
      setImageFile(null);
      setIsFormOpen(false);
      toast.push({
        title: "Saved",
        message: "Menu updated",
        variant: "success",
      });
    } catch (e) {
      toast.push({ title: "Error", message: "Save failed", variant: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const filtered = items.filter((it) =>
    it.name?.en?.toLowerCase().includes(qText.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* HEADER: Mobile Optimized */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black tracking-tight">Admin Menu</h1>
          <button
            onClick={() => {
              setIsFormOpen(!isFormOpen);
              setEditingId(null);
            }}
            className="bg-black text-white text-[12px] font-bold px-4 py-2 rounded-full shadow-lg shadow-black/20"
          >
            {isFormOpen ? "Close" : "+ Add Item"}
          </button>
        </div>
        <input
          value={qText}
          onChange={(e) => setQText(e.target.value)}
          placeholder="Search dishes..."
          className="w-full bg-zinc-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
        />
      </div>

      <div className="p-4 space-y-3">
        {/* ADD/EDIT FORM (Mobile Accordion style) */}
        {isFormOpen && (
          <div className="bg-white rounded-[24px] border border-black/5 p-4 shadow-sm space-y-4 mb-6">
            <h2 className="text-sm font-bold uppercase text-zinc-400 tracking-widest">
              {editingId ? "Edit Dish" : "New Dish"}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <p className="text-[10px] font-bold ml-1 mb-1 text-zinc-500 uppercase">
                  Category
                </p>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-zinc-50 border-none rounded-2xl p-3.5 text-sm font-bold"
                >
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name?.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold ml-1 mb-1 text-zinc-500 uppercase">
                  Price (EGP)
                </p>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-zinc-50 border-none rounded-2xl p-3.5 text-sm font-bold"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold ml-1 mb-1 text-zinc-500 uppercase">
                  Visibility
                </p>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full p-3.5 rounded-2xl text-[10px] font-black border transition-all ${isActive ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-zinc-50 border-zinc-200 text-zinc-400"}`}
                >
                  {isActive ? "● VISIBLE" : "○ HIDDEN"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="English Name"
                className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm"
              />
              <input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="الاسم بالعربي"
                className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm text-right"
              />
            </div>

            <button
              onClick={save}
              disabled={uploading}
              className="w-full bg-black text-white py-4 rounded-2xl text-sm font-bold shadow-xl active:scale-95 transition-all"
            >
              {uploading
                ? "Saving..."
                : editingId
                  ? "Update Item"
                  : "Create Item"}
            </button>
          </div>
        )}

        {/* LIST: native-style cards */}
        {filtered.map((it) => (
          <div
            key={it.id}
            className="bg-white rounded-[22px] p-3 flex items-center gap-3 border border-black/[0.03] shadow-sm"
          >
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 overflow-hidden shrink-0">
              {it.imageUrl && (
                <img
                  src={it.imageUrl}
                  className="h-full w-full object-cover"
                  alt=""
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-bold text-zinc-900 truncate">
                {it.name?.en}
              </h3>
              <p className="text-[11px] font-medium text-zinc-400">
                {it.price} EGP •{" "}
                {cats.find((c) => c.id === it.categoryId)?.name?.en}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setEditingId(it.id);
                  setNameEn(it.name?.en);
                  setNameAr(it.name?.ar);
                  setPrice(it.price);
                  setCategoryId(it.categoryId);
                  setIsActive(it.isActive);
                  setIsFormOpen(true);
                  window.scrollTo(0, 0);
                }}
                className="bg-zinc-100 text-[10px] font-bold px-3 py-2 rounded-lg"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
