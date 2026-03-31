import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/warehouse.type";
import { toast } from "sonner";

export interface CartItem extends Product {
  quantity: number;
}

type Owner = string; // 'guest' hoặc userId

interface CartState {
  owner: Owner;
  items: CartItem[];

  setOwner: (owner: Owner) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  clearCart: () => void;

  mergeGuestToUser: (userId: string) => void;
}

const getStorageKey = (owner: Owner) => `cart_${owner}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      owner: "guest",
      items: [],

      setOwner: (owner) => {
        const key = getStorageKey(owner);
        const data = localStorage.getItem(key);

        set({
          owner,
          items: data ? JSON.parse(data) : [],
        });
      },

      addToCart: (product, quantity = 1) => {
        const safeQuantity = Math.max(1, quantity);

        set((state) => {
          const exist = state.items.find((i) => i.id === product.id);

          let newItems;

          if (exist) {
            newItems = state.items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: i.quantity + safeQuantity }
                : i,
            );
          } else {
            newItems = [...state.items, { ...product, quantity: safeQuantity }];
          }

          localStorage.setItem(
            getStorageKey(state.owner),
            JSON.stringify(newItems),
          );

          return { items: newItems };
        });

        toast.success(`Đã thêm ${safeQuantity} sản phẩm vào giỏ hàng`);
      },

      removeFromCart: (id) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);

          localStorage.setItem(
            getStorageKey(state.owner),
            JSON.stringify(newItems),
          );

          return { items: newItems };
        }),

      increase: (id) =>
        set((state) => {
          const newItems = state.items.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity + 1 } : i,
          );

          localStorage.setItem(
            getStorageKey(state.owner),
            JSON.stringify(newItems),
          );

          return { items: newItems };
        }),

      decrease: (id) =>
        set((state) => {
          const newItems = state.items
            .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0);

          localStorage.setItem(
            getStorageKey(state.owner),
            JSON.stringify(newItems),
          );

          return { items: newItems };
        }),

      clearCart: () =>
        set((state) => {
          localStorage.removeItem(getStorageKey(state.owner));
          return { items: [] };
        }),

      mergeGuestToUser: (userId) => {
        const guestKey = getStorageKey("guest");
        const userKey = getStorageKey(userId);

        const guestItems: CartItem[] = JSON.parse(
          localStorage.getItem(guestKey) || "[]",
        );

        const userItems: CartItem[] = JSON.parse(
          localStorage.getItem(userKey) || "[]",
        );

        const merged = [...userItems];

        guestItems.forEach((g) => {
          const exist = merged.find((i) => i.id === g.id);

          if (exist) {
            exist.quantity += g.quantity;
          } else {
            merged.push(g);
          }
        });

        localStorage.setItem(userKey, JSON.stringify(merged));
        localStorage.removeItem(guestKey);

        set({
          owner: userId,
          items: merged,
        });
      },
    }),
    {
      name: "cart-temp", // không dùng chính
    },
  ),
);
