import { apiGet, apiPatch, apiPost } from "./base";
import type {
  CreatePromotionDto,
  Promotion,
  UpdatePromotionDto,
} from "@/types/promotion.type";

export const promotionApi = {
  getPromotions: async () => {
    return apiGet<Promotion[]>("/promotions");
  },

  createPromotion: async (data: CreatePromotionDto) => {
    return apiPost<Promotion>("/promotions", data);
  },

  updatePromotion: async (id: string, data: UpdatePromotionDto) => {
    return apiPatch<Promotion>(`/promotions/${id}`, data);
  },

  setPromotionProducts: async (id: string, productIds: string[]) => {
    return apiPatch<Promotion>(`/promotions/${id}/products`, {
      productIds,
    });
  },
};
