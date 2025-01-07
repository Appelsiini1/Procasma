import { useNavigate } from "react-router";
import {
  Box,
  Grid,
  List,
  ListSubheader,
  ListItem,
  Stack,
  Typography,
} from "@mui/joy";
import { useContext, useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";
import {
  AssignmentTypes,
  AssignmentWithCheck,
  CodeAssignmentData,
  CodeAssignmentDatabase,
  ModuleDatabase,
  SetData,
  TagDatabase,
} from "../types";
import {
  filterState,
  generateChecklist,
  generateFilterList,
  handleUpdateFilter,
  handleUpdateUniqueTags,
  setSelectedViaChecked,
  wrapWithCheck,
} from "../rendererHelpers/browseHelpers";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { ActiveObjectContext, UIContext } from "../components/Context";
import HelpText from "../components/HelpText";
import { DEVMODE } from "../constantsUI";

export default function AssignmentBrowse() {
  const {
    activePath,
    activeAssignment,
    handleActiveAssignment,
    activeAssignments,
    handleActiveAssignments,
    selectAssignment,
    handleSelectAssignment,
    previousPath,
  }: {
    activePath: string;
    activeAssignment: CodeAssignmentData;
    handleActiveAssignment: (value: CodeAssignmentData) => void;
    activeAssignments: CodeAssignmentDatabase[];
    handleActiveAssignments: (value: CodeAssignmentDatabase[]) => void;
    handleActiveSet: (value: SetData) => void;
    selectAssignment: boolean;
    handleSelectAssignment: (value: boolean) => void;
    previousPath: string;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const [courseAssignments, setCourseAssignments] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentDatabase>
  >([]);
  const [allSelected, setAllSelected] = useState(false);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [navigateBack, setNavigateBack] = useState(false);

  const [numSelected, setNumSelected] = useState(0);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>([]);
  const [uniqueModules, setUniqueModules] = useState<Array<filterState>>([]);
  const [uniqueTypes, setUniqueTypes] = useState<Array<filterState>>([]);
  const [search, setSearch] = useState<string>("");

  const navigate = useNavigate();
  let assignments: Array<React.JSX.Element> = null;
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;
  let types: Array<React.JSX.Element> = null;

  const refreshAssignments = async () => {
    try {
      if (!activePath) {
        return;
      }

      const checkedTags: string[] = [];
      const checkedModules: string[] = [];
      const checkedTypes: string[] = [];

      uniqueTags.forEach((element) => {
        if (element.isChecked) {
          checkedTags.push(element.value);
        }
      });
      uniqueModules.forEach((element) => {
        if (element.isChecked) {
          checkedModules.push(element.value);
        }
      });
      uniqueTypes.forEach((element) => {
        if (element.isChecked) {
          checkedTypes.push(element.value);
        }
      });
      uniqueTypes.forEach((element) => {
        if (element.isChecked) {
          checkedTypes.push(element.value);
        }
      });

      const filters = {
        tags: checkedTags,
        module: checkedModules,
        type: checkedTypes,
        title: search,
      };

      let assignmentsResult: CodeAssignmentDatabase[] = [];

      assignmentsResult = await handleIPCResult(() =>
        window.api.getFilteredAssignmentsDB(activePath, filters)
      );

      // wrap the fetched assignments to store checked state
      const assignentsWithCheck: AssignmentWithCheck[] =
        wrapWithCheck(assignmentsResult);

      // update assignments and filters
      setCourseAssignments(assignentsWithCheck);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  };

  function handleSearch(value: string) {
    setSearch(value);
  }

  async function updateFilters() {
    const tagsResult: TagDatabase[] = await handleIPCResult(() =>
      window.api.getAssignmentTagsDB(activePath)
    );

    handleUpdateUniqueTags(tagsResult, setUniqueTags);

    const modulesResult: ModuleDatabase[] = await handleIPCResult(() =>
      window.api.getModulesDB(activePath)
    );

    handleUpdateFilter(
      modulesResult.map((m) => m.name),
      setUniqueModules
    );

    if (previousPath === "/exportProject") {
      handleUpdateFilter(["finalWork"], setUniqueTypes, true);
    } else {
      handleUpdateFilter(Object.values(AssignmentTypes), setUniqueTypes);
    }
  }

  // Get the filters
  async function onPageLoad() {
    if (!activePath) {
      return;
    }
    await updateFilters();
    await handleHeaderPageName("ui_assignment_browser");
  }

  useEffect(() => {
    onPageLoad();
  }, [previousPath]);

  async function handleDeleteSelected() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_delete_success";
    try {
      await handleIPCResult(() =>
        window.api.handleDeleteAssignmentsFS(
          activePath,
          selectedAssignments.map((assignment) => assignment.id)
        )
      );

      refreshAssignments(); // get the remaining assignments
      updateFilters(); // and filters
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  // Update the selected assignments counter
  useEffect(() => {
    const numChecked = setSelectedViaChecked(
      courseAssignments,
      setSelectedAssignments
    );

    setNumSelected(numChecked);
  }, [courseAssignments]);

  useEffect(() => {
    refreshAssignments();
  }, [uniqueTags, uniqueModules, uniqueTypes, search]);

  assignments = generateChecklist(
    courseAssignments,
    setCourseAssignments,
    true
  );
  modules = generateFilterList(uniqueModules, setUniqueModules);
  tags = generateFilterList(uniqueTags, setUniqueTags);
  types = generateFilterList(uniqueTypes, setUniqueTypes, true);

  async function handleOpenAssignment() {
    try {
      const assignmentsResult = await handleIPCResult(() =>
        window.api.handleGetAssignmentsFS(activePath, selectedAssignments[0].id)
      );

      handleActiveAssignment(assignmentsResult[0]);
      setNavigateToAssignment(true);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  // Navigates to an assignment page by listening to the active assignment.
  useEffect(() => {
    if (activeAssignment && navigateToAssignment) {
      setNavigateToAssignment(false);

      const activeAssignmentType: string = activeAssignment.assignmentType;
      if (activeAssignmentType === "assignment") {
        navigate("/inputCodeAssignment");
      } else if (activeAssignmentType === "finalWork") {
        navigate("/inputCodeProjectWork");
      }
    }
  }, [activeAssignment, navigateToAssignment]);

  useEffect(() => {
    if (activeAssignments && navigateBack) {
      setNavigateToAssignment(false);
      navigate(-1);
    }
  }, [activeAssignments, navigateBack]);

  function confirmSelectedAndReturn() {
    // add chosen to activeAssignments and
    // go back to AssignmentInput
    //setNavigateToAssignment(true);
    setNavigateBack(true);
    handleSelectAssignment(false);
    handleActiveAssignments(selectedAssignments);
  }

  async function importAssignments() {
    let snackbarSeverity = "success";
    let snackbarText = "";
    handleSnackbar({ ["action"]: parseUICode("ui_importing_assignments") });
    try {
      // get the assignmentData folder to import from the user
      const importPath: string = await handleIPCResult(() =>
        window.api.selectDir()
      );

      if (importPath.length === 0) {
        throw new Error("ui_folder_invalid");
      }

      const importResult = await handleIPCResult(() =>
        window.api.importAssignmentsFS(activePath, importPath)
      );

      snackbarText = importResult;
      refreshAssignments(); // get the assignments
      updateFilters(); // and filters
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  function toggleAll() {
    const checkedElements = courseAssignments.map((assignment) => {
      assignment.isChecked = allSelected ? false : true;
      return assignment;
    });

    // invert the state
    setAllSelected((prevState) => !prevState);

    setCourseAssignments(checkedElements);
  }

  // function handleCreateSet() {
  //   if (selectedAssignments?.length > 0) {
  //     handleActiveAssignments(selectedAssignments);
  //     handleActiveSet(undefined);
  //     handleSetFromBrowse(true);
  //     navigate("/setCreator");
  //   } else {
  //     handleSnackbar({ ["error"]: parseUICode("ui_no_assignment_seleted") });
  //   }
  // }

  return (
    <>
      <div className="emptySpace1" />
      <SearchBar
        autoFillOptions={courseAssignments}
        optionLabel={"title"}
        searchFunction={handleSearch}
      ></SearchBar>

      <div className="emptySpace1" />

      <div className="emptySpace1" />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <ButtonComp
          buttonType="normal"
          onClick={() => handleOpenAssignment()}
          ariaLabel={parseUICode("ui_aria_show_edit")}
          disabled={numSelected === 1 ? false : true}
        >
          {parseUICode("ui_show_edit")}
        </ButtonComp>
        {typeof activeAssignments !== "undefined" || selectAssignment ? (
          <ButtonComp
            buttonType="normal"
            onClick={() => {
              confirmSelectedAndReturn();
            }}
            ariaLabel={parseUICode("ui_accept_and_return")}
          >
            {`(${numSelected}) ${parseUICode("ui_accept_and_return")}`}
          </ButtonComp>
        ) : (
          <>
            {/* <ButtonComp
              buttonType="normal"
              onClick={() => {
                handleCreateSet();
              }}
              ariaLabel={parseUICode("ui_create_new_set")}
              disabled={numSelected > 0 ? false : true}
            >
              {parseUICode("ui_create_set")}
            </ButtonComp> */}
            <ButtonComp
              confirmationModal={true}
              modalText={`${parseUICode("ui_delete")} 
            ${numSelected}`}
              buttonType="delete"
              onClick={() => handleDeleteSelected()}
              ariaLabel={parseUICode("ui_aria_remove_selected")}
              disabled={numSelected > 0 ? false : true}
            >
              {`${parseUICode("ui_delete")} ${numSelected}`}
            </ButtonComp>

            <ButtonComp
              buttonType="normal"
              onClick={() => toggleAll()}
              ariaLabel={
                allSelected
                  ? parseUICode("ui_deselect_all")
                  : parseUICode("ui_select_all")
              }
            >
              {allSelected
                ? parseUICode("ui_deselect_all")
                : parseUICode("ui_select_all")}
            </ButtonComp>

            <HelpText text={parseUICode("help_import_assignments")}>
              <ButtonComp
                buttonType="import"
                onClick={() => importAssignments()}
                ariaLabel={parseUICode("ui_import_assignments")}
              >
                {parseUICode("ui_import_assignments")}
              </ButtonComp>
            </HelpText>
          </>
        )}
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
              <List>{assignments}</List>
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
                  <ListSubheader>{parseUICode("ui_types")}</ListSubheader>
                  <List>{types}</List>
                </ListItem>
                <ListItem nested>
                  <ListSubheader>{parseUICode("ui_tags")}</ListSubheader>
                  <List>{tags}</List>
                </ListItem>
                <ListItem nested>
                  <ListSubheader>{parseUICode("ui_modules")}</ListSubheader>
                  <List>{modules}</List>
                </ListItem>
              </List>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <div className="emptySpace1" />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <ButtonComp
          buttonType="normal"
          onClick={() => navigate(-1)}
          ariaLabel={parseUICode("ui_aria_cancel")}
        >
          {parseUICode("ui_cancel")}
        </ButtonComp>
        {DEVMODE ? (
          <ButtonComp
            buttonType="debug"
            onClick={() => console.log(courseAssignments)}
            ariaLabel={" debug "}
          >
            log all assignments
          </ButtonComp>
        ) : (
          ""
        )}
      </Stack>
    </>
  );
}
