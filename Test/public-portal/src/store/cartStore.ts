import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, OrderReceipt, Product } from '@/types';

const MAX_QTY = 999;

export const makeLineId = (productId: string, options: Record<string, string>, customization: string): string =>
  `${productId}::${Object.keys(options).sort().map((k) => `${k}=${options[k]}`).join('|')}::${customization.trim().toLowerCase()}`;

interface CartState {
  items: CartItem[];
  add: (product: Product, qty?: number, options?: Record<string, string>, customization?: string) => void;
  setQuantity: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product, qty = 1, options = {}, customization = '') =>
        set((s) => {
          const lineId = makeLineId(product.id, options, customization);
          const existing = s.items.find((i) => i.lineId === lineId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.lineId === lineId ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + qty) } : i,
              ),
            };
          }
          const item: CartItem = {
            lineId,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0] ?? null,
            unitPrice: product.price,
            currency: product.currency,
            quantity: Math.min(MAX_QTY, Math.max(1, qty)),
            options,
            customization: customization.trim(),
          };
          return { items: [...s.items, item] };
        }),
      setQuantity: (lineId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.lineId !== lineId)
              : s.items.map((i) => (i.lineId === lineId ? { ...i, quantity: Math.min(MAX_QTY, qty) } : i)),
        })),
      remove: (lineId) => set((s) => ({ items: s.items.filter((i) => i.lineId !== lineId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'showcase-cart-v1',
      storage: createJSONStorage(() => localStorage),
      // Image data URIs from mock mode are large; only persist lightweight fields.
      partialize: (s) => ({ items: s.items.map((i) => ({ ...i, image: i.image?.startsWith('data:') ? null : i.image })) }),
    },
  ),
);

export const cartCount = (items: CartItem[]): number => items.reduce((n, i) => n + i.quantity, 0);

export const cartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, i) => sum + (i.unitPrice ?? 0) * i.quantity, 0);
  const hasUnpricedItems = items.some((i) => i.unitPrice === null);
  const currency = items[0]?.currency ?? 'INR';
  return { subtotal, hasUnpricedItems, currency };
};

/* Last placed order — kept in sessionStorage so the confirmation page survives a refresh. */
interface OrderState {
  receipt: OrderReceipt | null;
  setReceipt: (r: OrderReceipt | null) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({ receipt: null, setReceipt: (receipt) => set({ receipt }) }),
    { name: 'showcase-last-order-v1', storage: createJSONStorage(() => sessionStorage) },
  ),
);
