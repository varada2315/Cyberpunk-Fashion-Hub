export interface VariantProductLike {
  colors?: string[];
  sizes?: string[];
  stockByVariant?: Record<string, number>;
}

export const getVariantKey = (color: string, size: string) => `${color}::${size}`;

export const normalizeStockQuantity = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

export const hasVariantStockMap = (product?: VariantProductLike | null) => {
  if (!product || !product.stockByVariant || typeof product.stockByVariant !== "object") return false;
  return Object.keys(product.stockByVariant).length > 0;
};

export const getVariantStock = (
  product: VariantProductLike | null | undefined,
  color: string | null | undefined,
  size: string | null | undefined,
): number | null => {
  if (!hasVariantStockMap(product)) return null;
  if (!color || !size) return 0;
  return normalizeStockQuantity(product?.stockByVariant?.[getVariantKey(color, size)]);
};

export const getTotalVariantStock = (product: VariantProductLike | null | undefined): number | null => {
  if (!hasVariantStockMap(product)) return null;
  return Object.values(product?.stockByVariant || {}).reduce((sum, qty) => sum + normalizeStockQuantity(qty), 0);
};

export const findFirstAvailableVariant = (
  product: VariantProductLike | null | undefined,
): { color: string; size: string } | null => {
  const colors = Array.isArray(product?.colors) ? product.colors : [];
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];

  if (colors.length === 0 || sizes.length === 0) {
    return null;
  }

  if (!hasVariantStockMap(product)) {
    return { color: colors[0], size: sizes[0] };
  }

  for (const color of colors) {
    for (const size of sizes) {
      const stock = getVariantStock(product, color, size);
      if (stock !== null && stock > 0) {
        return { color, size };
      }
    }
  }

  return null;
};
