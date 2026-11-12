import type { Copy } from "../i18n";

export function FlavorRibbon({ t }: { t: Copy }) {
  return (
    <section className="flavor-ribbon" aria-label={t.ticker}>
      <div className="ribbon-copy">
        <span>{t.ribbonFirst}</span>
        <span>{t.ribbonSecond}</span>
      </div>
      <div className="ribbon-art" aria-hidden="true">
        <svg viewBox="0 0 600 180" preserveAspectRatio="none">
          <path fill="#ffb4d2" d="M0 0h120v140q-30 60-60 0T0 140z" />
          <path fill="#ffd166" d="M120 0h120v105q-30 60-60 0t-60 0z" />
          <path fill="#bbe89a" d="M240 0h120v140q-30 60-60 0t-60 0z" />
          <path fill="#c6b4ff" d="M360 0h120v105q-30 60-60 0t-60 0z" />
          <path fill="#a5e9f2" d="M480 0h120v140q-30 60-60 0t-60 0z" />
        </svg>
        <span className="ribbon-wordmark">SIPPOP!</span>
      </div>
    </section>
  );
}
