import { useContext } from "react";
import { UIContext } from "./Context";
import PageHeaderBar from "./PageHeaderBar";
import { parseUICode } from "../rendererHelpers/translation";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  const { pageName, courseID, courseTitle, IPCOperationLoading } =
    useContext(UIContext);
  return (
    <div>
      <PageHeaderBar
        pageName={parseUICode(pageName)}
        courseID={courseID}
        courseTitle={courseTitle}
        loading={IPCOperationLoading}
      />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};
