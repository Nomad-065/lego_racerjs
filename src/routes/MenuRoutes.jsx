import Layout from "../components/layout.jsx";

/**
 * MenuRoutes
 * ----------
 * Wraps all standard menu screens inside the shared <Layout />.
 * Layout is expected to render <Outlet /> internally.
 *
 * Auth: wrap <Layout /> with <ProtectedRoutes> when ready.
 *
 * Add new menu screens in: routes/index.jsx → menuRoutes[]
 */
const MenuRoutes = () => {
  return (
    <Layout/>
  );
};

export default MenuRoutes;