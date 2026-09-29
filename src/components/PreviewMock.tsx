import type { PreviewKind } from "@/data/prompts";

/* ── Pure-CSS miniature wireframe previews ── */

const Bar = ({ w, h = 6, className = "" }: { w: string; h?: number; className?: string }) => (
  <div className={`pm-bar ${className}`} style={{ width: w, height: h }} />
);

export const PreviewMock = ({ kind }: { kind: PreviewKind }) => {
  switch (kind) {
    case "clay-hero":
      return (
        <div className="pm pm-clay">
          <div className="pm-navrow pm-navrow--full">
            <div className="pm-dot" />
            <div className="pm-row"><Bar w="18px" h={3} /><Bar w="18px" h={3} /><Bar w="18px" h={3} /></div>
            <div className="pm-pill" />
          </div>
          <div className="pm-clay-stage">
            <div className="pm-clay-wordmark" />
            <div className="pm-clay-copy">
              <Bar w="70%" h={8} className="pm-strong" />
              <Bar w="52%" h={8} className="pm-strong" />
              <div className="pm-row"><div className="pm-btn pm-clay-btn" /><div className="pm-btn pm-btn-ghost pm-clay-btn" /></div>
            </div>
            <div className="pm-clay-bottle" />
            <div className="pm-clay-widget">
              <div className="pm-clay-tile" />
              <div className="pm-clay-widget-lines"><Bar w="80%" h={4} className="pm-strong" /><Bar w="55%" h={3} /></div>
            </div>
          </div>
          <div className="pm-clay-pills">
            <div className="pm-clay-pill" />
            <div className="pm-clay-pill pm-clay-pill--orange" />
            <div className="pm-clay-pill pm-clay-pill--dark" />
            <div className="pm-clay-pill" />
          </div>
        </div>
      );
    case "hero":
      return (
        <div className="pm pm-hero">
          <div className="pm-navrow"><div className="pm-dot" /><Bar w="30%" h={4} /><div className="pm-pill" /></div>
          <Bar w="70%" h={12} className="pm-strong" />
          <Bar w="55%" h={12} className="pm-strong" />
          <Bar w="45%" />
          <div className="pm-row"><div className="pm-btn" /><div className="pm-btn pm-btn-ghost" /></div>
        </div>
      );
    case "marquee":
      return (
        <div className="pm pm-marquee">
          <div className="pm-marquee-track">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="pm-marquee-item"><div className="pm-dot" /><Bar w="34px" h={5} /></div>
            ))}
          </div>
          <div className="pm-marquee-track" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="pm-marquee-item"><div className="pm-dot" /><Bar w="34px" h={5} /></div>
            ))}
          </div>
        </div>
      );
    case "pricing":
      return (
        <div className="pm pm-pricing">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`pm-price-card ${i === 1 ? "pm-price-card--hot" : ""}`}>
              <Bar w="60%" h={5} />
              <Bar w="40%" h={9} className="pm-strong" />
              <Bar w="80%" h={3} /><Bar w="80%" h={3} /><Bar w="70%" h={3} />
              <div className="pm-btn pm-btn-sm" />
            </div>
          ))}
        </div>
      );
    case "navbar":
      return (
        <div className="pm pm-navbar">
          <div className="pm-navrow pm-navrow--full">
            <div className="pm-dot" />
            <div className="pm-row"><Bar w="24px" h={4} /><Bar w="24px" h={4} /><Bar w="24px" h={4} /><Bar w="24px" h={4} /></div>
            <div className="pm-pill" />
          </div>
          <Bar w="50%" h={8} className="pm-strong pm-center" />
          <Bar w="34%" className="pm-center" />
        </div>
      );
    case "buttons":
      return (
        <div className="pm pm-buttons">
          <div className="pm-btn pm-btn-lg" />
          <div className="pm-btn pm-btn-lg pm-btn-ghost" />
          <div className="pm-row"><div className="pm-btn" /><div className="pm-btn pm-btn-ghost" /></div>
        </div>
      );
    case "form":
      return (
        <div className="pm pm-form">
          <Bar w="45%" h={9} className="pm-strong pm-center" />
          <Bar w="60%" className="pm-center" />
          <div className="pm-input" />
          <div className="pm-btn pm-btn-lg" />
          <Bar w="35%" h={4} className="pm-center" />
        </div>
      );
    case "cards":
      return (
        <div className="pm pm-cards">
          <div className="pm-card pm-card--big"><div className="pm-dot" /><Bar w="60%" h={6} className="pm-strong" /><Bar w="80%" h={4} /></div>
          <div className="pm-card"><div className="pm-dot" /><Bar w="70%" h={6} className="pm-strong" /><Bar w="85%" h={4} /></div>
          <div className="pm-card pm-card--inv"><div className="pm-dot" /><Bar w="70%" h={6} className="pm-strong" /><Bar w="85%" h={4} /></div>
          <div className="pm-card"><div className="pm-dot" /><Bar w="70%" h={6} className="pm-strong" /><Bar w="85%" h={4} /></div>
        </div>
      );
    case "parallax":
      return (
        <div className="pm pm-parallax">
          <div className="pm-layer pm-layer--back" />
          <div className="pm-layer pm-layer--mid" />
          <div className="pm-layer pm-layer--front" />
          <Bar w="45%" h={10} className="pm-strong pm-center" />
        </div>
      );
    case "footer":
      return (
        <div className="pm pm-footer">
          <div className="pm-footer-cols">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="pm-footer-col"><Bar w="70%" h={5} className="pm-strong" /><Bar w="85%" h={3} /><Bar w="85%" h={3} /><Bar w="65%" h={3} /></div>
            ))}
          </div>
          <div className="pm-wordmark">IL</div>
        </div>
      );
    case "testimonial":
      return (
        <div className="pm pm-testimonial">
          <div className="pm-quote">&ldquo;</div>
          <Bar w="80%" /><Bar w="70%" /><Bar w="55%" />
          <div className="pm-row pm-row--center"><div className="pm-avatar" /><div><Bar w="60px" h={5} className="pm-strong" /><Bar w="44px" h={4} /></div></div>
        </div>
      );
    case "dashboard":
      return (
        <div className="pm pm-dashboard">
          <div className="pm-dash-tiles">
            {[0, 1, 2, 3].map((i) => <div key={i} className="pm-dash-tile"><Bar w="60%" h={4} /><Bar w="45%" h={7} className="pm-strong" /></div>)}
          </div>
          <div className="pm-chart">
            {[35, 55, 40, 70, 50, 85, 60, 95, 65, 78, 52, 88].map((h, i) => (
              <div key={i} className={`pm-chart-bar ${i === 7 ? "pm-chart-bar--active" : ""}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      );
    case "sidebar-nav":
      return (
        <div className="pm pm-sidenav">
          <div className="pm-sidenav-rail">
            <div className="pm-dot" />
            {[0, 1, 2, 3, 4].map((i) => <Bar key={i} w="65%" h={4} className={i === 0 ? "pm-strong" : ""} />)}
          </div>
          <div className="pm-sidenav-body"><Bar w="55%" h={9} className="pm-strong" /><Bar w="75%" /><Bar w="60%" /></div>
        </div>
      );
    case "modal":
      return (
        <div className="pm pm-modal">
          <div className="pm-modal-box">
            <div className="pm-input pm-input--sm" />
            <div className="pm-modal-row"><div className="pm-dot" /><Bar w="55%" h={4} /></div>
            <div className="pm-modal-row"><div className="pm-dot" /><Bar w="45%" h={4} /></div>
            <div className="pm-modal-row"><div className="pm-dot" /><Bar w="62%" h={4} /></div>
          </div>
        </div>
      );
    case "gallery":
      return (
        <div className="pm pm-gallery">
          <div className="pm-g-col"><div className="pm-g-item" style={{ height: 42 }} /><div className="pm-g-item" style={{ height: 30 }} /></div>
          <div className="pm-g-col"><div className="pm-g-item" style={{ height: 28 }} /><div className="pm-g-item" style={{ height: 46 }} /></div>
          <div className="pm-g-col"><div className="pm-g-item" style={{ height: 38 }} /><div className="pm-g-item" style={{ height: 34 }} /></div>
        </div>
      );
  }
};

export default PreviewMock;
