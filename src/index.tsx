import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createHashRouter, RouterProvider } from "react-router";
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
import { SettingsType, SupportedLanguages } from "./types";
import { globalSettings, language } from "./globalsUI";
import log from "electron-log/renderer";
import { handleIPCResult } from "./rendererHelpers/errorHelpers";
import {
  ActiveObjectContext,
  ActiveObjectProvider,
  UIContext,
  UIProvider,
} from "./components/Context";
import SnackbarComp from "./components/SnackBarComp";
import { Layout } from "./components/Layout";
import LicensesPage from "./routes/LicensesPage";
import { DEVMODE } from "./constantsUI";
import CodeGradeSettings from "./routes/CodeGradeSettings";
import CGDev from "./routes/CGDev";

log.info("-- START OF PROCASMA RENDERER --");
log.info(`DEVMODE: ${DEVMODE}`);

const root = ReactDOM.createRoot(document.getElementById("root"));

const App = () => {
  const { snackBarAttributes, showSnackbar, setShowSnackbar } =
    useContext(UIContext);
  const { activeAssignment, activeModule, activeSet } =
    useContext(ActiveObjectContext);
  const router = createHashRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "",
          element: <Root />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/createCourse",
          element: <Course />,
          loader: async () => {
            return "create";
          },
        },
        {
          path: "/manageCourse",
          element: <Course />,
          loader: async () => {
            return "manage";
          },
        },
        {
          path: "/inputCodeAssignment",
          element: <AssignmentInput />,
          loader: async () => {
            if (activeAssignment?.assignmentType === "assignment") {
              return "manage";
            } else {
              return "new";
            }
          },
        },
        {
          path: "/newModule",
          element: <ModuleAdd />,
          loader: async () => {
            return activeModule ? "manage" : "new";
          },
        },
        {
          path: "/AssignmentBrowse",
          element: <AssignmentBrowse />,
          loader: async () => {
            return "browse";
          },
        },
        {
          path: "/inputCodeProjectWork",
          element: <ProjectWorkInput />,
          loader: async () => {
            if (activeAssignment?.assignmentType === "finalWork") {
              return "manage";
            } else {
              return "new";
            }
          },
        },
        {
          path: "/exportProject",
          element: <ExportProject />,
          loader: async () => {
            return "new";
          },
        },
        {
          path: "/moduleBrowse",
          element: <ModuleBrowse />,
        },
        {
          path: "/setCreator",
          element: <SetCreator />,
          loader: async () => {
            return activeSet ? "manage" : "new";
          },
        },
        {
          path: "/setBrowse",
          element: <SetBrowse />,
          loader: async () => {
            return "new";
          },
        },
        {
          path: "/settings",
          element: <Settings />,
          loader: async () => {
            return "new";
          },
        },
        {
          path: "/licenses",
          element: <LicensesPage />,
        },
        {
          path: "/codegradeSettings",
          element: <CodeGradeSettings />,
        },
        { path: "/CGDev", element: <CGDev /> },
      ],
    },
  ]);

  const updateLanguageInit = async () => {
    try {
      const settings: SettingsType = await handleIPCResult(() =>
        window.api.getSettings()
      );
      if (!settings.language) {
        throw new Error("ui_load_settings_failed");
      }

      const abbreviation: SupportedLanguages =
        settings.language as SupportedLanguages;

      language.current = abbreviation;
      globalSettings.fromIPC(settings);
    } catch (err) {
      log.error("Error in updateLanguageInit():", err.message);
    }
    return;
  };

  // get the init settings and update the UI language
  useEffect(() => {
    updateLanguageInit();
  }, []);

  return (
    <>
      <RouterProvider router={router}></RouterProvider>
      {showSnackbar ? (
        <SnackbarComp
          text={snackBarAttributes.text}
          color={snackBarAttributes.color}
          setShowSnackbar={setShowSnackbar}
        ></SnackbarComp>
      ) : null}
    </>
  );
};

root.render(
  <React.StrictMode>
    <ActiveObjectProvider>
      <UIProvider>
        <App></App>
      </UIProvider>
    </ActiveObjectProvider>
  </React.StrictMode>
);
