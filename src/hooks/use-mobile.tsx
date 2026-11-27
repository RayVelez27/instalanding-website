import * as React from "react";

/** The mobile layout covers phones and tablets (same query as useIsPhone and the CSS) */
const MOBILE_QUERY = "(max-width: 1100px), (pointer: coarse) and (max-width: 1400px)";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
