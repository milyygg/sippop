import { useState } from "react";
import { ArrowUpRight, MapPin, MoveUpRight, Quote, Star } from "lucide-react";
import { motion } from "motion/react";
import { flavors, products, categories } from "../data/products";
import type { Category, Lang } from "../data/products";
import type { Copy } from "../i18n";
import { Reveal } from "../components/Reveal";
import { ProductCard } from "../components/ProductCard";
export function FlavorUniverse({
  lang,
  t,
  select,
}: {
  lang: Lang;
  t: Copy;
  select: (i: number) => void;
}) {
  return (
    <section className="flavor-section section-pad" id="flavors">
      <Reveal className="section-heading">
        <h2>{t.flavorTitle}</h2>
        <p>{t.flavorCopy}</p>
      </Reveal>
      <div className="flavor-grid">
        {flavors.slice(0, 5).map((f, i) => (
          <Reveal key={f.id} delay={i * 0.05}>
            <button
              className="flavor-card"
              style={{ background: f.color }}
              onClick={() => {
                select(i);
                document.getElementById("top")?.scrollIntoView();
              }}
            >
              <img
                src={f.image}
                alt={f.name[lang]}
                width="320"
                height="420"
                loading="lazy"
              />
              <div className="flavor-card-heading">
                <span>{f.name[lang]}</span>
              </div>
              <div className="flavor-card-detail">
                <span>{f.ingredients[lang]}</span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
export function MenuSection({ lang, t }: { lang: Lang; t: Copy }) {
  const [category, setCategory] = useState<Category>("all");
  return (
    <section id="menu" className="menu-section section-pad">
      <Reveal className="section-heading">
        <h2>{t.menuTitle}</h2>
        <p>{t.menuCopy}</p>
      </Reveal>
      <div className="category-tabs" role="group" aria-label={t.menu}>
        {categories.map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            className={category === c ? "active" : ""}
            onClick={() => setCategory(c)}
          >
            {t[c]}
            <span>{c === "all" ? 24 : 4}</span>
          </button>
        ))}
      </div>
      <motion.div
        className="product-grid"
        key={category}
        initial={{ opacity: 0.4, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {products
          .filter((p) => category === "all" || p.category === category)
          .map((p) => (
            <ProductCard key={p.id} product={p} t={t} lang={lang} />
          ))}
      </motion.div>
      <p className="catalog-note">
        {t.assetsNote} {t.demo}
      </p>
    </section>
  );
}
export function Signature({ lang, t }: { lang: Lang; t: Copy }) {
  return (
    <section className="signature-section section-pad" id="signature">
      <Reveal className="section-heading">
        <h2>{t.signature}</h2>
        <p>{t.signatureCopy}</p>
      </Reveal>
      <div className="signature-list">
        {flavors.slice(0, 3).map((f, i) => (
          <Reveal className={`signature-panel signature-${i}`} key={f.id}>
            <div className="signature-word" aria-hidden="true">
              {[t.signatureWord1, t.signatureWord2, t.signatureWord3][i]}
            </div>
            <img
              src={f.image}
              alt={f.name[lang]}
              width="500"
              height="650"
              loading="lazy"
            />
            <div className="signature-copy">
              <span>{[t.signature1, t.signature2, t.signature3][i]}</span>
              <h3>{f.name[lang]}</h3>
              <p>{f.description[lang]}</p>
              <a
                className="circle-link"
                href="#menu"
                aria-label={`${t.openMenu}: ${f.name[lang]}`}
              >
                <ArrowUpRight size={28} />
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
export function Story({ t }: { t: Copy }) {
  return (
    <section className="story section-pad" id="about">
      <Reveal className="story-art">
        <span className="story-logo">
          SIP
          <br />
          POP!
        </span>
        <span className="story-caption">{t.brandSlogan}</span>
        <span className="story-spark" aria-hidden="true">
          ✳
        </span>
      </Reveal>
      <Reveal className="story-copy">
        <h2>{t.aboutTitle}</h2>
        <p>{t.aboutCopy}</p>
        <p>{t.aboutSecond}</p>
        <span>{t.aboutNote}</span>
      </Reveal>
    </section>
  );
}
export function Promo({ t, lang }: { t: Copy; lang: Lang }) {
  return (
    <section className="promo">
      <Reveal className="promo-copy">
        <h2>{t.promo}</h2>
        <p>{t.promoCopy}</p>
        <a href="#menu" className="button">
          {t.openMenu}
          <ArrowUpRight size={20} />
        </a>
      </Reveal>
      <div className="promo-art">
        <span aria-hidden="true" className="promo-circle" />
        <img
          src={flavors[1].image}
          alt={flavors[1].name[lang]}
          width="500"
          height="650"
          loading="lazy"
        />
        <img
          src={flavors[0].image}
          alt={flavors[0].name[lang]}
          width="500"
          height="650"
          loading="lazy"
        />
      </div>
    </section>
  );
}
export function Reviews({ t }: { t: Copy }) {
  return (
    <section className="reviews section-pad">
      <Reveal className="section-heading">
        <h2>{t.reviews}</h2>
        <p>{t.reviewsNote}</p>
      </Reveal>
      <div className="review-grid">
        {[0, 1, 2].map((i) => (
          <Reveal key={i} className="review">
            <Quote size={32} />
            <div className="review-stars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} size={16} fill="currentColor" />
              ))}
            </div>
            <blockquote>{[t.quote1, t.quote2, t.quote3][i]}</blockquote>
            <span>
              {[t.person1, t.person2, t.person3][i]} · {t.reviewMood}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
export function Locations({ t }: { t: Copy }) {
  return (
    <section className="locations section-pad" id="locations">
      <Reveal className="location-copy">
        <h2>{t.locationTitle}</h2>
        <h3>{t.soon}</h3>
        <p>{t.locationCopy}</p>
        <a href="#menu" className="text-button">
          {t.discover}
          <MoveUpRight size={18} />
        </a>
      </Reveal>
      <Reveal className="map-art">
        <div className="map-street street-one" />
        <div className="map-street street-two" />
        <div className="map-street street-three" />
        <span className="map-park" />
        <div className="map-pin">
          <MapPin size={28} />
          <strong>SIPPOP!</strong>
        </div>
        <span className="map-label">{t.mapNote}</span>
      </Reveal>
    </section>
  );
}
