import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ContactModal from "@/components/ContactModal";

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
  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <section className="about">
          <div className="about-inner">
            <div className="about-portrait">
              <img src="/about/ray.jpg" alt="Ray Velez" width={500} height={500} decoding="async" />
            </div>

            <div className="about-copy">
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

              <button type="button" className="contact-submit about-contact" onClick={() => setContactOpen(true)}>
                CONTACT RAY <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </main>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
};

export default About;
