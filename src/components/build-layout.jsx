import {Outlet} from "react-router-dom";

const BuildLayout = () => {


  return (
    <div
      className="h-screen w-full flex flex-col bg-black">
      <main className="flex-1 flex flex-col w-full min-h-0 overflow-hidden">
        <Outlet/>
      </main>
    </div>
  );
};

export default BuildLayout;
