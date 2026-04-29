import type { Product } from "@/types/warehouse.type";

type ProductPricingSource = Pick<
  Product,
  "price" | "salePrice" | "isOnSale" | "discountPercent"
>;

export const getEffectiveProductPrice = (
  product: ProductPricingSource | undefined,
  priceOverride?: number,
): number => {
  if (!product) {
    return 0;
  }

  if (typeof priceOverride === "number" && Number.isFinite(priceOverride)) {
    return priceOverride;
  }

  if (
    product.isOnSale &&
    typeof product.salePrice === "number" &&
    product.salePrice < product.price
  ) {
    return product.salePrice;
  }

  return product.price;
};

export const hasProductSale = (product: ProductPricingSource): boolean =>
  getEffectiveProductPrice(product) < product.price;

export const getProductDiscountPercent = (
  product: ProductPricingSource | undefined,
  effectivePrice?: number,
): number => {
  if (!product) {
    return 0;
  }

  const price =
    typeof effectivePrice === "number"
      ? effectivePrice
      : getEffectiveProductPrice(product);

  if (price >= product.price || product.price <= 0) {
    return product.discountPercent ?? 0;
  }

  return Math.round(((product.price - price) / product.price) * 100);
};
