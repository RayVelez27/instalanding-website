/**
 * PostHog product analytics (project 369222, US cloud), alongside DataFast.
 *
 * - Production only: the dev server and preview builds never load it, so local
 *   testing stays out of the data.
 * - Proxied through our own domain: api_host is /ingest, which public/_redirects
 *   rewrites to PostHog (and /ingest/static/* to its asset host). Ad blockers
 *   block *.posthog.com, and much of this site's audience runs one.
 * - `defaults` opts into PostHog's current behaviour, which includes a $pageview
 *   on every client-side route change, so the SPA's dialogs (/videos/x,
 *   /systems/x) count as pages without extra code.
 * - Anonymous visitors get no person profiles (identified_only); session replay
 *   masks every input by default.
 * - The project token is public by design: it ships to every browser.
 *
 * The site's own events go through track() in src/lib/track.ts, which sends each
 * one here as well as to DataFast.
 */
type PostHog = {
  init: (token: string, config: Record<string, unknown>) => void;
  capture: (event: string, props?: Record<string, unknown>) => void;
  __loaded?: boolean;
};
declare global {
  interface Window {
    posthog?: PostHog;
  }
}

const TOKEN = "phc_vEFiebD4L2aJFU4cJdGwkD2tMZzUxTNhxR9Vpm6yrR8N";

export function initPostHog() {
  if (!import.meta.env.PROD || typeof window === "undefined" || window.posthog?.__loaded) return;
  try {
    /* PostHog's official snippet: a queueing stub that loads /static/array.js
       (here through /ingest/static/array.js) and replays the queued calls. */
    // prettier-ignore
    // eslint-disable-next-line
    (function(t:any,e:any){var o:any,n:any,p:any,r:any;e.__SV||(window.posthog && (window.posthog as any).__loaded)||((window as any).posthog=e,e._i=[],e.init=function(i:any,s:any,a:any){function g(t:any,e:any){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t:any){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="Eh Rh Ph Oh Dh qh init yd bd dd fd Sd wc md xd ad Ed Ad Rd Pd Od Fd capture getExtension gr pd gd calculateEventProperties Dd register register_once register_for_session unregister unregister_for_session zd hd jd getFeatureFlag getFeatureFlagPayload getFeatureFlagResult getAllFeatureFlags isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys onActiveMatchingSurveysChanged renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync Hd identify setPersonProperties unsetPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset Ud shutdown setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty qd Td createPersonProfile setInternalOrTestUser Bd Uh zh opt_in_capturing opt_out_capturing Hh has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing $d debug kc Ds getPageViewId captureTraceFeedback captureTraceMetric rd".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)})(document,window.posthog||[]);
    window.posthog!.init(TOKEN, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2026-05-30",
      person_profiles: "identified_only",
    });
  } catch {
    /* analytics must never break the site */
  }
}
