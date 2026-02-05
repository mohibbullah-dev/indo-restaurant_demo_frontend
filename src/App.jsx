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
//   // Global language state
//   const [lang, setLang] = useState(() => localStorage.getItem("lang") || "id");
//   const rtl = useMemo(() => isRtl(lang), [lang]);

//   // Firestore menu data
//   const {
//     categories,
//     items,
//     loading: menuLoading,
//     error: menuError,
//   } = useFirestoreMenu({ onlyActive: true });

//   // Sync Language & RTL Attributes
//   useEffect(() => {
//     localStorage.setItem("lang", lang);
//     const html = document.documentElement;
//     html.lang = lang;
//     html.dir = rtl ? "rtl" : "ltr";

//     // Smooth transition when switching languages
//     html.classList.add("duration-300");
//   }, [lang, rtl]);

//   // Auth state
//   const [user, setUser] = useState(null);
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (u) => setUser(u));
//     return () => unsub();
//   }, []);

//   return (
//     <div className="min-h-screen w-full flex flex-col">
//       <main className="flex-grow">
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <Home
//                 lang={lang}
//                 setLang={setLang}
//                 categories={categories}
//                 items={items}
//                 menuLoading={menuLoading}
//                 menuError={menuError}
//               />
//             }
//           />

//           <Route path="/order/:orderId" element={<OrderPage />} />

//           <Route path="/admin/login" element={<AdminLogin lang={lang} />} />

//           <Route
//             path="/admin/*"
//             element={
//               <ProtectedRoute user={user}>
//                 <AdminDashboard lang={lang} setLang={setLang} />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </main>
//     </div>
//   );
// }

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
//   // Global language state
//   const [lang, setLang] = useState(() => localStorage.getItem("lang") || "id");
//   const rtl = useMemo(() => isRtl(lang), [lang]);

//   // Firestore menu data
//   const {
//     categories,
//     items,
//     loading: menuLoading,
//     error: menuError,
//   } = useFirestoreMenu({ onlyActive: true });

//   // Sync Language & Viewport Behavior
//   useEffect(() => {
//     localStorage.setItem("lang", lang);
//     const html = document.documentElement;
//     html.lang = lang;
//     html.dir = rtl ? "rtl" : "ltr";

//     // Prevent elastic bouncing on mobile browsers (App feel)
//     html.style.overflow = "hidden";
//     html.style.height = "100%";
//     document.body.style.overflow = "hidden";
//     document.body.style.height = "100%";

//     html.classList.add(
//       "antialiased",
//       "selection:bg-zinc-900",
//       "selection:text-white",
//     );
//   }, [lang, rtl]);

//   // Auth state
//   const [user, setUser] = useState(null);
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (u) => setUser(u));
//     return () => unsub();
//   }, []);

//   return (
//     /**
//      * MOBILE APP CONTAINER
//      * - h-dvh: Uses the dynamic viewport height (handles mobile browser bars)
//      * - select-none: Prevents accidental text selection while tapping
//      * - touch-manipulation: Removes double-tap zoom delay
//      */
//     <div className="h-dvh w-full flex flex-col bg-zinc-50 overflow-hidden select-none touch-manipulation font-sans">
//       {/* Scrollable Area */}
//       <main className="flex-grow overflow-y-auto overflow-x-hidden scroll-smooth pb-safe">
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <Home
//                 lang={lang}
//                 setLang={setLang}
//                 categories={categories}
//                 items={items}
//                 menuLoading={menuLoading}
//                 menuError={menuError}
//               />
//             }
//           />

//           <Route path="/order/:orderId" element={<OrderPage />} />

//           <Route path="/admin/login" element={<AdminLogin lang={lang} />} />

//           <Route
//             path="/admin/*"
//             element={
//               <ProtectedRoute user={user}>
//                 <AdminDashboard lang={lang} setLang={setLang} />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </main>

//       {/* Note: If you add a Navigation Bar later, it should sit here outside <main> */}
//     </div>
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
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const rtl = useMemo(() => isRtl(lang), [lang]);

  // Firestore menu data
  const {
    categories,
    items,
    loading: menuLoading,
    error: menuError,
  } = useFirestoreMenu({ onlyActive: true });

  // Sync Language & Viewport Behavior
  useEffect(() => {
    localStorage.setItem("lang", lang);
    const html = document.documentElement;
    html.lang = lang;
    html.dir = rtl ? "rtl" : "ltr";

    // Set height for mobile browsers
    html.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.backgroundColor = "#f9f9fb"; // zinc-50

    html.classList.add(
      "antialiased",
      "selection:bg-zinc-900",
      "selection:text-white",
    );
  }, [lang, rtl]);

  // Auth state
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    /**
     * MOBILE APP WRAPPER
     * h-dvh (dynamic viewport height) ensures it fills the screen even with mobile browser bars.
     * flex-col + overflow-hidden prevents the whole page from bouncing,
     * while the <main> handles the actual scrolling.
     */
    <div className="flex flex-col h-dvh w-full bg-zinc-50 font-sans touch-manipulation">
      <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
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
