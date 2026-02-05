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

// export default function AdminMenu({ lang }) {
//   const toast = useToast();
//   const [cats, setCats] = useState([]);
//   const [items, setItems] = useState([]);
//   const [qText, setQText] = useState("");
//   const [isFormOpen, setIsFormOpen] = useState(false); // Toggle for mobile focus

//   // Form State
//   const [editingId, setEditingId] = useState(null);
//   const [categoryId, setCategoryId] = useState("");
//   const [price, setPrice] = useState("");
//   const [isActive, setIsActive] = useState(true);
//   const [nameEn, setNameEn] = useState("");
//   const [nameId, setNameId] = useState("");
//   const [nameAr, setNameAr] = useState("");
//   const [imageUrl, setImageUrl] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     const qCats = query(collection(db, "categories"), orderBy("order", "asc"));
//     return onSnapshot(qCats, (snap) => {
//       const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setCats(rows);
//       if (rows[0]?.id && !categoryId) setCategoryId(rows[0].id);
//     });
//   }, []);

//   useEffect(() => {
//     const qItems = query(
//       collection(db, "menuItems"),
//       orderBy("createdAt", "desc"),
//     );
//     return onSnapshot(qItems, (snap) =>
//       setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
//     );
//   }, []);

//   const save = async () => {
//     if (!nameEn || !price)
//       return toast.push({
//         title: "Error",
//         message: "Name & Price required",
//         variant: "warning",
//       });
//     try {
//       setUploading(true);
//       let finalUrl = imageUrl;
//       if (imageFile) {
//         const data = await uploadToCloudinary(imageFile);
//         finalUrl = data?.secure_url;
//       }
//       const payload = {
//         name: { en: nameEn, id: nameId, ar: nameAr },
//         categoryId,
//         price: Number(price),
//         imageUrl: finalUrl || "",
//         isActive,
//         updatedAt: serverTimestamp(),
//       };
//       if (editingId) {
//         await updateDoc(doc(db, "menuItems", editingId), payload);
//       } else {
//         await addDoc(collection(db, "menuItems"), {
//           ...payload,
//           createdAt: serverTimestamp(),
//         });
//       }

//       setEditingId(null);
//       setPrice("");
//       setNameEn("");
//       setNameId("");
//       setNameAr("");
//       setImagePreview("");
//       setImageFile(null);
//       setIsFormOpen(false);
//       toast.push({
//         title: "Saved",
//         message: "Menu updated",
//         variant: "success",
//       });
//     } catch (e) {
//       toast.push({ title: "Error", message: "Save failed", variant: "danger" });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const filtered = items.filter((it) =>
//     it.name?.en?.toLowerCase().includes(qText.toLowerCase()),
//   );

//   return (
//     <div className="min-h-screen bg-[#F8F9FA] pb-24">
//       {/* HEADER: Mobile Optimized */}
//       <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 py-3">
//         <div className="flex items-center justify-between mb-3">
//           <h1 className="text-xl font-black tracking-tight">Admin Menu</h1>
//           <button
//             onClick={() => {
//               setIsFormOpen(!isFormOpen);
//               setEditingId(null);
//             }}
//             className="bg-black text-white text-[12px] font-bold px-4 py-2 rounded-full shadow-lg shadow-black/20"
//           >
//             {isFormOpen ? "Close" : "+ Add Item"}
//           </button>
//         </div>
//         <input
//           value={qText}
//           onChange={(e) => setQText(e.target.value)}
//           placeholder="Search dishes..."
//           className="w-full bg-zinc-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5"
//         />
//       </div>

//       <div className="p-4 space-y-3">
//         {/* ADD/EDIT FORM (Mobile Accordion style) */}
//         {isFormOpen && (
//           <div className="bg-white rounded-[24px] border border-black/5 p-4 shadow-sm space-y-4 mb-6">
//             <h2 className="text-sm font-bold uppercase text-zinc-400 tracking-widest">
//               {editingId ? "Edit Dish" : "New Dish"}
//             </h2>

