import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language } from "../globalsUI";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  Box,
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import { CourseData, ModuleData } from "../types";
import {
  WithCheckWrapper,
  checkIfShouldFilter,
  filterState,
  filterType,
  generateFilter,
  handleCheckArray,
  handleUpdateUniqueTags,
  setSelectedViaChecked,
} from "../helpers/browseHelpers";
import { getModules } from "../helpers/requests";
import log from "electron-log/renderer";

export interface ModuleWithCheck extends WithCheckWrapper {
  value: ModuleData;
}

/**
 * Generates the list of modules, filtering based on the given
 * filters.
 * @param modules
 * @param filters
 * @returns
 */
export function generateModules(
  modules: ModuleWithCheck[],
  setCourseModules: React.Dispatch<React.SetStateAction<ModuleWithCheck[]>>,
  filters: filterType[],
  searchTerm: string
) {
  const filteredModules = modules
    ? modules.map((module: ModuleWithCheck) => {
        let showModule = true;

        // get module attributes to filter by
        // and the respective filters
        const tags: Array<string> = module.value?.tags;
        const tagFilter = filters.find((filter) => {
          return filter.name === "tags" ? true : false;
        });

        // check filtration
        showModule = checkIfShouldFilter(tags, tagFilter.filters)
          ? showModule
          : false;

        // check search term filtration
        if (searchTerm && searchTerm.length > 0) {
          const titleFormatted = module.value.name.toLowerCase();
          const searchFormatted = searchTerm.toLowerCase();

          showModule = titleFormatted.includes(searchFormatted) ? true : false;
        }

        return showModule ? (
          <ListItem
            key={module.value.ID}
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
        ) : null;
      })
    : null;
  return filteredModules;
}

export async function handleDeleteSelected(
  selectedModules: ModuleData[],
  activePath: string,
  refreshModules: () => void
) {
  try {
    const deletePromises = selectedModules.map(async (module) => {
      const result = await window.api.deleteModule(activePath, module.ID);
      return result;
    });

    const results = await Promise.all(deletePromises);

    // get the remaining modules
    refreshModules();
  } catch (error) {
    console.error("Error deleting modules:", error);
    log.error(`Error deleting modules: ${error}`);
  }
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
  //let pageButtons: React.JSX.Element = null;
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  const [courseModules, setCourseModules] = useState<Array<ModuleWithCheck>>(
    []
  );
  const [selectedModules, setSelectedModules] = useState<Array<ModuleData>>([]);
  const [navigateToModule, setNavigateToModule] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>([]);

  function getTagsFromModules(modules: ModuleData[]): Array<string> {
    const tags: Array<string> = [];
    modules.forEach((module) => {
      tags.push(...module.tags);
    });
    return tags;
  }

  const refreshModules = async () => {
    if (!activePath) {
      return;
    }

    const modules: ModuleData[] = await getModules(activePath);

    if (!modules) {
      return;
    }

    // wrap the fetched modules to store checked state
    const modulesWithCheck = modules.map((module) => {
      const ModuleCheck: ModuleWithCheck = {
        isChecked: false,
        value: module,
      };

      return ModuleCheck;
    });

    if (modulesWithCheck) {
      // update assignments and filters
      setCourseModules(modulesWithCheck);
      const tags: Array<string> = getTagsFromModules(modules);
      handleUpdateUniqueTags(tags, setUniqueTags);
    }
  };

  // Get the course assignments on page load
  useEffect(() => {
    refreshModules();
  }, []);

  // Update the selected modules counter
  useEffect(() => {
    const numChecked = setSelectedViaChecked(courseModules, setSelectedModules);

    setNumSelected(numChecked);
  }, [courseModules]);

  const tagsFilter: filterType = { name: "tags", filters: uniqueTags };

  modules = generateModules(courseModules, setCourseModules, [tagsFilter], "");
  tags = generateFilter(uniqueTags, setUniqueTags);

  async function handleOpenModule() {
    // set the first selected module as global
    if (!selectedModules || selectedModules.length < 1) {
      console.log("no module selected");
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
        pageName={texts.ui_module_browser[language.current]}
        courseID={activeCourse?.ID}
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
            modalText={`${texts.ui_delete[language.current]} 
            ${numSelected}`}
            buttonType="normal"
            onClick={() =>
              handleDeleteSelected(selectedModules, activePath, refreshModules)
            }
            ariaLabel={texts.ui_remove_selected_modules[language.current]}
          >
            {`${texts.ui_delete[language.current]} ${numSelected}`}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => {
              handleOpenModule();
            }}
            ariaLabel={texts.ui_aria_show_edit[language.current]}
          >
            {texts.ui_show_edit[language.current]}
          </ButtonComp>
          <Typography>
            {selectedModules && selectedModules.length > 0
              ? selectedModules[0]?.name
              : ""}
          </Typography>
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
              <Typography level="h3">
                {texts.assignments[language.current]}
              </Typography>

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
              <Typography level="h3">
                {texts.ui_filter[language.current]}
              </Typography>

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
                <List>{tags}</List>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <div className="emptySpace1" />
        <ButtonComp
          buttonType="normal"
          onClick={() => navigate(-1)}
          ariaLabel={texts.ui_aria_cancel[language.current]}
        >
          {texts.ui_cancel[language.current]}
        </ButtonComp>
      </div>
    </>
  );
}
