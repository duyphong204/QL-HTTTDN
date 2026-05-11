import { create } from "zustand";
import { toast } from "sonner";
import { promotionApi } from "@/services/promotion.service";
import type {
  CreatePromotionDto,
  Promotion,
  UpdatePromotionDto,
} from "@/types/promotion.type";

interface PromotionState {
  promotions: Promotion[];
  isLoading: boolean;
  fetchPromotions: () => Promise<void>;
  createPromotion: (data: CreatePromotionDto) => Promise<void>;
  updatePromotion: (id: string, data: UpdatePromotionDto) => Promise<void>;
  setPromotionProducts: (id: string, productIds: string[]) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
}

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Loi khong xac dinh";

export const usePromotionStore = create<PromotionState>((set, get) => ({
  promotions: [],
  isLoading: false,

  fetchPromotions: async () => {
    set({ isLoading: true });
    try {
      const promotions = await promotionApi.getPromotions();
      set({ promotions, isLoading: false });
    } catch (error) {
      toast.error(toErrorMessage(error));
      set({ isLoading: false });
    }
  },

  createPromotion: async (data) => {
    try {
      await promotionApi.createPromotion(data);
      toast.success("Tao chuong trinh khuyen mai thanh cong");
      await get().fetchPromotions();
    } catch (error) {
      toast.error(toErrorMessage(error));
      throw error;
    }
  },

  updatePromotion: async (id, data) => {
    try {
      await promotionApi.updatePromotion(id, data);
      toast.success("Cap nhat chuong trinh khuyen mai thanh cong");
      await get().fetchPromotions();
    } catch (error) {
      toast.error(toErrorMessage(error));
      throw error;
    }
  },

  setPromotionProducts: async (id, productIds) => {
    try {
      await promotionApi.setPromotionProducts(id, productIds);
      toast.success("Gan san pham vao chuong trinh thanh cong");
      await get().fetchPromotions();
    } catch (error) {
      toast.error(toErrorMessage(error));
      throw error;
    }
  },
  deletePromotion: async (id) => {
    try {
      await promotionApi.deletePromotion(id);
      toast.success("Xoa chuong trinh khuyen mai thanh cong");
      await get().fetchPromotions();
    } catch (error) {
      toast.error(toErrorMessage(error));
      throw error;
    }
  },
}));
