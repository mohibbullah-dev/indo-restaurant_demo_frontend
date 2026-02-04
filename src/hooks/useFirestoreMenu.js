import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";

export function useFirestoreMenu({ onlyActive = true } = {}) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubCats = onSnapshot(
      query(collection(db, "categories")),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCategories(rows);
      },
      (e) => {
        console.error(e);
        setError(e?.message || "Failed to load categories.");
        setLoading(false);
      },
    );

    const unsubItems = onSnapshot(
      query(collection(db, "menuItems")),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(rows);
        setLoading(false);
      },
      (e) => {
        console.error(e);
        setError(e?.message || "Failed to load menu items.");
        setLoading(false);
      },
    );

    return () => {
      unsubCats();
      unsubItems();
    };
  }, []);

  const filteredCats = useMemo(() => {
    if (!onlyActive) return categories;
    return categories.filter((c) => c.isActive !== false);
  }, [categories, onlyActive]);

  const filteredItems = useMemo(() => {
    const list = onlyActive ? items.filter((i) => i.isActive !== false) : items;

    // sort client-side (no Firestore index needed)
    const catOrder = new Map(filteredCats.map((c) => [c.id, c.order ?? 9999]));
    return [...list].sort((a, b) => {
      const ao = catOrder.get(a.categoryId) ?? 9999;
      const bo = catOrder.get(b.categoryId) ?? 9999;
      if (ao !== bo) return ao - bo;
      return (a?.name?.en || "").localeCompare(b?.name?.en || "");
    });
  }, [items, onlyActive, filteredCats]);

  return { categories: filteredCats, items: filteredItems, loading, error };
}
