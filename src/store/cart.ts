import { create } from "zustand";
import { products, priceFor } from "../data/products";
import { readStored, writeStored } from "../lib/storage";
export interface CartLine {
  productId: string;
  size: number;
  quantity: number;
}
export function validLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const result: CartLine[] = [];
  for (const line of raw) {
    if (!line || typeof line !== "object") continue;
    const p = products.find((p) => p.id === line.productId);
    if (
      !p ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 99 ||
      !(p.sizes.length ? p.sizes.includes(line.size) : line.size === 0)
    )
      continue;
    const match = result.find(
      (r) => r.productId === line.productId && r.size === line.size,
    );
    if (match) match.quantity = Math.min(99, match.quantity + line.quantity);
    else
      result.push({
        productId: p.id,
        size: line.size,
        quantity: line.quantity,
      });
  }
  return result;
}
function load() {
  try {
    return validLines(JSON.parse(readStored("sippop-cart") ?? "[]"));
  } catch {
    return [];
  }
}
export const cartTotal = (lines: CartLine[]) =>
  lines.reduce(
    (sum, l) =>
      sum +
      priceFor(
        products.find((p) => p.id === l.productId)!,
        l.size,
      ) *
        l.quantity,
    0,
  );
interface CartState {
  lines: CartLine[];
  add: (productId: string, size: number) => void;
  change: (productId: string, size: number, delta: number) => void;
  remove: (productId: string, size: number) => void;
  clear: () => void;
}
export const useCart = create<CartState>((set) => ({
  lines: load(),
  add: (productId, size) =>
    set((s) => {
      const p = products.find((p) => p.id === productId);
      if (!p || !(p.sizes.length ? p.sizes.includes(size) : size === 0))
        return s;
      const exists = s.lines.some(
        (l) => l.productId === productId && l.size === size,
      );
      return {
        lines: exists
          ? s.lines.map((l) =>
              l.productId === productId && l.size === size
                ? { ...l, quantity: Math.min(99, l.quantity + 1) }
                : l,
            )
          : [...s.lines, { productId, size, quantity: 1 }],
      };
    }),
  change: (productId, size, delta) =>
    set((s) => ({
      lines: s.lines
        .map((l) =>
          l.productId === productId && l.size === size
            ? { ...l, quantity: Math.min(99, l.quantity + delta) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    })),
  remove: (productId, size) =>
    set((s) => ({
      lines: s.lines.filter(
        (l) => l.productId !== productId || l.size !== size,
      ),
    })),
  clear: () => set({ lines: [] }),
}));
useCart.subscribe((s) => writeStored("sippop-cart", JSON.stringify(s.lines)));
