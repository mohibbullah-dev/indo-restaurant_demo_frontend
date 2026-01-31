import { LANGS } from "../i18n";

export default function LanguageSwitcher({ lang, setLang }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 p-1 backdrop-blur">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={[
            "px-3 py-1 text-sm rounded-full transition",
            lang === l.code
              ? "bg-black text-white"
              : "text-black/70 hover:bg-black/5",
          ].join(" ")}
          type="button"
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
