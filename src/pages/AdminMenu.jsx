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

function Input({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold text-zinc-700">{label}</span>
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

  // Search
  const [qText, setQText] = useState("");

  // edit mode
  const [editingId, setEditingId] = useState(null);

  // form
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [nameEn, setNameEn] = useState("");
  const [nameId, setNameId] = useState("");
  const [nameAr, setNameAr] = useState("");

  const [descEn, setDescEn] = useState("");
  const [descId, setDescId] = useState("");
  const [descAr, setDescAr] = useState("");

  // image
  const [imageUrl, setImageUrl] = useState(""); // stored URL (Cloudinary secure_url)
  const [imageFile, setImageFile] = useState(null); // selected file
  const [imagePreview, setImagePreview] = useState(""); // local preview
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);

  // Load categories
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
          title: "Categories error",
          message: "Failed to load categories (rules?)",
          variant: "danger",
        });
      },
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load menu items
  useEffect(() => {
    const qItems = query(
      collection(db, "menuItems"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      qItems,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(rows);
      },
      (err) => {
        console.error(err);
        toast.push({
          title: "Menu error",
          message: "Failed to load menu items (rules?)",
          variant: "danger",
        });
      },
    );
    return () => unsub();
  }, [toast]);

  const catMap = useMemo(() => {
    const m = new Map();
    for (const c of cats) m.set(c.id, c);
    return m;
  }, [cats]);

  const filteredItems = useMemo(() => {
    const q = qText.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const n = it?.name || {};
      const d = it?.desc || {};
      const blob = [
        n.en,
        n.id,
        n.ar,
        d.en,
        d.id,
        d.ar,
        it.categoryId,
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
    setUploadPct(0);
    setUploading(false);
  };

  const validate = () => {
    const p = Number(price);
    if (!categoryId) {
      toast.push({
        title: "Missing category",
        message: "Pick a category.",
        variant: "warning",
      });
      return false;
    }
    if (!nameEn.trim() || !nameId.trim() || !nameAr.trim()) {
      toast.push({
        title: "Missing name",
        message: "Name is required in EN / ID / AR.",
        variant: "warning",
      });
      return false;
    }
    if (!Number.isFinite(p) || p <= 0) {
      toast.push({
        title: "Invalid price",
        message: "Enter a valid price number.",
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  const onPickImage = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast.push({
        title: "Invalid file",
        message: "Please choose an image.",
        variant: "warning",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.push({
        title: "Image too big",
        message: "Max 5MB. Choose smaller image.",
        variant: "warning",
      });
      return;
    }

    setImageFile(file);
    setUploadPct(0);

    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const uploadSelectedImage = async () => {
    if (!imageFile) {
      toast.push({
        title: "No image",
        message: "Choose an image first.",
        variant: "warning",
      });
      return null;
    }

    try {
      setUploading(true);
      setUploadPct(0);

      const data = await uploadToCloudinary(imageFile, {
        onProgress: (pct) => setUploadPct(pct),
      });

      const url = data?.secure_url || data?.url || "";
      if (!url) throw new Error("Cloudinary returned no image URL");

      setImageUrl(url);
      setImageFile(null);
      setImagePreview("");
      toast.push({
        title: "Uploaded",
        message: "Image uploaded to Cloudinary.",
        variant: "success",
      });

      return url;
    } catch (e) {
      console.error(e);
      toast.push({
        title: "Upload failed",
        message: e?.message || "Check Cloudinary preset / env vars.",
        variant: "danger",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!validate()) return;
    if (saving || uploading) return;

    try {
      setSaving(true);

      // If user selected a new file but didn't upload yet: upload now
      let finalImageUrl = imageUrl.trim() || null;
      if (imageFile) {
        toast.push({
          title: "Uploading",
          message: "Uploading image...",
          variant: "default",
        });
        const url = await uploadSelectedImage();
        finalImageUrl = url || finalImageUrl;
      }

      const data = {
        name: { en: nameEn.trim(), id: nameId.trim(), ar: nameAr.trim() },
        desc: {
          en: descEn.trim() || "",
          id: descId.trim() || "",
          ar: descAr.trim() || "",
        },
        categoryId,
        price: Number(price),
        imageUrl: finalImageUrl,
        isActive: !!isActive,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "menuItems", editingId), data);
        toast.push({
          title: "Updated",
          message: "Menu item updated.",
          variant: "success",
        });
      } else {
        await addDoc(collection(db, "menuItems"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast.push({
          title: "Saved",
          message: "Menu item created.",
          variant: "success",
        });
      }

      resetForm();
    } catch (e) {
      console.error(e);
      toast.push({
        title: "Save failed",
        message: "Check Firestore rules / login.",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleItemActive = async (it) => {
    try {
      await updateDoc(doc(db, "menuItems", it.id), {
        isActive: !it.isActive,
        updatedAt: serverTimestamp(),
      });
      toast.push({
        title: "Updated",
        message: `${pickLabel(it.name, lang, it.id)} → ${!it.isActive ? "Active" : "Hidden"}`,
        variant: "default",
      });
    } catch (e) {
      console.error(e);
      toast.push({
        title: "Update failed",
        message: "Could not update item.",
        variant: "danger",
      });
    }
  };

  const removeItem = async (it) => {
    const ok = window.confirm(
      `Delete "${pickLabel(it.name, lang, it.id)}"? This cannot be undone.`,
    );
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "menuItems", it.id));
      toast.push({
        title: "Deleted",
        message: "Menu item removed.",
        variant: "warning",
      });
      if (editingId === it.id) resetForm();
    } catch (e) {
      console.error(e);
      toast.push({
        title: "Delete failed",
        message: "Could not delete item.",
        variant: "danger",
      });
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      {/* Left: Create/Edit */}
      <section className="rounded-3xl border border-black/10 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">
              {editingId ? "Edit menu item" : "Create menu item"}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Cloudinary upload → store URL in Firestore.
            </div>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
            >
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          <Input label="Category">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
            >
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {pickLabel(c.name, lang, c.id)}
                </option>
              ))}
            </select>
          </Input>

          <Input label="Price (EGP)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
              placeholder="85"
            />
          </Input>

          <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3">
            <div className="text-sm font-semibold">Active</div>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={[
                "rounded-full px-3 py-2 text-xs font-semibold",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "bg-black/10 text-zinc-700",
              ].join(" ")}
            >
              {isActive ? "ON" : "OFF"}
            </button>
          </div>

          {/* Image uploader */}
          <div className="rounded-3xl border border-black/10 bg-white p-3">
            <div className="text-xs font-semibold text-zinc-700">
              Image (Cloudinary)
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-zinc-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                  className="block w-full text-xs"
                />
                <div className="mt-1 text-[11px] text-zinc-500">
                  Choose image → press Upload (or Save will upload
                  automatically).
                </div>

                {uploading ? (
                  <div className="mt-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-2 rounded-full bg-black"
                        style={{ width: `${uploadPct}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-500">
                      {uploadPct}%
                    </div>
                  </div>
                ) : null}

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={uploadSelectedImage}
                    disabled={!imageFile || uploading}
                    className={[
                      "rounded-full px-3 py-2 text-xs font-semibold border active:scale-[0.98]",
                      !imageFile || uploading
                        ? "border-black/10 bg-black/5 text-zinc-500"
                        : "border-black/10 bg-white text-zinc-800",
                    ].join(" ")}
                  >
                    Upload
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setUploadPct(0);
                    }}
                    className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 active:scale-[0.98]"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-1">
              <span className="text-[11px] font-semibold text-zinc-600">
                Saved image URL (auto)
              </span>
              <input
                value={imageUrl || ""}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                placeholder="(will fill after upload)"
              />
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-black/10 bg-zinc-50 p-3">
            <div className="text-xs font-semibold text-zinc-700">
              Name (required)
            </div>
            <Input label="EN">
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
              />
            </Input>
            <Input label="ID">
              <input
                value={nameId}
                onChange={(e) => setNameId(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
              />
            </Input>
            <Input label="AR">
              <input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
              />
            </Input>
          </div>

          <div className="grid gap-3 rounded-3xl border border-black/10 bg-zinc-50 p-3">
            <div className="text-xs font-semibold text-zinc-700">
              Description (optional)
            </div>
            <Input label="EN">
              <input
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
              />
            </Input>
            <Input label="ID">
              <input
                value={descId}
                onChange={(e) => setDescId(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
              />
            </Input>
            <Input label="AR">
              <input
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
              />
            </Input>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving || uploading || cats.length === 0}
            className={[
              "rounded-3xl px-4 py-4 text-sm font-semibold shadow-sm active:scale-[0.99]",
              saving || uploading || cats.length === 0
                ? "bg-black/20 text-white/70"
                : "bg-black text-white",
            ].join(" ")}
          >
            {uploading
              ? `Uploading... ${uploadPct}%`
              : saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create item"}
          </button>
        </div>
      </section>

      {/* Right: list + search */}
      <section className="rounded-3xl border border-black/10 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold">Menu items</div>
            <div className="mt-1 text-xs text-zinc-500">
              Showing {filteredItems.length} / {items.length}
            </div>
          </div>

          <div className="w-full sm:w-[320px]">
            <Input label="Search">
              <input
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                placeholder="Search name / desc / price..."
              />
            </Input>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {filteredItems.map((it) => {
            const cat = catMap.get(it.categoryId);
            const label = pickLabel(it.name, lang, it.id);
            const catLabel = pickLabel(cat?.name, lang, it.categoryId);

            return (
              <div
                key={it.id}
                className="rounded-3xl border border-black/10 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => fillFormForEdit(it)}
                    className="min-w-0 text-left"
                    title="Tap to edit"
                  >
                    <div className="text-sm font-semibold truncate">
                      {label}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      {catLabel} • {it.price} EGP •{" "}
                      {it.isActive ? "Active" : "Hidden"}
                    </div>
                  </button>

                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-zinc-50">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleItemActive(it)}
                    className={[
                      "rounded-full px-3 py-2 text-xs font-semibold active:scale-[0.98] border",
                      it.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-black/10 bg-white text-zinc-800",
                    ].join(" ")}
                  >
                    {it.isActive ? "Active" : "Hidden"}
                  </button>

                  <button
                    type="button"
                    onClick={() => fillFormForEdit(it)}
                    className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 active:scale-[0.98]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => removeItem(it)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-900 active:scale-[0.98]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-600">
              No items match your search.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
