import BuildLayout from "../components/build-layout.jsx";


/**
 * BuildRoutes
 * -----------
 * Wrapper for pre-race setup screens (car selection, race config, etc.).
 * Swap the bare <Outlet /> for <BuildLayout /> once that shell is built —
 * BuildLayout might include a back button, step progress bar, or sidebar.
 *
 * Add new build screens in: routes/index.jsx → buildRoutes[]
 */

const MenuRoutes = () => {
  return (
    <BuildLayout/>
  );
};

export default MenuRoutes;