//             <div className="grid grid-cols-2 gap-3">
//               <div className="col-span-2">
//                 <p className="text-[10px] font-bold ml-1 mb-1 text-zinc-500 uppercase">
//                   Category
//                 </p>
//                 <select
//                   value={categoryId}
//                   onChange={(e) => setCategoryId(e.target.value)}
//                   className="w-full bg-zinc-50 border-none rounded-2xl p-3.5 text-sm font-bold"
//                 >
//                   {cats.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name?.en}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold ml-1 mb-1 text-zinc-500 uppercase">
//                   Price (EGP)
//                 </p>
//                 <input
//                   value={price}
//                   onChange={(e) => setPrice(e.target.value)}
//                   placeholder="0"
//                   className="w-full bg-zinc-50 border-none rounded-2xl p-3.5 text-sm font-bold"
//                 />
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold ml-1 mb-1 text-zinc-500 uppercase">
//                   Visibility
//                 </p>
//                 <button
//                   onClick={() => setIsActive(!isActive)}
//                   className={`w-full p-3.5 rounded-2xl text-[10px] font-black border transition-all ${isActive ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-zinc-50 border-zinc-200 text-zinc-400"}`}
//                 >
//                   {isActive ? "● VISIBLE" : "○ HIDDEN"}
//                 </button>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <input
//                 value={nameEn}
//                 onChange={(e) => setNameEn(e.target.value)}
//                 placeholder="English Name"
//                 className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm"
//               />
//               <input
//                 value={nameAr}
//                 onChange={(e) => setNameAr(e.target.value)}
//                 placeholder="الاسم بالعربي"
//                 className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm text-right"
//               />
//             </div>

//             <button
//               onClick={save}
//               disabled={uploading}
//               className="w-full bg-black text-white py-4 rounded-2xl text-sm font-bold shadow-xl active:scale-95 transition-all"
//             >
//               {uploading
//                 ? "Saving..."
//                 : editingId
//                   ? "Update Item"
//                   : "Create Item"}
//             </button>
//           </div>
//         )}

//         {/* LIST: native-style cards */}
//         {filtered.map((it) => (
//           <div
//             key={it.id}
//             className="bg-white rounded-[22px] p-3 flex items-center gap-3 border border-black/[0.03] shadow-sm"
//           >
//             <div className="h-16 w-16 rounded-2xl bg-zinc-100 overflow-hidden shrink-0">
//               {it.imageUrl && (
//                 <img
//                   src={it.imageUrl}
//                   className="h-full w-full object-cover"
//                   alt=""
//                 />
//               )}
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="text-[13px] font-bold text-zinc-900 truncate">
//                 {it.name?.en}
//               </h3>
//               <p className="text-[11px] font-medium text-zinc-400">
//                 {it.price} EGP •{" "}
//                 {cats.find((c) => c.id === it.categoryId)?.name?.en}
//               </p>
//             </div>
//             <div className="flex flex-col gap-1">
//               <button
//                 onClick={() => {
//                   setEditingId(it.id);
//                   setNameEn(it.name?.en);
//                   setNameAr(it.name?.ar);
//                   setPrice(it.price);
//                   setCategoryId(it.categoryId);
//                   setIsActive(it.isActive);
//                   setIsFormOpen(true);
//                   window.scrollTo(0, 0);
//                 }}
//                 className="bg-zinc-100 text-[10px] font-bold px-3 py-2 rounded-lg"
//               >
//                 Edit
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
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

// export default function AdminMenu({ lang }) {
//   const toast = useToast();
//   const [cats, setCats] = useState([]);
//   const [items, setItems] = useState([]);
//   const [qText, setQText] = useState("");
//   const [isFormOpen, setIsFormOpen] = useState(false);

