import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { isRtl } from "./i18n";

import Home from "./pages/Home";
import OrderPage from "./pages/OrderPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  // Global language (shared customer/admin)
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "id");
  const rtl = useMemo(() => isRtl(lang), [lang]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang, rtl]);

  // Auth state
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home lang={lang} setLang={setLang} />} />
      <Route path="/order/:orderId" element={<OrderPage />} />

      <Route path="/admin/login" element={<AdminLogin lang={lang} />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user}>
            <AdminDashboard lang={lang} setLang={setLang} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
