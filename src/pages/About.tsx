import Sidebar from "@/components/Sidebar";

/**
 * About — one full viewport, portrait beside the bio.
 *
 * The portrait is a placeholder: to use a real photo, drop it in
 * `public/about/ray.jpg` and swap `.about-portrait`'s contents for
 * `<img src="/about/ray.jpg" alt="Ray Velez" />`. The frame already
 * holds a 4:5 box, so the image only needs `object-fit: cover`.
 */
const About = () => (
  <div className="app-layout">
    <Sidebar />
    <main>
      <section className="about">
        <div className="about-inner">
          <div className="about-portrait" aria-hidden="true">
            <span className="about-initials">RV</span>
          </div>

          <div className="about-copy">
            <p className="about-kicker">CREATOR</p>
            <h1 className="about-name">Ray Velez</h1>
            <p className="about-role">Web developer and designer, turned artist engineer.</p>

            <p className="about-bio">
              Placeholder bio. I build the things in this library — the prompts, the reference
              implementations, and the page you are reading them on. Most of it starts as a
              question about how an interface should feel and ends as a single HTML file you
              can open from disk.
            </p>
            <p className="about-bio">
              Placeholder bio. Years of shipping product design and front-end work, now spent
              on the seam between the two: interfaces that are built, not mocked, and tools
              that make the building faster.
            </p>

            <dl className="about-meta">
              <div><dt>ROLE</dt><dd>Creator, INSTALANDING.AI</dd></div>
              <div><dt>WORK</dt><dd>Design · Front-end · Generative</dd></div>
              <div><dt>BASED</dt><dd>Placeholder</dd></div>
            </dl>
          </div>
        </div>
      </section>
    </main>
  </div>
);

export default About;
