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
import FinalWorkInput from "./routes/FinalWorkInput";

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
    path: "inputCodeFinalWork",
    element: <FinalWorkInput />,
    loader: async () => {
      return "new";
    },
  },
]);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
