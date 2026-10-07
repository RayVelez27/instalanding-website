import Sidebar from "@/components/Sidebar";
import PromptGrid from "@/components/PromptGrid";
import StarOnGithub from "@/components/StarOnGithub";

const Index = () => (
  <div className="app-layout">
    <Sidebar />
    <main>
      <div className="library-intro">
        <div className="library-intro-text">
          <p className="library-intro-kicker">ONE-SHOT HTML LIBRARY</p>
          <p className="library-intro-sub">
            Premium pages built for humans and agents. One file. No dependencies. Copy it, remix it, ship it.
          </p>
        </div>
        <StarOnGithub />
      </div>
      <PromptGrid invite />
    </main>
  </div>
);

export default Index;
