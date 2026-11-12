import { useEffect, useRef, useState } from "react";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowUpRight,
  ShoppingBag,
  Bike,
  Store,
  Check,
} from "lucide-react";
import { motion } from "motion/react";
import type { Lang } from "../data/products";
import { products, priceFor } from "../data/products";
import { useCart, cartTotal } from "../store/cart";
import type { Copy } from "../i18n";
export default function CartDrawer({
  lang,
  t,
  onClose,
}: {
  lang: Lang;
  t: Copy;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { lines, change, remove, clear } = useCart();
  const [step, setStep] = useState<"cart" | "checkout" | "done">("cart");
  const [method, setMethod] = useState("pickup");
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const el = dialog.current!;
    el.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el.close();
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="cart-dialog"
      aria-labelledby="cart-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="cart-panel"
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.24 }}
      >
        <header>
          <h2 id="cart-title">
            {step === "cart"
              ? t.cart
              : step === "checkout"
                ? t.checkoutTitle
                : t.done}
          </h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label={t.close}
          >
            <X />
          </button>
        </header>
        {step === "done" ? (
          <div className="empty-state">
            <Check size={58} />
            <h3>{t.done}</h3>
            <p role="status">{t.demoComplete}</p>
            <button className="button" onClick={onClose}>
              {t.openMenu}
              <ArrowUpRight size={18} />
            </button>
          </div>
        ) : !lines.length ? (
          <div className="empty-state">
            <ShoppingBag size={62} />
            <h3>{t.empty}</h3>
            <p>{t.emptyCopy}</p>
            <button
              className="button"
              onClick={() => {
                onClose();
                document.getElementById("menu")?.scrollIntoView();
              }}
            >
              {t.discover}
            </button>
          </div>
        ) : step === "cart" ? (
          <>
            <div className="cart-lines">
              {lines.map((l) => {
                const p = products.find((p) => p.id === l.productId)!;
                return (
                  <article className="cart-line" key={`${p.id}-${l.size}`}>
                    <img src={p.image} alt="" width="80" height="100" />
                    <div>
                      <h3>{p.name[lang]}</h3>
                      <p>
                        {l.size ? `${l.size} ${t.ml}` : t.dessertNote} ·{" "}
                        {priceFor(p, l.size)} ₽
                      </p>
                      <div className="quantity">
                        <button
                          aria-label={`${t.decrease}: ${p.name[lang]}`}
                          onClick={() => change(p.id, l.size, -1)}
                        >
                          <Minus size={15} />
                        </button>
                        <span aria-live="polite">{l.quantity}</span>
                        <button
                          aria-label={`${t.increase}: ${p.name[lang]}`}
                          onClick={() => change(p.id, l.size, 1)}
                          disabled={l.quantity >= 99}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="icon-button remove"
                      aria-label={`${t.remove}: ${p.name[lang]}`}
                      onClick={() => remove(p.id, l.size)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </article>
                );
              })}
              <button className="text-button" onClick={clear}>
                {t.clear}
              </button>
            </div>
            <div className="cart-summary">
              <div>
                <span>{t.total}</span>
                <strong>{cartTotal(lines)} ₽</strong>
              </div>
              <button className="button" onClick={() => setStep("checkout")}>
                {t.checkout}
                <ArrowUpRight size={20} />
              </button>
              <p>{t.demo}</p>
            </div>
          </>
        ) : (
          <div className="checkout-content">
            <button className="text-button" onClick={() => setStep("cart")}>
              <ArrowLeft size={18} />
              {t.back}
            </button>
            <fieldset className="delivery-options">
              <legend>
                {t.pickup} / {t.delivery}
              </legend>
              {(["pickup", "delivery"] as const).map((m) => (
                <label className={method === m ? "selected" : ""} key={m}>
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    checked={method === m}
                    onChange={() => setMethod(m)}
                  />
                  {m === "pickup" ? <Store /> : <Bike />}
                  {t[m]}
                </label>
              ))}
            </fieldset>
            <p className="checkout-note">
              {method === "pickup" ? t.pickupNote : t.deliveryNote}
            </p>
            <div className="checkout-total">
              <span>{t.total}</span>
              <strong>{cartTotal(lines)} ₽</strong>
            </div>
            <p>{t.demo}</p>
            <button className="button" onClick={() => setStep("done")}>
              {t.finish}
              <ArrowUpRight size={18} />
            </button>
          </div>
        )}
      </motion.div>
    </dialog>
  );
}
