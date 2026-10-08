import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ContactModal from "@/components/ContactModal";
import { useSeo } from "@/hooks/useSeo";

/**
 * About — one full viewport, portrait beside the bio.
 *
 * The portrait is `public/about/ray.jpg`, converted to greyscale in the file
 * itself (not with a CSS filter) so it is black and white everywhere it is
 * served. The frame is a 4:5 box and the photo is square, so `object-fit:
 * cover` trims a little off each side.
 */
const About = () => {
  const [contactOpen, setContactOpen] = useState(false);
  useSeo({
    title: "About Ray Velez",
    description:
      "Ray Velez — designer, developer, artist engineer — and why InstaLanding.ai builds premium, dependency-free HTML pages for both humans and coding agents.",
    canonical: "/about",
    image: "/about/ray.jpg",
    imageSize: [500, 500],
  });
  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <section className="about">
          <div className="about-inner">
            <div className="about-side">
              <div className="about-portrait">
                <img src="/about/ray.jpg" alt="Ray Velez" width={500} height={500} decoding="async" />
              </div>
              <button type="button" className="contact-submit about-contact" onClick={() => setContactOpen(true)}>
                CONTACT RAY <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="about-copy">
              <h1 className="about-name">Ray Velez</h1>
              <p className="about-role">Designer, developer, artist engineer.</p>

              <p className="about-bio">
                I&rsquo;ve spent years designing and building for the web. Somewhere along the way,
                the line between design and code disappeared.
              </p>
              <p className="about-bio">
                Now I&rsquo;m interested in interfaces that are built, not mocked &mdash; where
                typography, motion, interaction, and logic all live in the same medium.
              </p>
              <p className="about-bio">
                I built InstaLanding as an exploration of that idea: premium, dependency-free
                interfaces that exist as complete HTML files. No design handoff. No framework
                required. Just something you can open, understand, remix, and ship.
              </p>
              <p className="about-bio">
                Everything in this library is designed for two audiences: humans and agents.
              </p>
              <p className="about-bio">
                Because as coding agents get better at building software, I think the interesting
                question becomes less &ldquo;Can AI write the code?&rdquo; and more &ldquo;What
                should we give it to build from?&rdquo;
              </p>
              <p className="about-bio about-bio--close">This library is my answer.</p>
            </div>
          </div>
        </section>
      </main>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
};

export default About;
