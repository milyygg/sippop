import { beforeEach, describe, it, expect } from "vitest";
import { useCart, cartTotal, validLines } from "./cart";
import { priceFor, products } from "../data/products";
describe("cart", () => {
  beforeEach(() => useCart.getState().clear());
  it("merges identical volumes while keeping variants separate", () => {
    const c = useCart.getState();
    c.add("strawberry-cloud", 350);
    c.add("strawberry-cloud", 350);
    c.add("strawberry-cloud", 500);
    expect(useCart.getState().lines).toEqual([
      { productId: "strawberry-cloud", size: 350, quantity: 2 },
      { productId: "strawberry-cloud", size: 500, quantity: 1 },
    ]);
    expect(cartTotal(useCart.getState().lines)).toBe(1120);
  });
  it("decrements, removes and clears lines", () => {
    const c = useCart.getState();
    c.add("strawberry-cloud", 350);
    c.change("strawberry-cloud", 350, -1);
    expect(useCart.getState().lines).toHaveLength(0);
    c.add("mango-madness", 500);
    c.remove("mango-madness", 500);
    expect(useCart.getState().lines).toHaveLength(0);
    c.add("matcha-cloud", 350);
    c.clear();
    expect(cartTotal(useCart.getState().lines)).toBe(0);
  });
  it("rejects invalid products, sizes and persisted data", () => {
    const c = useCart.getState();
    c.add("missing", 350);
    c.add("strawberry-cloud", 42);
    expect(c.lines).toHaveLength(0);
    expect(
      validLines([
        null,
        { productId: "missing", size: 350, quantity: 1 },
        { productId: "strawberry-cloud", size: 350, quantity: -3 },
        { productId: "strawberry-cloud", size: 350, quantity: Infinity },
      ]),
    ).toEqual([]);
  });
  it("caps quantities at 99", () => {
    const c = useCart.getState();
    c.add("strawberry-cloud", 350);
    c.change("strawberry-cloud", 350, 999);
    expect(useCart.getState().lines[0].quantity).toBe(99);
  });
  it("has complete bilingual data and 24 unique items", () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(24);
    expect(new Set(products.map((p) => p.image)).size).toBe(24);
    for (const p of products) {
      expect(
        p.name.ru && p.name.en && p.description.ru && p.description.en,
      ).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
    }
    expect(priceFor(products[0], 500)).toBe(420);
  });
});
