import React from "react";
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

const root = ReactDOM.createRoot(document.getElementById("root"));
const router = createBrowserRouter([
  { path: "/", element: <Root />, errorElement: <ErrorPage /> },
  {
    path: "createCourse",
    element: <Course />,
    loader: async () => {
      return "create";
    },
  },
  {
    path: "manageCourse",
    element: <Course />,
    loader: async () => {
      return "manage";
    },
  },
  {
    path: "inputCodeAssignment",
    element: <AssignmentInput />,
    loader: async () => {
      return "new";
    },
  },
  {
    path: "newModule",
    element: <ModuleAdd />,
    loader: async () => {
      return "new";
    },
  },
  {
    path: "AssignmentBrowse",
    element: <AssignmentBrowse />,
    loader: async () => {
      return "browse";
    },
  },
  {
    path: "inputCodeProjectWork",
    element: <ProjectWorkInput />,
    loader: async () => {
      return "new";
    },
  },
  {
    path: "exportProject",
    element: <ExportProject />,
    loader: async () => {
      return "new";
    },
  },
  {
    path: "moduleBrowse",
    element: <ModuleBrowse />,
  },
  {
    path: "setCreator",
    element: <SetCreator />,
    loader: async () => {
      return "new";
    },
  },
  {
    path: "setBrowse",
    element: <SetBrowse />,
    loader: async () => {
      return "new";
    },
  },
  {
    path: "settings",
    element: <Settings />,
    loader: async () => {
      return "new";
    },
  },
]);

const vers = await window.api.getAppVersion();
const title = "Procasma " + vers;
window.api.setTitle(title);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
