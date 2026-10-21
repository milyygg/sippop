import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { flavors, priceFor } from "../data/products";
import type { Lang, Product } from "../data/products";
import type { Copy } from "../i18n";
import { useCart } from "../store/cart";
export function ProductCard({
  product: p,
  lang,
  t,
}: {
  product: Product;
  lang: Lang;
  t: Copy;
}) {
  const [size, setSize] = useState(p.sizes[0] ?? 0);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const f = flavors[p.flavor];
  return (
    <article
      className="product-card"
      style={{ "--card-color": f.soft } as React.CSSProperties}
    >
      <div className="product-image">
        <img
          src={p.image}
          width="400"
          height="500"
          loading="lazy"
          alt={`${p.name[lang]} (${t.illustrative})`}
        />
        {p.badge && <span className="product-badge">{t[p.badge]}</span>}
        <span className="product-category">{t[p.category]}</span>
      </div>
      <div className="product-info">
        <h3>{p.name[lang]}</h3>
        <p>{p.description[lang]}</p>
        <div className="size-row">
          {p.sizes.length ? (
            <div
              className="size-options"
              aria-label={`${t.volume}: ${p.name[lang]}`}
            >
              {p.sizes.map((v) => (
                <button
                  key={v}
                  aria-pressed={size === v}
                  onClick={() => setSize(v)}
                >
                  {v} {t.ml}
                </button>
              ))}
            </div>
          ) : (
            <span>{t.dessertNote}</span>
          )}
        </div>
        <div className="product-bottom">
          <strong>{priceFor(p, size)} ₽</strong>
          <button
            className="add-button"
            aria-label={`${added ? t.added : t.add}: ${p.name[lang]}`}
            onClick={() => {
              add(p.id, size);
              setAdded(true);
              setTimeout(() => setAdded(false), 1300);
            }}
          >
            {added ? <Check size={18} /> : <Plus size={18} />}
            <span>{added ? t.added : t.add}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
