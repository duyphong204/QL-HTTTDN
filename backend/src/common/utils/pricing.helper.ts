export type PromotionPricingLike = {
  id: string;
  name: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  isActive: boolean;
  startAt: Date | null;
  endAt: Date | null;
};

export type ProductPricingLike = {
  price: number;
  promotionLinks?: Array<{
    promotion: PromotionPricingLike;
  }>;
} & Record<string, any>;

export const resolveActivePromotion = (
  product: Pick<ProductPricingLike, 'promotionLinks'>,
): PromotionPricingLike | undefined => {
  const now = new Date();

  const link = (product.promotionLinks ?? []).find(({ promotion }) => {
    if (!promotion.isActive) {
      return false;
    }

    if (promotion.startAt && promotion.startAt > now) {
      return false;
    }

    if (promotion.endAt && promotion.endAt < now) {
      return false;
    }

    return true;
  });

  return link?.promotion;
};

export const calculateSalePrice = (
  price: number,
  promotion?: Pick<PromotionPricingLike, 'type' | 'value'>,
): number => {
  if (!promotion) {
    return price;
  }

  if (promotion.type === 'PERCENT') {
    const percent = Math.max(0, Math.min(100, promotion.value));
    return Math.max(0, price * (1 - percent / 100));
  }

  return Math.max(0, price - promotion.value);
};

export const enrichProductPricing = <T extends ProductPricingLike>(
  product: T,
) => {
  const promotion = resolveActivePromotion(product);
  const salePrice = calculateSalePrice(product.price, promotion);
  const isOnSale = !!promotion && salePrice < product.price;
  const discountPercent =
    isOnSale && product.price > 0
      ? Math.round(((product.price - salePrice) / product.price) * 100)
      : 0;

  const { promotionLinks, ...rest } = product;

  return {
    ...rest,
    isOnSale,
    salePrice,
    discountPercent,
    promotionName: promotion?.name,
    promotionId: promotion?.id,
  };
};
