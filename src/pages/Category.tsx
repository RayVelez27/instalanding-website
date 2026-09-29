import { useParams, Navigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import PromptGrid from "@/components/PromptGrid";
import AiBuilderTrigger from "@/components/AiBuilderTrigger";
import { categories } from "@/data/prompts";

/** `slug` is passed directly by the section routes; /category/:slug reads it
 *  off the URL instead. */
const Category = ({ slug: fixed }: { slug?: string }) => {
  const { slug: param } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.slug === (fixed ?? param));

  if (!category) return <Navigate to="/" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <div className="library-intro">
          <p className="library-intro-kicker">{category.label} COMPONENTS</p>
          <p className="library-intro-sub">
            Copy a prompt, paste it into your <AiBuilderTrigger />, ship the component.
          </p>
        </div>
        <PromptGrid category={category.slug} />
      </main>
    </div>
  );
};

export default Category;
