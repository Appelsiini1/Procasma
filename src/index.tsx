import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./routes/ErrorPage";
import Root from "./routes/Root";
import Course from "./routes/Course";

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
]);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
