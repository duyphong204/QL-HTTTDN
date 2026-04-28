import { create } from "zustand";
import { toast } from "sonner";
import { cartApi } from "@/api/order.api";
import type { Product } from "@/types/warehouse.type";
import type {
  Cart as ServerCart,
  SyncCartDto,
  AddToCartDto,
} from "@/types/sales.type";

export interface CartItem extends Product {
  quantity: number;
}

type Owner = string;

interface CartState {
  owner: Owner;
  items: CartItem[];
  isLoading: boolean;

  setOwner: (owner: Owner) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  increase: (id: string) => Promise<void>;
  decrease: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;

  mergeGuestToUser: (userId: string) => Promise<void>;
}

const getStorageKey = (owner: Owner) => `cart_${owner}`;
const isGuest = (owner: Owner) => owner === "guest";

const getAvailableStock = (product: Product, currentQuantity = 0): number =>
  Math.max(0, (product.stockQuantity ?? 0) - currentQuantity);

const readGuestItems = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(getStorageKey("guest"));
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveGuestItems = (items: CartItem[]): void => {
  localStorage.setItem(getStorageKey("guest"), JSON.stringify(items));
};

const clearGuestItems = (): void => {
  localStorage.removeItem(getStorageKey("guest"));
};

const flattenServerCart = (cart: ServerCart | null | undefined): CartItem[] =>
  cart?.items.map((item) => ({
    ...item.product,
    quantity: item.quantity,
  })) ?? [];

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Lỗi không xác định";

export const useCartStore = create<CartState>((set, get) => ({
  owner: "guest",
  items: [],
  isLoading: false,

  setOwner: async (owner) => {
    set({ owner, isLoading: true });

    if (isGuest(owner)) {
      set({
        items: readGuestItems(),
        isLoading: false,
      });
      return;
    }

    try {
      const cart = await cartApi.getCart();
      set({ items: flattenServerCart(cart), isLoading: false });
    } catch (error) {
      toast.error(toErrorMessage(error));
      set({ items: [], isLoading: false });
    }
  },

  addToCart: async (product, quantity = 1) => {
    const safeQuantity = Math.max(1, quantity);
    const state = get();
    const exist = state.items.find((item) => item.id === product.id);
    const currentQuantity = exist?.quantity ?? 0;
    const availableStock = getAvailableStock(product, currentQuantity);

    if (availableStock <= 0) {
      toast.error("Sản phẩm đã đạt số lượng tối đa trong giỏ hàng");
      return;
    }

    const quantityToAdd = Math.min(safeQuantity, availableStock);

    if (isGuest(state.owner)) {
      const newItems = exist
        ? state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item,
          )
        : [...state.items, { ...product, quantity: quantityToAdd }];

      saveGuestItems(newItems);
      set({ items: newItems });

      if (quantityToAdd < safeQuantity) {
        toast.error(`Chỉ còn ${availableStock} sản phẩm trong kho`);
      } else {
        toast.success(`Đã thêm ${quantityToAdd} sản phẩm vào giỏ hàng`);
      }
      return;
    }

    try {
      const cart = await cartApi.addToCart({
        productId: product.id,
        quantity: quantityToAdd,
      });
      set({ items: flattenServerCart(cart) });

      if (quantityToAdd < safeQuantity) {
        toast.error(`Chỉ còn ${availableStock} sản phẩm trong kho`);
      } else {
        toast.success(`Đã thêm ${quantityToAdd} sản phẩm vào giỏ hàng`);
      }
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  },

  removeFromCart: async (id) => {
    const state = get();

    if (isGuest(state.owner)) {
      const newItems = state.items.filter((item) => item.id !== id);
      saveGuestItems(newItems);
      set({ items: newItems });
      return;
    }

    try {
      const cart = await cartApi.removeCartItem(id);
      set({ items: flattenServerCart(cart) });
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  },

  increase: async (id) => {
    const state = get();
    const targetItem = state.items.find((item) => item.id === id);
    if (!targetItem) {
      return;
    }

    const remainingStock = getAvailableStock(targetItem, targetItem.quantity);
    if (remainingStock <= 0) {
      toast.error("Đã đạt số lượng tồn kho tối đa");
      return;
    }

    if (isGuest(state.owner)) {
      const newItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );
      saveGuestItems(newItems);
      set({ items: newItems });
      return;
    }

    try {
      const cart = await cartApi.updateCartItem(id, targetItem.quantity + 1);
      set({ items: flattenServerCart(cart) });
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  },

  decrease: async (id) => {
    const state = get();
    const targetItem = state.items.find((item) => item.id === id);
    if (!targetItem) {
      return;
    }

    if (isGuest(state.owner)) {
      const newItems = state.items
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0);

      saveGuestItems(newItems);
      set({ items: newItems });
      return;
    }

    try {
      if (targetItem.quantity <= 1) {
        const cart = await cartApi.removeCartItem(id);
        set({ items: flattenServerCart(cart) });
        return;
      }

      const cart = await cartApi.updateCartItem(id, targetItem.quantity - 1);
      set({ items: flattenServerCart(cart) });
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  },

  clearCart: async () => {
    const state = get();

    if (isGuest(state.owner)) {
      clearGuestItems();
      set({ items: [] });
      return;
    }

    try {
      const cart = await cartApi.clearCart();
      set({ items: flattenServerCart(cart) });
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  },

  mergeGuestToUser: async (userId) => {
    const guestItems = readGuestItems();

    if (!guestItems.length) {
      await get().setOwner(userId);
      return;
    }

    const payload: SyncCartDto = {
      items: guestItems.map<AddToCartDto>((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const cart = await cartApi.syncCart(payload);
      clearGuestItems();
      set({
        owner: userId,
        items: flattenServerCart(cart),
      });
    } catch (error) {
      toast.error(toErrorMessage(error));
      await get().setOwner(userId);
    }
  },
}));
