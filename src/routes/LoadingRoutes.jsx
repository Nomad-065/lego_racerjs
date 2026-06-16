import {Outlet} from "react-router-dom";

/**
 * LoadingRoutes
 * -------------
 * Bare full-screen wrapper — no Layout, no nav, no chrome.
 * Use for: splash screens, intro animations, loading gates.
 *
 * Add new loading screens in: routes/index.jsx → loadingRoutes[]
 */
const LoadingRoutes = () => {
  return <Outlet/>;
};

export default LoadingRoutes;