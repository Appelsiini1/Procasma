import PageHeaderBar from "../components/PageHeaderBar";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import { CourseData, ModuleData, ModuleDatabase, TagDatabase } from "../types";
import {
  WithCheckWrapper,
  filterState,
  generateFilterList,
  handleCheckArray,
  handleUpdateUniqueTags,
  setSelectedViaChecked,
} from "../rendererHelpers/browseHelpers";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import SnackbarComp, {
  functionResultToSnackBar,
  SnackBarAttributes,
} from "../components/SnackBarComp";
import { parseUICode } from "../rendererHelpers/translation";

export interface ModuleWithCheck extends WithCheckWrapper {
  value: ModuleDatabase;
}

export function generateModules(
  modules: ModuleWithCheck[],
  setCourseModules: React.Dispatch<React.SetStateAction<ModuleWithCheck[]>>
) {
  return modules
    ? modules.map((module: ModuleWithCheck) => {
        return (
          <ListItem
            key={module.value.id}
            startAction={
              <Checkbox
                checked={module.isChecked}
                onChange={() =>
                  handleCheckArray(
                    module.value,
                    !module.isChecked,
                    setCourseModules
                  )
                }
              ></Checkbox>
            }
          >
            <ListItemButton
              selected={module.isChecked}
              onClick={() =>
                handleCheckArray(
                  module.value,
                  !module.isChecked,
                  setCourseModules
                )
              }
            >
              {module.value.name}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
}

export default function ModuleBrowse({
  activeCourse,
  activePath,
  activeModule,
  handleActiveModule,
}: {
  activeCourse: CourseData;
  activePath: string;
  activeModule: ModuleData;
  handleActiveModule: (value: ModuleData) => void;
}) {
  const navigate = useNavigate();
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  const [courseModules, setCourseModules] = useState<Array<ModuleWithCheck>>(
    []
  );
  const [selectedModules, setSelectedModules] = useState<Array<ModuleData>>([]);
  const [navigateToModule, setNavigateToModule] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "success", text: "" });

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
      functionResultToSnackBar(
        { error: parseUICode(err.message) },
        setShowSnackbar,
        setSnackBarAttributes
      );
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

    functionResultToSnackBar(
      { [snackbarSeverity]: parseUICode(snackbarText) },
      setShowSnackbar,
      setSnackBarAttributes
    );
  }

  // Update the selected modules counter
  useEffect(() => {
    const numChecked = setSelectedViaChecked(courseModules, setSelectedModules);

    setNumSelected(numChecked);
  }, [courseModules]);

  useEffect(() => {
    refreshModules();
  }, [uniqueTags]);

  modules = generateModules(courseModules, setCourseModules);
  tags = generateFilterList(uniqueTags, setUniqueTags);

  async function handleOpenModule() {
    // set the first selected module as global
    if (!selectedModules || selectedModules.length < 1) {
      functionResultToSnackBar(
        { info: parseUICode("ui_no_module_seleted") },
        setShowSnackbar,
        setSnackBarAttributes
      );
      return;
    }
    setNavigateToModule(true);
    handleActiveModule(selectedModules[0]);
  }

  useEffect(() => {
    if (activeModule && navigateToModule) {
      setNavigateToModule(false);
      navigate("/newModule");
    }
  }, [activeModule, navigateToModule]);

  return (
    <>
      <PageHeaderBar
        pageName={parseUICode("ui_module_browser")}
        courseID={activeCourse?.id}
        courseTitle={activeCourse?.title}
      />
      <div className="content">
        <div className="emptySpace1" />
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <ButtonComp
            confirmationModal={true}
            modalText={`${parseUICode("ui_delete")} 
            ${numSelected}`}
            buttonType="normal"
            onClick={() => handleDeleteSelected()}
            ariaLabel={parseUICode("ui_remove_selected_modules")}
          >
            {`${parseUICode("ui_delete")} ${numSelected}`}
          </ButtonComp>
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
      </div>
      {showSnackbar ? (
        <SnackbarComp
          text={snackBarAttributes.text}
          color={snackBarAttributes.color}
          setShowSnackbar={setShowSnackbar}
        ></SnackbarComp>
      ) : null}
    </>
  );
}
