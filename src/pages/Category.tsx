import { useParams, Navigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import PromptGrid from "@/components/PromptGrid";
import AiBuilderTrigger from "@/components/AiBuilderTrigger";
import { categories, categoryHref } from "@/data/prompts";
import { useSeo } from "@/hooks/useSeo";

/** `slug` is passed directly by the section routes; /category/:slug reads it
 *  off the URL instead. */
const Category = ({ slug: fixed }: { slug?: string }) => {
  const { slug: param } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.slug === (fixed ?? param));
  const name = category ? category.label.charAt(0) + category.label.slice(1).toLowerCase() : "";
  useSeo({
    title: `${name} Landing Pages and Components`,
    description: `${name} landing pages and UI components from the InstaLanding.ai library: single HTML files with no dependencies, each with the one-shot prompt that builds it.`,
    canonical: category ? categoryHref(category.slug) : undefined,
  });

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
