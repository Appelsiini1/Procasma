import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./routes/ErrorPage";
import Root from "./routes/Root";
import Course from "./routes/Course";
import AssignmentInput from "./routes/AssignmentInput";
import ModuleAdd from "./routes/ModuleAdd";
import AssignmentBrowse from "./routes/AssignmentBrowse";
import ProjectWorkInput from "./routes/ProjectWorkInput";
import ModuleBrowse from "./routes/ModuleBrowse";
import SetCreator from "./routes/SetCreator";
import SetBrowse from "./routes/SetBrowse";
import Settings from "./routes/Settings";
import ExportProject from "./routes/ExportProject";
import { CourseData } from "./types";

const root = ReactDOM.createRoot(document.getElementById("root"));

const App = () => {
  const [activeCourse, setActiveCourse] = useState<CourseData>(null);
  const [activePath, setActivePath] = useState<string>(null);

  function handleActiveCourse(value: CourseData) {
    setActiveCourse(value);
  }

  function handleActivePath(value: string) {
    setActivePath(value);
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Root
          activeCourse={activeCourse}
          handleActiveCourse={handleActiveCourse}
          handleActivePath={handleActivePath}
        />
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "createCourse",
      element: <Course activeCourse={activeCourse} />,
      loader: async () => {
        return "create";
      },
    },
    {
      path: "manageCourse",
      element: <Course activeCourse={activeCourse} />,
      loader: async () => {
        return "manage";
      },
    },
    {
      path: "inputCodeAssignment",
      element: <AssignmentInput activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "newModule",
      element: <ModuleAdd activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "AssignmentBrowse",
      element: <AssignmentBrowse activeCourse={activeCourse} />,
      loader: async () => {
        return "browse";
      },
    },
    {
      path: "inputCodeProjectWork",
      element: <ProjectWorkInput activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "exportProject",
      element: <ExportProject activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "moduleBrowse",
      element: <ModuleBrowse activeCourse={activeCourse} />,
    },
    {
      path: "setCreator",
      element: <SetCreator activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "setBrowse",
      element: <SetBrowse activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "settings",
      element: <Settings activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

const vers = await window.api.getAppVersion();
const title = "Procasma " + vers;
window.api.setTitle(title);

root.render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>
);
