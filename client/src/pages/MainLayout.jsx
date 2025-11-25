import NavigationBar from "../components/NavigationBar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex min-w-screen min-h-screen ">
        <NavigationBar className=""/>
        <div className="flex flex-col w-full">
            <Header />
            <Outlet />
        </div>
    </div>
  );
}

export default MainLayout;
