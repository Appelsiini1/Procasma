import PageHeaderBar from "./PageHeaderBar";
import { Outlet } from "react-router";

export const Layout = () => {
  return (
    <div>
      <PageHeaderBar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};
