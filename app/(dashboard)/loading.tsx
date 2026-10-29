import { SpinnerBallIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * Loading UI for authenticated dashboard routes only.
 *
 * This used to live at `app/loading.tsx`, which made it the shell for *every*
 * route — including the fully static marketing pages. Because a route-level
 * `loading.tsx` becomes the boundary fallback, the prerendered HTML for `/`
 * shipped the spinner as the visible content with the real page hidden in a
 * stream template, so the live site painted a full-screen spinner before the
 * page appeared.
 *
 * Scoping it to the (dashboard) group keeps a useful skeleton while nav-waiting
 * in the app, and lets the landing pages render their real content inline.
 */
const loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SpinnerBallIcon size={32} className="animate-spin text-primary" />
    </div>
  );
};

export default loading;
