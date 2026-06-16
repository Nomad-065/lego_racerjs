import {Outlet} from "react-router-dom";


/**
 * GameRoutes
 * ----------
 * Mounts the Three.js Canvas + Physics world + HUD once, keeping them alive
 * across all in-game sub-routes (race, pause, results, etc.).
 * <Outlet /> renders any in-game overlay screens on top of the canvas.
 *
 * Uncomment the Canvas block when the game is ready to wire back in.
 *
 * Add new in-game screens in: routes/index.jsx → gameRoutes[]
 */

const GameRoutes = () => {
  return <Outlet/>;
};

export default GameRoutes;