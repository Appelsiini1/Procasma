import { useNavigate } from "react-router";
import {
  Box,
  Grid,
  List,
  ListItem,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/joy";
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
} from "../rendererHelpers/browseHelpers";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { parseUICode } from "../rendererHelpers/translation";
import { ActiveObjectContext, UIContext } from "../components/Context";
import HelpText from "../components/HelpText";

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
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>([]);

  const navigate = useNavigate();
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  const refreshModules = async () => {
    try {
      if (!activePath) {
        return;
      }

      const checkedTags: string[] = [];
      uniqueTags.forEach((element) => {
        if (element.isChecked) {
          checkedTags.push(element.value);
        }
      });

      const filters = {
        tags: checkedTags,
      };

      let moduleResults: ModuleDatabase[] = [];

      moduleResults = await handleIPCResult(() =>
        window.api.getFilteredModulesDB(activePath, filters)
      );

      // wrap the fetched modules to store checked state
      const modulesWithCheck = moduleResults.map((module) => {
        const ModuleCheck: ModuleWithCheck = {
          isChecked: false,
          value: module,
        };

        return ModuleCheck;
      });

      setCourseModules(modulesWithCheck);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  };

  async function updateFilters() {
    const tagsResult: TagDatabase[] = await handleIPCResult(() =>
      window.api.getModuleTagsDB(activePath)
    );

    handleUpdateUniqueTags(tagsResult, setUniqueTags);
  }

  // Get the course assignments on page load
  useEffect(() => {
    if (!activePath) {
      return;
    }
    refreshModules();
    updateFilters();
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

      refreshModules(); // get the remaining modules
      updateFilters(); // and filters
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

  useEffect(() => {
    refreshModules();
  }, [uniqueTags]);

  modules = generateChecklist(courseModules, setCourseModules, false);
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
      refreshModules(); // get the remaining modules
      updateFilters(); // and filters
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  return (
    <>
      <div className="emptySpace1" />
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

      <div className="emptySpace2" />
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="stretch"
        sx={{ minWidth: "100%" }}
      >
        <Grid xs={8}>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}
          >
            <Typography level="h3">{parseUICode("assignments")}</Typography>

            <Box
              height="40rem"
              maxHeight="50vh"
              width="100%"
              sx={{
                border: "2px solid lightgrey",
                borderRadius: "0.2rem",
              }}
              overflow={"auto"}
            >
              <List>{modules}</List>
            </Box>
          </Stack>
        </Grid>
        <Grid xs={4}>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}
          >
            <Typography level="h3">{parseUICode("ui_filter")}</Typography>

            <Box
              height="40rem"
              maxHeight="50vh"
              width="100%"
              sx={{
                border: "2px solid lightgrey",
                borderRadius: "0.2rem",
              }}
              overflow={"auto"}
            >
              <List>
                <ListItem nested>
                  <ListSubheader>{parseUICode("ui_tags")}</ListSubheader>
                  <List>{tags}</List>
                </ListItem>
              </List>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <div className="emptySpace1" />
      <ButtonComp
        buttonType="normal"
        onClick={() => navigate(-1)}
        ariaLabel={parseUICode("ui_aria_cancel")}
      >
        {parseUICode("ui_cancel")}
      </ButtonComp>
    </>
  );
}
