import Sidebar from "@/components/Sidebar";
import ContactForm from "@/components/ContactForm";
import { useSeo } from "@/hooks/useSeo";

/** /contact — the same form as the Contact Ray dialog, as a page of its own. */
const Contact = () => {
  useSeo({
    title: "Contact",
    description:
      "Get in touch with Ray Velez, the designer and developer behind InstaLanding.ai — projects, collaborations, or a component you want built.",
    canonical: "/contact",
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <section className="contact-page">
          <div className="contact-page-inner">
            <h1 className="about-name">Contact</h1>
            <p className="about-role">Projects, collaborations, or a component you want built.</p>
            <ContactForm />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