//   // Form State
//   const [editingId, setEditingId] = useState(null);
//   const [categoryId, setCategoryId] = useState("");
//   const [price, setPrice] = useState("");
//   const [isActive, setIsActive] = useState(true);
//   const [nameEn, setNameEn] = useState("");
//   const [nameAr, setNameAr] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     const qCats = query(collection(db, "categories"), orderBy("order", "asc"));
//     return onSnapshot(qCats, (snap) => {
//       const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setCats(rows);
//       if (rows[0]?.id && !categoryId) setCategoryId(rows[0].id);
//     });
//   }, []);

//   useEffect(() => {
//     const qItems = query(
//       collection(db, "menuItems"),
//       orderBy("createdAt", "desc"),
//     );
//     return onSnapshot(qItems, (snap) =>
//       setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
//     );
//   }, []);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const save = async () => {
//     if (!nameEn || !price) {
//       return toast.push({
//         title: "Required",
//         message: "Name & Price are mandatory",
//         variant: "warning",
//       });
//     }
//     try {
//       setUploading(true);
//       let finalUrl = items.find((i) => i.id === editingId)?.imageUrl || "";

//       if (imageFile) {
//         const data = await uploadToCloudinary(imageFile);
//         finalUrl = data?.secure_url;
//       }

//       const payload = {
//         name: { en: nameEn, ar: nameAr },
//         categoryId,
//         price: Number(price),
//         imageUrl: finalUrl,
//         isActive,
//         updatedAt: serverTimestamp(),
//       };

//       if (editingId) {
//         await updateDoc(doc(db, "menuItems", editingId), payload);
//       } else {
//         await addDoc(collection(db, "menuItems"), {
//           ...payload,
//           createdAt: serverTimestamp(),
//         });
//       }

//       resetForm();
//       toast.push({
//         title: "Success",
//         message: "Menu updated",
//         variant: "success",
//       });
//     } catch (e) {
//       toast.push({ title: "Error", message: "Save failed", variant: "danger" });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setPrice("");
//     setNameEn("");
//     setNameAr("");
//     setImagePreview("");
//     setImageFile(null);
//     setIsFormOpen(false);
//   };

//   const filtered = items.filter((it) =>
//     it.name?.en?.toLowerCase().includes(qText.toLowerCase()),
//   );

//   return (
//     <div className="flex flex-col h-full bg-zinc-50 font-sans select-none">
//       {/* STICKY SEARCH BAR (Mobile Native Look) */}
//       <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-zinc-100 p-4">
//         <div className="relative group">
//           <input
//             value={qText}
//             onChange={(e) => setQText(e.target.value)}
//             placeholder="Search your menu..."
//             className="w-full bg-zinc-100 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-zinc-200 transition-all"
//           />
//           <div className="absolute left-3.5 top-3.5 text-zinc-400">
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2.5"
//                 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//               />
//             </svg>
//           </div>
//         </div>
//       </div>

//       {/* ITEMS LIST */}
//       <div className="flex-1 p-4 space-y-3 pb-32">
//         <div className="flex items-center justify-between px-1 mb-2">
//           <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
//             Total {filtered.length} Items
//           </h2>
//           <button
//             onClick={() => setIsFormOpen(true)}
//             className="text-[11px] font-black uppercase text-blue-600"
//           >
//             + Add New
//           </button>
//         </div>

