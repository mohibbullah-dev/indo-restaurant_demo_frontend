import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { t } from "../i18n";

export default function AdminLogin({ lang }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Router will redirect via ProtectedRoute
    } catch (e2) {
      console.error(e2);
      setErr("Login failed. Check email/password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-md px-4 py-10">
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="text-lg font-semibold">{t(lang, "admin")}</div>
          <div className="mt-1 text-sm text-zinc-500">{t(lang, "login")}</div>

          <form onSubmit={submit} className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-zinc-700">
                {t(lang, "email")}
              </span>
              <input
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-zinc-700">
                {t(lang, "password")}
              </span>
              <input
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </label>

            {err ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                {err}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className={[
                "rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm active:scale-[0.99]",
                loading ? "bg-black/30 text-white/80" : "bg-black text-white",
              ].join(" ")}
            >
              {loading ? "..." : t(lang, "signIn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
