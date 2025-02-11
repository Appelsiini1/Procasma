import { useNavigate } from "react-router";
import { Stack } from "@mui/joy";
import { useContext, useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import {
  ModuleData,
  ModuleDatabase,
  TagDatabase,
  WithCheckWrapper,
} from "../types";
import {
  filterState,
  generateChecklist,
  generateFilterList,
  handleUpdateUniqueTags,
  setSelectedViaChecked,
  wrapWithCheck,
} from "../rendererHelpers/browseHelpers";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { parseUICode } from "../rendererHelpers/translation";
import { ActiveObjectContext, UIContext } from "../components/Context";
import HelpText from "../components/HelpText";
import Browser from "../components/Browser";
import SpecialButton from "../components/SpecialButton";

export interface ModuleWithCheck extends WithCheckWrapper {
  value: ModuleDatabase;
}

export default function ModuleBrowse() {
  const {
    activePath,
    activeModule,
    handleActiveModule,
  }: {
    activePath: string;
    activeModule: ModuleData;
    handleActiveModule: (value: ModuleData) => void;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const [courseModules, setCourseModules] = useState<Array<ModuleWithCheck>>(
    []
  );
  const [selectedModules, setSelectedModules] = useState<Array<ModuleData>>([]);
  const [navigateToModule, setNavigateToModule] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>(undefined);
  const resultDependencies = [uniqueTags];
  const [requestRefreshBrowser, setRequestRefreshBrowser] = useState(true);

  const navigate = useNavigate();
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  async function getFilteredModules() {
    const filters = {
      tags: uniqueTags.filter((t) => t.isChecked).map((f) => f.value),
    };

    const moduleResults: ModuleDatabase[] = await handleIPCResult(() =>
      window.api.getFilteredModulesDB(activePath, filters)
    );

    // wrap the fetched modules to store checked state
    const modulesWithCheck = wrapWithCheck(moduleResults) as ModuleWithCheck[];

    setCourseModules(modulesWithCheck);
  }

  async function getFilters() {
    const tagsResult: TagDatabase[] = await handleIPCResult(() =>
      window.api.getModuleTagsDB(activePath)
    );

    handleUpdateUniqueTags(tagsResult, setUniqueTags);
  }

  // Get the course assignments on page load
  useEffect(() => {
    handleHeaderPageName("ui_module_browser");
  }, []);

  async function handleDeleteSelected() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_delete_success";
    try {
      await handleIPCResult(() =>
        window.api.deleteModulesDB(
          activePath,
          selectedModules.map((module) => module.id)
        )
      );

      setRequestRefreshBrowser(true); // and filters
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  // Update the selected modules counter
  useEffect(() => {
    const numChecked = setSelectedViaChecked(courseModules, setSelectedModules);

    setNumSelected(numChecked);
  }, [courseModules]);

  modules = generateChecklist(
    courseModules,
    setCourseModules,
    handleOpenModule,
    false
  );
  tags = generateFilterList(uniqueTags, setUniqueTags);

  async function handleOpenModule() {
    setNavigateToModule(true);
    handleActiveModule(selectedModules[0]);
  }

  //Navigates to a module page by listening to the active module.
  useEffect(() => {
    if (activeModule && navigateToModule) {
      setNavigateToModule(false);
      navigate("/newModule");
    }
  }, [activeModule, navigateToModule]);

  async function autoGenerateModules() {
    let snackbarSeverity = "success";
    let snackbarText = "";
    handleSnackbar({ ["action"]: parseUICode("ui_creating_modules") });
    try {
      const result = await handleIPCResult(() =>
        window.api.autoGenerateModulesFS(activePath)
      );

      snackbarText = result;
      setRequestRefreshBrowser(true); // and filters
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  return (
    <>
      <Stack gap={2}>
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <ButtonComp
            buttonType="normal"
            onClick={() => {
              handleOpenModule();
            }}
            ariaLabel={parseUICode("ui_aria_show_edit")}
            disabled={numSelected === 1 ? false : true}
          >
            {parseUICode("ui_show_edit")}
          </ButtonComp>
          <ButtonComp
            confirmationModal={true}
            modalText={`${parseUICode("ui_delete")} 
            ${numSelected}`}
            buttonType="delete"
            onClick={() => handleDeleteSelected()}
            ariaLabel={parseUICode("ui_remove_selected_modules")}
            disabled={numSelected > 0 ? false : true}
          >
            {`${parseUICode("ui_delete")} ${numSelected}`}
          </ButtonComp>
          <HelpText text={parseUICode("help_generate_modules")}>
            <ButtonComp
              buttonType="algorithm"
              onClick={() => {
                autoGenerateModules();
              }}
              ariaLabel={parseUICode("ui_generate_modules")}
            >
              {parseUICode("ui_generate_modules")}
            </ButtonComp>
          </HelpText>
        </Stack>
        {activePath ? (
          <Browser
            results={modules}
            filters={[{ name: parseUICode("ui_tags"), element: tags }]}
            getResultsFunc={() => getFilteredModules()}
            getFiltersFunc={() => getFilters()}
            resultDependencies={resultDependencies}
            requestRefreshBrowser={requestRefreshBrowser}
            setRequestRefreshBrowser={setRequestRefreshBrowser}
          ></Browser>
        ) : (
          ""
        )}
        <SpecialButton buttonType="cancel" />
      </Stack>
    </>
  );
}