//         {filtered.map((it) => (
//           <button
//             key={it.id}
//             onClick={() => {
//               setEditingId(it.id);
//               setNameEn(it.name?.en || "");
//               setNameAr(it.name?.ar || "");
//               setPrice(it.price || "");
//               setCategoryId(it.categoryId || "");
//               setIsActive(it.isActive);
//               setImagePreview(it.imageUrl || "");
//               setIsFormOpen(true);
//             }}
//             className="w-full bg-white rounded-3xl p-3 flex items-center gap-4 border border-zinc-100 active:scale-[0.98] transition-all text-left shadow-sm"
//           >
//             <div className="h-14 w-14 rounded-2xl bg-zinc-50 overflow-hidden shrink-0 border border-zinc-50">
//               {it.imageUrl ? (
//                 <img
//                   src={it.imageUrl}
//                   className="h-full w-full object-cover"
//                   alt=""
//                 />
//               ) : (
//                 <div className="h-full w-full flex items-center justify-center text-zinc-300">
//                   <svg
//                     className="w-6 h-6"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </div>
//               )}
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="text-sm font-black text-zinc-900 truncate">
//                 {it.name?.en}
//               </h3>
//               <div className="flex items-center gap-2 mt-0.5">
//                 <span className="text-[11px] font-bold text-emerald-600">
//                   {it.price} EGP
//                 </span>
//                 <span className="text-[11px] text-zinc-300">•</span>
//                 <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">
//                   {cats.find((c) => c.id === it.categoryId)?.name?.en}
//                 </span>
//               </div>
//             </div>
//             {!it.isActive && (
//               <span className="px-2 py-1 bg-zinc-100 rounded-lg text-[9px] font-black text-zinc-400 uppercase">
//                 Hidden
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* MODAL FORM (Slide-up Bottom Sheet) */}
//       {isFormOpen && (
//         <div className="fixed inset-0 z-50 flex items-end">
//           <div
//             className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
//             onClick={resetForm}
//           />
//           <div className="relative w-full bg-white rounded-t-[2.5rem] max-h-[92dvh] overflow-y-auto p-6 animate-in slide-in-from-bottom duration-300 ease-out">
//             <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />

//             <header className="flex justify-between items-center mb-8">
//               <h2 className="text-xl font-black">
//                 {editingId ? "Edit Dish" : "New Dish"}
//               </h2>
//               <button
//                 onClick={resetForm}
//                 className="h-8 w-8 flex items-center justify-center bg-zinc-100 rounded-full text-zinc-500"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     d="M6 18L18 6M6 6l12 12"
//                     strokeWidth="3"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </button>
//             </header>

//             <div className="space-y-6">
//               {/* Image Upload Area */}
//               <div
//                 className="relative h-40 w-full bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center overflow-hidden"
//                 onClick={() => document.getElementById("fileInput").click()}
//               >
//                 {imagePreview ? (
//                   <img
//                     src={imagePreview}
//                     className="h-full w-full object-cover"
//                     alt="Preview"
//                   />
//                 ) : (
//                   <div className="text-center">
//                     <p className="text-xs font-black text-zinc-400 uppercase">
//                       Tap to add photo
//                     </p>
//                   </div>
//                 )}
//                 <input
//                   id="fileInput"
//                   type="file"
//                   hidden
//                   accept="image/*"
//                   onChange={handleImageChange}
//                 />
//               </div>

//               {/* Input Group */}
//               <div className="grid gap-4">
//                 <div className="space-y-1.5">
//                   <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">
//                     Display Names
//                   </label>
//                   <input
//                     value={nameEn}
//                     onChange={(e) => setNameEn(e.target.value)}
//                     placeholder="English Name (e.g. Classic Burger)"
//                     className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold"
//                   />
//                   <input
//                     value={nameAr}
//                     onChange={(e) => setNameAr(e.target.value)}
//                     placeholder="الاسم بالعربي"
//                     className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold text-right"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">
//                       Price (EGP)
//                     </label>
//                     <input
//                       type="number"
//                       value={price}
//                       onChange={(e) => setPrice(e.target.value)}
//                       placeholder="0.00"
//                       className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">
//                       Category
//                     </label>
//                     <select
//                       value={categoryId}
//                       onChange={(e) => setCategoryId(e.target.value)}
//                       className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold appearance-none"
//                     >
//                       {cats.map((c) => (
//                         <option key={c.id} value={c.id}>
//                           {c.name?.en}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
//                   <span className="text-xs font-black text-zinc-500 uppercase">
//                     Show on Menu
//                   </span>
//                   <button
//                     onClick={() => setIsActive(!isActive)}
//                     className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? "bg-emerald-500" : "bg-zinc-300"}`}
//                   >
//                     <div
//                       className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? "right-1" : "left-1"}`}
//                     />
//                   </button>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col gap-3 pt-4 pb-8">
//                 <button
//                   onClick={save}
//                   disabled={uploading}
//                   className="w-full bg-zinc-900 text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50 transition-all"
//                 >
//                   {uploading
//                     ? "Uploading..."
//                     : editingId
//                       ? "Save Changes"
//                       : "Create Item"}
//                 </button>
//                 {editingId && (
//                   <button
//                     onClick={async () => {
//                       if (window.confirm("Delete this item?")) {
//                         await deleteDoc(doc(db, "menuItems", editingId));
//                         resetForm();
//                       }
//                     }}
//                     className="w-full bg-rose-50 text-rose-600 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest"
//                   >
//                     Delete Dish
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
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
// import LanguageSwitcher from "../components/LanguageSwitcher"; // Import added

