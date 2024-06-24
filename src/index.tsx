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
import { CodeAssignmentData, CourseData } from "./types";

const root = ReactDOM.createRoot(document.getElementById("root"));

const App = () => {
  const [activeCourse, setActiveCourse] = useState<CourseData>(null);
  const [activePath, setActivePath] = useState<string>(null);
  const [activeAssignment, setActiveAssignment] =
    useState<CodeAssignmentData>(null);

  function handleActiveCourse(value: CourseData) {
    setActiveCourse(value);
  }

  function handleActivePath(value: string) {
    setActivePath(value);
  }

  function handleActiveAssignment(value: CodeAssignmentData) {
    setActiveAssignment(value);
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Root
          activeCourse={activeCourse}
          activePath={activePath}
          handleActiveCourse={handleActiveCourse}
          handleActivePath={handleActivePath}
          activeAssignment={activeAssignment}
          handleActiveAssignment={handleActiveAssignment}
        />
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/createCourse",
      element: <Course activeCourse={activeCourse} />,
      loader: async () => {
        return "create";
      },
    },
    {
      path: "/manageCourse",
      element: (
        <Course
          activeCourse={activeCourse}
          activePath={activePath}
          handleActiveCourse={handleActiveCourse}
        />
      ),
      loader: async () => {
        return "manage";
      },
    },
    {
      path: "/inputCodeAssignment",
      element: (
        <AssignmentInput
          activeCourse={activeCourse}
          activePath={activePath}
          activeAssignment={activeAssignment}
        />
      ),
      loader: async () => {
        return activeAssignment ? "manage" : "new";
      },
    },
    {
      path: "/newModule",
      element: <ModuleAdd activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "/AssignmentBrowse",
      element: (
        <AssignmentBrowse
          activeCourse={activeCourse}
          activePath={activePath}
          handleActiveAssignment={handleActiveAssignment}
          activeAssignment={activeAssignment}
        />
      ),
      loader: async () => {
        return "browse";
      },
    },
    {
      path: "/inputCodeProjectWork",
      element: <ProjectWorkInput activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "/exportProject",
      element: <ExportProject activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "/moduleBrowse",
      element: <ModuleBrowse activeCourse={activeCourse} />,
    },
    {
      path: "/setCreator",
      element: <SetCreator activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "/setBrowse",
      element: <SetBrowse activeCourse={activeCourse} />,
      loader: async () => {
        return "new";
      },
    },
    {
      path: "/settings",
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

root.render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>
);
