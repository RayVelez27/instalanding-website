import Sidebar from "@/components/Sidebar";
import PromptGrid from "@/components/PromptGrid";
import AiBuilderTrigger from "@/components/AiBuilderTrigger";
import StarOnGithub from "@/components/StarOnGithub";

const Index = () => (
  <div className="app-layout">
    <Sidebar />
    <main>
      <div className="library-intro">
        <div className="library-intro-text">
          <p className="library-intro-kicker">ONE-SHOT PROMPT LIBRARY</p>
          <p className="library-intro-sub">
            Copy a prompt, paste it into your <AiBuilderTrigger />, ship the component.
          </p>
        </div>
        <StarOnGithub />
      </div>
      <PromptGrid />
    </main>
  </div>
);

export default Index;