// export default function AdminMenu({ lang, setLang }) {
//   // Added setLang prop
//   const toast = useToast();
//   const [cats, setCats] = useState([]);
//   const [items, setItems] = useState([]);
//   const [qText, setQText] = useState("");
//   const [isFormOpen, setIsFormOpen] = useState(false);

//   // Form State
//   const [editingId, setEditingId] = useState(null);
//   const [categoryId, setCategoryId] = useState("");
//   const [price, setPrice] = useState("");
//   const [isActive, setIsActive] = useState(true);

//   // Three Title Fields
//   const [nameEn, setNameEn] = useState("");
//   const [nameAr, setNameAr] = useState("");
//   const [nameExtra, setNameExtra] = useState(""); // Third Title Field

//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [uploading, setUploading] = useState(false);

//   // ... (Keep existing useEffects for cats and items)
//   useEffect(() => {
//     const qCats = query(collection(db, "categories"), orderBy("order", "asc"));
//     return onSnapshot(qCats, (snap) => {
//       const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setCats(rows);
//       if (rows[0]?.id && !categoryId) setCategoryId(rows[0].id);
//     });
//   }, []);

//   useEffect(() => {
//     const qItems = query(
//       collection(db, "menuItems"),
//       orderBy("createdAt", "desc"),
//     );
//     return onSnapshot(qItems, (snap) =>
//       setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
//     );
//   }, []);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const save = async () => {
//     if (!nameEn || !price) {
//       return toast.push({
//         title: "Required",
//         message: "Name & Price are mandatory",
//         variant: "warning",
//       });
//     }
//     try {
//       setUploading(true);
//       let finalUrl = items.find((i) => i.id === editingId)?.imageUrl || "";

//       if (imageFile) {
//         const data = await uploadToCloudinary(imageFile);
//         finalUrl = data?.secure_url;
//       }

//       const payload = {
//         // Saving 3 names in the name object
//         name: { en: nameEn, ar: nameAr, extra: nameExtra },
//         categoryId,
//         price: Number(price),
//         imageUrl: finalUrl,
//         isActive,
//         updatedAt: serverTimestamp(),
//       };

//       if (editingId) {
//         await updateDoc(doc(db, "menuItems", editingId), payload);
//       } else {
//         await addDoc(collection(db, "menuItems"), {
//           ...payload,
//           createdAt: serverTimestamp(),
//         });
//       }

//       resetForm();
//       toast.push({
//         title: "Success",
//         message: "Menu updated",
//         variant: "success",
//       });
//     } catch (e) {
//       toast.push({ title: "Error", message: "Save failed", variant: "danger" });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setPrice("");
//     setNameEn("");
//     setNameAr("");
//     setNameExtra("");
//     setImagePreview("");
//     setImageFile(null);
//     setIsFormOpen(false);
//   };

//   const filtered = items.filter(
//     (it) =>
//       it.name?.[lang]?.toLowerCase().includes(qText.toLowerCase()) ||
//       it.name?.en?.toLowerCase().includes(qText.toLowerCase()),
//   );

