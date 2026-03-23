import { create } from 'zustand';
import { toast } from 'sonner';
import { stockInApi } from '@/api/warehouse.api';
import type { CreateStockInDto, StockIn } from '@/types/warehouse.type';

interface StockInState {
  stockIns: StockIn[];
  selectedStockIn: StockIn | null;
  isLoading: boolean;
  fetchStockIns: () => Promise<void>;
  fetchStockInById: (id: string) => Promise<void>;
  createTicket: (data: CreateStockInDto) => Promise<void>;
}

export const useStockInStore = create<StockInState>((set, get) => ({
  stockIns: [],
  selectedStockIn: null,
  isLoading: false,

  fetchStockIns: async () => {
    set({ isLoading: true });
    try {
      const data = await stockInApi.getStockIns();
      set({ stockIns: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Lỗi khi tải danh sách phiếu nhập kho');
      throw error;
    }
  },

  fetchStockInById: async (id: string) => {
    set({ isLoading: true, selectedStockIn: null });
    try {
      const data = await stockInApi.getStockInById(id);
      set({ selectedStockIn: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Lỗi khi tải thông tin phiếu nhập kho');
      throw error;
    }
  },

  createTicket: async (data: CreateStockInDto) => {
    set({ isLoading: true });
    try {
      await stockInApi.createStockIn(data);
      toast.success('Tạo phiếu nhập kho thành công');
      await get().fetchStockIns();
    } catch (error) {
      toast.error('Tạo phiếu nhập kho thất bại');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));