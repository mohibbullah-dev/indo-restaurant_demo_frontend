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

    // second feature starts
    menuTitle: "Menu",
    categories: "Categories",
    all: "All",
    add: "Add",
    added: "Added",
    qty: "Qty",
    cart: "Cart",
    items: "items",
    emptyCart: "Your cart is empty",
    total: "Total",
    checkout: "Checkout",
    clear: "Clear",
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
    // second feature starts
    menuTitle: "Menu",
    categories: "Kategori",
    all: "Semua",
    add: "Tambah",
    added: "Ditambah",
    qty: "Jumlah",
    cart: "Keranjang",
    items: "item",
    emptyCart: "Keranjang kosong",
    total: "Total",
    checkout: "Lanjut",
    clear: "Hapus",
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
    // second feature starts
    menuTitle: "القائمة",
    categories: "الأقسام",
    all: "الكل",
    add: "إضافة",
    added: "تمت الإضافة",
    qty: "الكمية",
    cart: "السلة",
    items: "عناصر",
    emptyCart: "سلتك فارغة",
    total: "الإجمالي",
    checkout: "إكمال الطلب",
    clear: "مسح",
  },
};
