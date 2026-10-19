/**
 * The dark banner at the top of PAGES, SYSTEMS and MOTION: the section's name
 * on the left (its last word outlined, like HOME's headline) and what it is
 * on the right, over the same aurora as HOME in the section's own colours.
 * Agent Mode hides the aurora, so the banner turns plain black like HOME's.
 */
interface Props {
  tone: "pages" | "systems" | "motion";
  kicker: string;
  title: string;
  description: string;
}

const RouteBanner = ({ tone, kicker, title, description }: Props) => {
  const words = title.split(" ");
  const last = words.pop();
  return (
    <section className={`route-banner route-banner--${tone}`} aria-labelledby={`route-banner-${tone}`}>
      <div className="home-aurora" aria-hidden="true">
        <i />
      </div>
      <div className="route-banner-l">
        <p className="home-kicker">{kicker}</p>
        <h1 id={`route-banner-${tone}`} className="route-banner-title">
          {words.length > 0 && (
            <>
              <span>{words.join(" ")}</span>{" "}
            </>
          )}
          <span className="home-title-outline">{last}</span>
        </h1>
      </div>
      <p className="route-banner-desc">{description}</p>
    </section>
  );
};

export default RouteBanner;
