import { Moon, Sun } from "lucide-react";
import { setTheme, useTheme } from "@/lib/theme";
import { track } from "@/lib/track";

/**
 * Light / dark, right of the GitHub button (desktop top bar) and of the
 * GitHub mark (phone header). Shows the mode you'd switch to.
 */
const ThemeToggle = ({ className = "theme-toggle" }: { className?: string }) => {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        setTheme(next);
        track("theme_toggle", { to: next });
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
