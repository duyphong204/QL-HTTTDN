import { axiosInstance } from "./axios";
import type {
  CreatePromotionDto,
  Promotion,
  UpdatePromotionDto,
} from "@/types/promotion.type";

export const promotionApi = {
  getPromotions: async () => {
    const res = await axiosInstance.get<Promotion[]>("/promotions");
    return res.data;
  },

  createPromotion: async (data: CreatePromotionDto) => {
    const res = await axiosInstance.post<Promotion>("/promotions", data);
    return res.data;
  },

  updatePromotion: async (id: string, data: UpdatePromotionDto) => {
    const res = await axiosInstance.patch<Promotion>(`/promotions/${id}`, data);
    return res.data;
  },

  setPromotionProducts: async (id: string, productIds: string[]) => {
    const res = await axiosInstance.patch<Promotion>(
      `/promotions/${id}/products`,
      {
        productIds,
      },
    );
    return res.data;
  },
};
