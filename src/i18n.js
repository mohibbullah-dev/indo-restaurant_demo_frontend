export const LANGS = [
  { code: "id", label: "ID" },
  { code: "ar", label: "AR" },
  { code: "en", label: "EN" },
];

export const isRtl = (lang) => lang === "ar";

export const t = (lang, key) => {
  const dict = translations[lang] || translations.en;
  return dict[key] ?? translations.en[key] ?? key;
};

const translations = {
  en: {
    brand: "Order Food",
    open: "Open",
    closed: "Closed",
    openNow: "We’re accepting orders now",
    closedNow: "We’re currently closed",
    viewMenu: "View Menu",
    quickOrder: "Quick Order",
    subtitle: "Fast mobile ordering",
  },
  id: {
    brand: "Pesan Makanan",
    open: "Buka",
    closed: "Tutup",
    openNow: "Kami menerima pesanan sekarang",
    closedNow: "Kami sedang tutup",
    viewMenu: "Lihat Menu",
    quickOrder: "Pesan Cepat",
    subtitle: "Pemesanan cepat via HP",
  },
  ar: {
    brand: "طلب الطعام",
    open: "مفتوح",
    closed: "مغلق",
    openNow: "نستقبل الطلبات الآن",
    closedNow: "نحن مغلقون حالياً",
    viewMenu: "عرض القائمة",
    quickOrder: "طلب سريع",
    subtitle: "طلب سريع عبر الهاتف",
  },
};