//   return (
//     <div className="flex flex-col h-full bg-zinc-50 font-sans select-none">
//       {/* HEADER WITH SEARCH & LANGUAGE */}
//       <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-zinc-100 p-4 space-y-3">
//         <div className="flex items-center gap-3">
//           <div className="relative flex-1 group">
//             <input
//               value={qText}
//               onChange={(e) => setQText(e.target.value)}
//               placeholder="Search menu..."
//               className="w-full bg-zinc-100 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-zinc-200 transition-all"
//             />
//             <div className="absolute left-3.5 top-3.5 text-zinc-400">
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2.5"
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </div>
//           </div>
//           {/* Language Switcher Now Working */}
//           {/* <LanguageSwitcher lang={lang} setLang={setLang} /> */}
//         </div>
//       </div>

//       {/* ITEMS LIST */}
//       <div className="flex-1 p-4 space-y-3 pb-32">
//         <div className="flex items-center justify-between px-1 mb-2">
//           <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
//             Total {filtered.length} Items
//           </h2>
//           <button
//             onClick={() => setIsFormOpen(true)}
//             className="text-[11px] font-black uppercase text-blue-600"
//           >
//             + Add New
//           </button>
//         </div>

//         {filtered.map((it) => (
//           <button
//             key={it.id}
//             onClick={() => {
//               setEditingId(it.id);
//               setNameEn(it.name?.en || "");
//               setNameAr(it.name?.ar || "");
//               setNameExtra(it.name?.extra || "");
//               setPrice(it.price || "");
//               setCategoryId(it.categoryId || "");
//               setIsActive(it.isActive);
//               setImagePreview(it.imageUrl || "");
//               setIsFormOpen(true);
//             }}
//             className="w-full bg-white rounded-3xl p-3 flex items-center gap-4 border border-zinc-100 active:scale-[0.98] transition-all text-left shadow-sm"
//           >
//             {/* ... Keep image div ... */}
//             <div className="h-14 w-14 rounded-2xl bg-zinc-50 overflow-hidden shrink-0 border border-zinc-50">
//               {it.imageUrl ? (
//                 <img
//                   src={it.imageUrl}
//                   className="h-full w-full object-cover"
//                   alt=""
//                 />
//               ) : (
//                 <div className="h-full w-full flex items-center justify-center text-zinc-300">
//                   <svg
//                     className="w-6 h-6"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </div>
//               )}
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="text-sm font-black text-zinc-900 truncate">
//                 {it.name?.[lang] || it.name?.en}
//               </h3>
//               <div className="flex items-center gap-2 mt-0.5">
//                 <span className="text-[11px] font-bold text-emerald-600">
//                   {it.price} EGP
//                 </span>
//                 <span className="text-[11px] text-zinc-300">•</span>
//                 <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">
//                   {cats.find((c) => c.id === it.categoryId)?.name?.en}
//                 </span>
//               </div>
//             </div>
//           </button>
//         ))}
//       </div>

//       {/* MODAL FORM */}
//       {isFormOpen && (
//         <div className="fixed inset-0 z-50 flex items-end">
//           <div
//             className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
//             onClick={resetForm}
//           />
//           <div className="relative w-full bg-white rounded-t-[2.5rem] max-h-[92dvh] overflow-y-auto p-6 animate-in slide-in-from-bottom duration-300">
//             <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />

//             <div className="space-y-6">
//               {/* ... Keep image upload section ... */}
//               <div
//                 className="relative h-40 w-full bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center overflow-hidden"
//                 onClick={() => document.getElementById("fileInput").click()}
//               >
//                 {imagePreview ? (
//                   <img
//                     src={imagePreview}
//                     className="h-full w-full object-cover"
//                     alt="Preview"
//                   />
//                 ) : (
//                   <div className="text-center">
//                     <p className="text-xs font-black text-zinc-400 uppercase">
//                       Tap to add photo
//                     </p>
//                   </div>
//                 )}
//                 <input
//                   id="fileInput"
//                   type="file"
//                   hidden
//                   accept="image/*"
//                   onChange={handleImageChange}
//                 />
//               </div>

