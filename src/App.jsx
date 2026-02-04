// import { useEffect, useMemo, useState } from "react";
// import { Routes, Route } from "react-router-dom";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./firebase";
// import { isRtl } from "./i18n";

// import Home from "./pages/Home";
// import OrderPage from "./pages/OrderPage";
// import AdminLogin from "./pages/AdminLogin";
// import AdminDashboard from "./pages/AdminDashboard";
// import { useFirestoreMenu } from "./hooks/useFirestoreMenu";

// import ProtectedRoute from "./components/ProtectedRoute";

// export default function App() {
//   // Global language (shared customer/admin)
//   const [lang, setLang] = useState(() => localStorage.getItem("lang") || "id");
//   const rtl = useMemo(() => isRtl(lang), [lang]);

//   // Firestore menu data (customer)
//   const {
//     categories,
//     items,
//     loading: menuLoading,
//     error: menuError,
//   } = useFirestoreMenu({ onlyActive: true });

//   useEffect(() => {
//     localStorage.setItem("lang", lang);
//     document.documentElement.lang = lang;
//     document.documentElement.dir = rtl ? "rtl" : "ltr";
//   }, [lang, rtl]);

//   // Auth state
//   const [user, setUser] = useState(null);
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (u) => setUser(u));
//     return () => unsub();
//   }, []);

//   return (
//     <Routes>
//       <Route
//         path="/"
//         element={
//           <Home
//             lang={lang}
//             setLang={setLang}
//             categories={categories}
//             items={items}
//             menuLoading={menuLoading}
//             menuError={menuError}
//           />
//         }
//       />

//       <Route path="/order/:orderId" element={<OrderPage />} />

//       <Route path="/admin/login" element={<AdminLogin lang={lang} />} />
//       <Route
//         path="/admin"
//         element={
//           <ProtectedRoute user={user}>
//             <AdminDashboard lang={lang} setLang={setLang} />
//           </ProtectedRoute>
//         }
//       />
//     </Routes>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { isRtl } from "./i18n";

import Home from "./pages/Home";
import OrderPage from "./pages/OrderPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { useFirestoreMenu } from "./hooks/useFirestoreMenu";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  // Global language state
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "id");
  const rtl = useMemo(() => isRtl(lang), [lang]);

  // Firestore menu data
  const {
    categories,
    items,
    loading: menuLoading,
    error: menuError,
  } = useFirestoreMenu({ onlyActive: true });

  // Sync Language & RTL Attributes
  useEffect(() => {
    localStorage.setItem("lang", lang);
    const html = document.documentElement;
    html.lang = lang;
    html.dir = rtl ? "rtl" : "ltr";

    // Smooth transition when switching languages
    html.classList.add("duration-300");
  }, [lang, rtl]);

  // Auth state
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                lang={lang}
                setLang={setLang}
                categories={categories}
                items={items}
                menuLoading={menuLoading}
                menuError={menuError}
              />
            }
          />

          <Route path="/order/:orderId" element={<OrderPage />} />

          <Route path="/admin/login" element={<AdminLogin lang={lang} />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute user={user}>
                <AdminDashboard lang={lang} setLang={setLang} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
