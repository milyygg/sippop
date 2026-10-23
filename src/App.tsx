import { lazy, Suspense, useState } from "react";
import { MotionConfig } from "motion/react";
import { ShoppingBag, Sun, Moon, Menu, X, ArrowUp } from "lucide-react";
import { flavors } from "./data/products";
import { dictionary } from "./i18n";
import { usePreferences } from "./hooks/usePreferences";
import { useCart } from "./store/cart";
import { Hero } from "./sections/Hero";
import {
  FlavorUniverse,
  MenuSection,
  Signature,
  Story,
  Promo,
  Reviews,
  Locations,
} from "./sections/Content";
const CartDrawer = lazy(() => import("./components/CartDrawer"));
export default function App() {
  const { lang, setLang, theme, setTheme } = usePreferences();
  const t = dictionary[lang];
  const [active, setActive] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const f = flavors[active];
  const nav = (
    <>
      {[
        ["menu", t.menu],
        ["about", t.about],
        ["locations", t.locations],
      ].map(([id, label]) => (
        <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
          {label}
        </a>
      ))}
    </>
  );
  return (
    <MotionConfig reducedMotion="user">
      <div
        className="site"
        id="top"
        style={
          {
            "--flavor": f.color,
            "--accent": f.accent,
            "--soft": f.soft,
            "--deep": f.dark,
          } as React.CSSProperties
        }
      >
        <a href="#main" className="skip-link">
          {t.skip}
        </a>
        <main id="main">
          <div className="hero-shell">
            <header className="site-header">
              <a className="wordmark" href="#top" aria-label="SIPPOP!">
                SIPPOP<span>!</span>
              </a>
              <nav className="desktop-nav" aria-label={t.menu}>
                {nav}
              </nav>
              <div className="header-tools">
                <button
                  className="language-button"
                  onClick={() => setLang(lang === "ru" ? "en" : "ru")}
                  aria-label={t.language}
                >
                  {lang === "ru" ? "РУ" : "EN"}
                  <span> / {lang === "ru" ? "АНГ" : "RU"}</span>
                </button>
                <button
                  className="icon-button theme-toggle"
                  aria-label={t.theme}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
                </button>
                <button
                  className="bag-button"
                  onClick={() => setCartOpen(true)}
                  aria-label={`${t.cart}: ${count}`}
                >
                  <ShoppingBag size={19} />
                  <span>{t.cart}</span>
                  <b>{count}</b>
                </button>
                <button
                  className="icon-button mobile-toggle"
                  aria-label={menuOpen ? t.close : t.mobileMenu}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </header>
            {menuOpen && (
              <nav className="mobile-nav" aria-label={t.menu}>
                {nav}
              </nav>
            )}
            <div>
              <Hero
                active={active}
                setActive={setActive}
                lang={lang}
                t={t}
                moving={true}
              />
            </div>
          </div>
          <div className="ticker" aria-hidden="true">
            <div>
              {[0, 1, 2, 3].map((i) => (
                <span key={i}>
                  {t.ticker} <span className="ticker-flower">✳</span> SIPPOP!{" "}
                  <span className="ticker-flower">✳</span>{" "}
                </span>
              ))}
            </div>
          </div>
          <div role="region" aria-label={t.menu}>
            <FlavorUniverse lang={lang} t={t} select={setActive} />
            <MenuSection lang={lang} t={t} />
            <Signature lang={lang} t={t} />
            <Story t={t} />
            <Promo t={t} lang={lang} />
            <Reviews t={t} />
            <Locations t={t} />
          </div>
        </main>
        <footer className="site-footer">
          <div className="footer-top">
            <p>{t.footerLine}</p>
            <nav aria-label={t.menu}>{nav}</nav>
            <a href="#top" className="icon-button" aria-label={t.top}>
              <ArrowUp />
            </a>
          </div>
          <a className="footer-wordmark" href="#top">
            SIPPOP!
          </a>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} SIPPOP! · {t.copyright}
            </span>
            <span>{t.demo}</span>
            <span>{t.assetsNote}</span>
          </div>
        </footer>
        <div className="sr-only" aria-live="polite">
          {count} {t.cartCount}
        </div>
        {cartOpen && (
          <Suspense
            fallback={
              <div className="loading-bag" role="status">
                {t.cart}…
              </div>
            }
          >
            <CartDrawer lang={lang} t={t} onClose={() => setCartOpen(false)} />
          </Suspense>
        )}
      </div>
    </MotionConfig>
  );
}
