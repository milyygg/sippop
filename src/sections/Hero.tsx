import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { flavors } from "../data/products";
import type { Lang } from "../data/products";
import type { Copy } from "../i18n";
export function Hero({
  active,
  setActive,
  lang,
  t,
  moving,
}: {
  active: number;
  setActive: (i: number) => void;
  lang: Lang;
  t: Copy;
  moving: boolean;
}) {
  const f = flavors[active];
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 80, damping: 24 });
  const y = useSpring(my, { stiffness: 80, damping: 24 });
  return (
    <section
      className="hero"
      aria-label="SIPPOP!"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduced || !moving) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left - r.width / 2) * 0.025);
        my.set((e.clientY - r.top - r.height / 2) * 0.025);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <div className="hero-topline">
        <span>{t.heroTagline}</span>
        <span>{t.heroCopy}</span>
        <Sparkles size={18} />
      </div>
      <div className="hero-stage">
        <div className="hero-orbit" aria-hidden="true" />
        <div className="bubble bubble-one" aria-hidden="true" />
        <div className="bubble bubble-two" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.h1
            key={`${f.id}-${lang}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
          >
            <span>{f.headline[lang][0]}</span>
            <span>{f.headline[lang][1]}</span>
          </motion.h1>
        </AnimatePresence>
        <motion.div
          className="hero-product-parallax"
          style={{ x: moving ? x : 0, y: moving ? y : 0 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              className={`hero-product ${moving ? "floating" : ""}`}
              key={f.id}
              src={f.image}
              width="500"
              height="650"
              fetchPriority="high"
              alt={f.name[lang]}
              initial={{ opacity: 0, rotate: 8, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, rotate: -7, scale: 1, y: 0 }}
              exit={{ opacity: 0, rotate: -10, y: -12 }}
              transition={{
                duration: reduced ? 0 : 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </AnimatePresence>
        </motion.div>
        <div
          className="hero-sticker"
          style={{ transform: `rotate(${active % 2 ? -10 : 10}deg)` }}
        >
          <span>100%</span>
          <span>{lang === "ru" ? "твоё настроение" : "your kind of mood"}</span>
        </div>
        <div className="hero-description" aria-live="polite">
          <span className="flavor-name">{f.name[lang]}</span>
          <p>{f.description[lang]}</p>
          <a className="button" href="#menu">
            {t.discover}
            <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="hero-volume">
          <span>500 {t.ml}</span>
          <span>{f.ingredients[lang]}</span>
        </div>
      </div>
      <div className="hero-bottom">
        <a className="scroll-cue" href="#flavors">
          <ArrowDown size={18} />
          <span>{t.scroll}</span>
        </a>
        <div className="flavor-controls">
          <span>{t.choose}</span>
          <div
            className="flavor-dots"
            role="group"
            aria-label={t.choose}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const n = (active + (e.key === "ArrowRight" ? 1 : 4)) % 5;
                setActive(n);
                (e.currentTarget.children[n] as HTMLElement).focus();
              }
            }}
          >
            {flavors.slice(0, 5).map((v, i) => (
              <button
                className={active === i ? "active" : ""}
                key={v.id}
                onClick={() => setActive(i)}
                aria-label={v.name[lang]}
                aria-pressed={active === i}
                style={{ "--dot": v.color } as React.CSSProperties}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
        <div className="hero-arrows">
          <button
            aria-label={lang === "ru" ? "Предыдущий вкус" : "Previous flavor"}
            onClick={() => setActive((active + 4) % 5)}
          >
            <ChevronLeft size={22} />
          </button>
          <span>{String(active + 1).padStart(2, "0")} / 05</span>
          <button
            aria-label={lang === "ru" ? "Следующий вкус" : "Next flavor"}
            onClick={() => setActive((active + 1) % 5)}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
