export const CATEGORIES = [
  { id: "all", name: { en: "All", id: "Semua", ar: "الكل" } },
  { id: "rice", name: { en: "Rice", id: "Nasi", ar: "أرز" } },
  { id: "noodles", name: { en: "Noodles", id: "Mie", ar: "نودلز" } },
  { id: "chicken", name: { en: "Chicken", id: "Ayam", ar: "دجاج" } },
  { id: "drinks", name: { en: "Drinks", id: "Minuman", ar: "مشروبات" } },
];

export const MENU_ITEMS = [
  {
    id: "nasi-goreng",
    category: "rice",
    name: { en: "Nasi Goreng", id: "Nasi Goreng", ar: "ناسي جورينج" },
    desc: {
      en: "Fried rice with egg and spices",
      id: "Nasi goreng dengan telur dan bumbu",
      ar: "أرز مقلي مع البيض والتوابل",
    },
    price: 85,
  },
  {
    id: "ayam-geprek",
    category: "chicken",
    name: { en: "Ayam Geprek", id: "Ayam Geprek", ar: "دجاج جيبريك" },
    desc: {
      en: "Crispy chicken with chili",
      id: "Ayam crispy dengan sambal",
      ar: "دجاج مقرمش مع شطة",
    },
    price: 95,
  },
  {
    id: "mie-goreng",
    category: "noodles",
    name: { en: "Mie Goreng", id: "Mie Goreng", ar: "مي جورينج" },
    desc: {
      en: "Fried noodles with vegetables",
      id: "Mie goreng dengan sayur",
      ar: "نودلز مقلية مع خضار",
    },
    price: 80,
  },
  {
    id: "es-teh",
    category: "drinks",
    name: { en: "Iced Tea", id: "Es Teh", ar: "شاي مثلج" },
    desc: {
      en: "Fresh iced tea",
      id: "Teh dingin segar",
      ar: "شاي بارد منعش",
    },
    price: 25,
  },
];