//               <div className="grid gap-4">
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">
//                     Display Names (3 Languages)
//                   </label>
//                   <input
//                     value={nameEn}
//                     onChange={(e) => setNameEn(e.target.value)}
//                     placeholder="English Name"
//                     className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold"
//                   />
//                   <input
//                     value={nameAr}
//                     onChange={(e) => setNameAr(e.target.value)}
//                     placeholder="الاسم بالعربي"
//                     className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold text-right"
//                   />
//                   {/* THIRD TITLE FIELD */}
//                   <input
//                     value={nameExtra}
//                     onChange={(e) => setNameExtra(e.target.value)}
//                     placeholder="Third Language Name (e.g. Russian/German)"
//                     className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold"
//                   />
//                 </div>

//                 {/* ... Price, Category, and Save buttons same as before ... */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">
//                       Price (EGP)
//                     </label>
//                     <input
//                       type="number"
//                       value={price}
//                       onChange={(e) => setPrice(e.target.value)}
//                       placeholder="0.00"
//                       className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">
//                       Category
//                     </label>
//                     <select
//                       value={categoryId}
//                       onChange={(e) => setCategoryId(e.target.value)}
//                       className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold appearance-none"
//                     >
//                       {cats.map((c) => (
//                         <option key={c.id} value={c.id}>
//                           {c.name?.en}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <button
//                   onClick={save}
//                   disabled={uploading}
//                   className="w-full bg-zinc-900 text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50 transition-all mt-4"
//                 >
//                   {uploading
//                     ? "Uploading..."
//                     : editingId
//                       ? "Save Changes"
//                       : "Create Item"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
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

function pickLangText(obj, lang) {
  // obj like { en, id, ar }
  if (!obj) return "";
  return obj?.[lang] || obj?.en || obj?.id || obj?.ar || "";
}

