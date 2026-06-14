import {Outlet} from "react-router-dom";

const Layout = () => {


  return (
    <div
      className="h-screen w-full flex flex-col"
      style={{
        backgroundImage: "url('/assets/images/lego_racers_bg.webp')",
      }}
    >
      <main className="flex-1 flex flex-col w-full min-h-0 overflow-hidden">
        <Outlet/>
      </main>
    </div>
  );
};

export default Layout;
