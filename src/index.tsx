import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./routes/ErrorPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
const router = createBrowserRouter([
  { path: "/", element: <App />, errorElement: <ErrorPage /> },
]);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