export default function AdminMenu({ lang }) {
  const toast = useToast();
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [qText, setQText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  // ✅ 3 language fields
  const [nameEn, setNameEn] = useState("");
  const [nameId, setNameId] = useState("");
  const [nameAr, setNameAr] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setPrice("");
    setNameEn("");
    setNameId("");
    setNameAr("");
    setImagePreview("");
    setImageFile(null);
    setIsFormOpen(false);
  };

  const save = async () => {
    // ✅ keep your existing requirement: nameEn + price required
    if (!nameEn || !price) {
      return toast.push({
        title: "Required",
        message: "Name (EN) & Price are mandatory",
        variant: "warning",
      });
    }

    try {
      setUploading(true);
      let finalUrl = items.find((i) => i.id === editingId)?.imageUrl || "";

      if (imageFile) {
        const data = await uploadToCloudinary(imageFile);
        finalUrl = data?.secure_url;
      }

      // ✅ store 3 languages (id is optional, will fallback)
      const payload = {
        name: {
          en: nameEn,
          id: nameId || nameEn, // fallback to EN if not filled
          ar: nameAr || nameEn, // fallback to EN if not filled
        },
        categoryId,
        price: Number(price),
        imageUrl: finalUrl,
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

      resetForm();
      toast.push({
        title: "Success",
        message: "Menu updated",
        variant: "success",
      });
    } catch (e) {
      console.error(e);
      toast.push({ title: "Error", message: "Save failed", variant: "danger" });
    } finally {
      setUploading(false);
    }
  };

  // ✅ search should follow current language (fallback to EN)
  const filtered = useMemo(() => {
    const q = qText.trim().toLowerCase();
    if (!q) return items;

    return items.filter((it) => {
      const nm = pickLangText(it?.name, lang).toLowerCase();
      const en = (it?.name?.en || "").toLowerCase();
      const ar = (it?.name?.ar || "").toLowerCase();
      const id = (it?.name?.id || "").toLowerCase();
      return (
        nm.includes(q) || en.includes(q) || ar.includes(q) || id.includes(q)
      );
    });
  }, [items, qText, lang]);

  return (
    <div className="flex flex-col h-full bg-zinc-50 font-sans select-none">
      {/* STICKY SEARCH BAR */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-zinc-100 p-4">
        <div className="relative group">
          <input
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Search your menu..."
            className="w-full bg-zinc-100 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-zinc-200 transition-all"
          />
          <div className="absolute left-3.5 top-3.5 text-zinc-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="flex-1 p-4 space-y-3 pb-32">
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Total {filtered.length} Items
          </h2>
          <button
            onClick={() => setIsFormOpen(true)}
            className="text-[11px] font-black uppercase text-blue-600"
          >
            + Add New
          </button>
        </div>

        {filtered.map((it) => {
          const title = pickLangText(it?.name, lang) || it.id;
          const catTitle = pickLangText(
            cats.find((c) => c.id === it.categoryId)?.name,
            lang,
          );

          return (
            <button
              key={it.id}
              onClick={() => {
                setEditingId(it.id);
                setNameEn(it.name?.en || "");
                setNameId(it.name?.id || "");
                setNameAr(it.name?.ar || "");
                setPrice(it.price || "");
                setCategoryId(it.categoryId || "");
                setIsActive(!!it.isActive);
                setImagePreview(it.imageUrl || "");
                setIsFormOpen(true);
              }}
              className="w-full bg-white rounded-3xl p-3 flex items-center gap-4 border border-zinc-100 active:scale-[0.98] transition-all text-left shadow-sm"
            >
              <div className="h-14 w-14 rounded-2xl bg-zinc-50 overflow-hidden shrink-0 border border-zinc-50">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    className="h-full w-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-300">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-zinc-900 truncate">
                  {title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-bold text-emerald-600">
                    {it.price} EGP
                  </span>
                  <span className="text-[11px] text-zinc-300">•</span>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter truncate">
                    {catTitle || "—"}
                  </span>
                </div>
              </div>

              {!it.isActive && (
                <span className="px-2 py-1 bg-zinc-100 rounded-lg text-[9px] font-black text-zinc-400 uppercase">
                  Hidden
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            onClick={resetForm}
          />
          <div className="relative w-full bg-white rounded-t-[2.5rem] max-h-[92dvh] overflow-y-auto p-6 animate-in slide-in-from-bottom duration-300 ease-out">
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />

            <header className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">
                {editingId ? "Edit Dish" : "New Dish"}
              </h2>
              <button
                onClick={resetForm}
                className="h-8 w-8 flex items-center justify-center bg-zinc-100 rounded-full text-zinc-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </header>

            <div className="space-y-6">
              {/* Image Upload */}
              <div
                className="relative h-40 w-full bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center overflow-hidden"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="h-full w-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-xs font-black text-zinc-400 uppercase">
                      Tap to add photo
                    </p>
                  </div>
                )}
                <input
                  id="fileInput"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Inputs */}
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">
                    Display Names
                  </label>

                  <input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="English Name (required)"
                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold"
                  />

                  <input
                    value={nameId}
                    onChange={(e) => setNameId(e.target.value)}
                    placeholder="Indonesian Name (optional)"
                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold"
                  />

                  <input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="الاسم بالعربي (optional)"
                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold text-right"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">
                      Price (EGP)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold appearance-none"
                    >
                      {cats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {pickLangText(c?.name, lang) || c.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                  <span className="text-xs font-black text-zinc-500 uppercase">
                    Show on Menu
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isActive ? "bg-emerald-500" : "bg-zinc-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        isActive ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4 pb-8">
                <button
                  onClick={save}
                  disabled={uploading}
                  className="w-full bg-zinc-900 text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                >
                  {uploading
                    ? "Uploading..."
                    : editingId
                      ? "Save Changes"
                      : "Create Item"}
                </button>

                {editingId && (
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this item?")) {
                        await deleteDoc(doc(db, "menuItems", editingId));
                        resetForm();
                      }
                    }}
                    className="w-full bg-rose-50 text-rose-600 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest"
                  >
                    Delete Dish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
