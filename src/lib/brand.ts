export type ProductBrand = "salesyar" | "moshaversho";

export const PRODUCT_BRANDS = {
  salesyar: {
    id: "salesyar",
    name: "فروشیار",
    fullName: "فروشیار AI",
    tagline: "تحلیل هوشمند فروش و فرصت‌های رشد",
    primary: "#2563eb",
    accent: "#1d4ed8",
    soft: "#eff6ff",
    theme: "blue",
  },
  moshaversho: {
    id: "moshaversho",
    name: "مشاورشو",
    fullName: "مشاورشو",
    tagline: "فضای حرفه‌ای مشاوران و پروژه‌ها",
    primary: "#059669",
    accent: "#047857",
    soft: "#ecfdf5",
    theme: "green",
  },
} as const;

export function getProductBrand(brand: ProductBrand = "salesyar") {
  return PRODUCT_BRANDS[brand];
}
