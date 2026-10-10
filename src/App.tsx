import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, type Location } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Category from "./pages/Category";
import PromptModal from "@/components/PromptModal";
import PromptDetail from "./pages/PromptDetail";
import About from "./pages/About";
import Builders from "./pages/Builders";
import Agents from "./pages/Agents";
import Contact from "./pages/Contact";
import Contribute from "./pages/Contribute";
import BuilderPage from "./pages/BuilderPage";
import { builders } from "@/data/builders";
import ComingSoon from "./pages/ComingSoon";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * Route-aware modal. A tile link carries `backgroundLocation`, so the grid
 * keeps rendering underneath and the prompt opens as a dialog. Arriving at
 * /prompt/:slug directly — a shared link, a refresh, a crawler — has no such
 * state, so the full page renders instead.
 */
const AppRoutes = () => {
  const location = useLocation();
  const background = (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation;

  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<Index />} />
        {/* Product is a section of its own, so its category lives at /product
            and the generic path redirects rather than serving a duplicate. */}
        <Route path="/category/product" element={<Navigate to="/product" replace />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/systems"
          element={<ComingSoon title="Systems" blurb="Whole design systems — tokens, components and the rules that hold them together — as one-shot prompts with a reference build." />}
        />
        {/* PRODUCT-PARKED: the section is announced but its entries are
            parked, so it serves the same ComingSoon page /systems does.
            Restoring it is one command — see memory/product-parked.md. */}
        <Route
          path="/product"
          element={<ComingSoon title="Product" blurb="Dashboards, consoles and in-app flows — the screens people use after they sign up — as one-shot prompts with a reference build." />}
        />
        <Route path="/agents" element={<Agents />} />
        <Route path="/contribute" element={<Contribute />} />
        <Route path="/contact" element={<Contact />} />
        {/* Out of the menu, not deleted: the builder pages are search landing
            pages and keep their URLs and their sitemap entries. */}
        <Route path="/builders" element={<Builders />} />
        {/* One route per builder, at the search term rather than under /builders/. */}
        {builders.map((b) => (
          <Route key={b.path} path={b.path} element={<BuilderPage builder={b} />} />
        ))}
        <Route path="/prompt/:slug" element={<PromptDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/prompt/:slug" element={<PromptModal />} />
        </Routes>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
