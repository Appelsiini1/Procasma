import { useNavigate } from "react-router-dom";
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
  AssignmentWithCheck,
  CodeAssignmentData,
  CodeAssignmentDatabase,
  ModuleDatabase,
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

export default function AssignmentBrowse() {
  const {
    activePath,
    activeAssignment,
    handleActiveAssignment,
    activeAssignments,
    handleActiveAssignments,
  }: {
    activePath: string;
    activeAssignment: CodeAssignmentData;
    handleActiveAssignment: (value: CodeAssignmentData) => void;
    activeAssignments: CodeAssignmentDatabase[];
    handleActiveAssignments: (value: CodeAssignmentDatabase[]) => void;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar, setIPCLoading } =
    useContext(UIContext);
  const [courseAssignments, setCourseAssignments] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentDatabase>
  >([]);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [navigateBack, setNavigateBack] = useState(false);

  const [numSelected, setNumSelected] = useState(0);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>([]);
  const [uniqueModules, setUniqueModules] = useState<Array<filterState>>([]);
  const [search, setSearch] = useState<string>("");

  const navigate = useNavigate();
  let assignments: Array<React.JSX.Element> = null;
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  const refreshAssignments = async () => {
    try {
      if (!activePath) {
        return;
      }

      const checkedTags: string[] = [];
      const checkedModules: string[] = [];
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

      const filters = {
        tags: checkedTags,
        module: checkedModules,
        title: search,
      };

      let assignmentsResult: CodeAssignmentDatabase[] = [];

      assignmentsResult = await handleIPCResult(setIPCLoading, () =>
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
    const tagsResult: TagDatabase[] = await handleIPCResult(setIPCLoading, () =>
      window.api.getAssignmentTagsDB(activePath)
    );

    handleUpdateUniqueTags(tagsResult, setUniqueTags);

    const modulesResult: ModuleDatabase[] = await handleIPCResult(
      setIPCLoading,
      () => window.api.getModulesDB(activePath)
    );

    handleUpdateFilter(modulesResult, setUniqueModules);
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
  }, []);

  async function handleDeleteSelected() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_delete_success";
    try {
      await handleIPCResult(setIPCLoading, () =>
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
  }, [uniqueTags, uniqueModules, search]);

  assignments = generateChecklist(
    courseAssignments,
    setCourseAssignments,
    true
  );
  modules = generateFilterList(uniqueModules, setUniqueModules);
  tags = generateFilterList(uniqueTags, setUniqueTags);

  async function handleOpenAssignment() {
    try {
      const assignmentsResult = await handleIPCResult(setIPCLoading, () =>
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
    handleActiveAssignments(selectedAssignments);
  }

  async function importAssignments() {
    let snackbarSeverity = "success";
    let snackbarText = "";
    try {
      // get the assignmentData folder to import from the user
      const importPath: string = await handleIPCResult(setIPCLoading, () =>
        window.api.selectDir()
      );

      if (importPath.length === 0) {
        throw new Error("ui_folder_invalid");
      }

      const importResult = await handleIPCResult(setIPCLoading, () =>
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

  function selectAll() {
    const checkedElements = courseAssignments.map((assignment) => {
      assignment.isChecked = true;
      return assignment;
    });

    setCourseAssignments(checkedElements);
  }

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
        {typeof activeAssignments !== "undefined" ? (
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
            <ButtonComp
              buttonType="normal"
              onClick={() => {
                //handleCreateSet();
              }}
              ariaLabel={parseUICode("ui_create_new_set")}
              disabled={numSelected > 0 ? false : true}
            >
              {parseUICode("ui_create_set")}
            </ButtonComp>
            <ButtonComp
              confirmationModal={true}
              modalText={`${parseUICode("ui_delete")} 
            ${numSelected}`}
              buttonType="normal"
              onClick={() => handleDeleteSelected()}
              ariaLabel={parseUICode("ui_aria_remove_selected")}
              disabled={numSelected > 0 ? false : true}
            >
              {`${parseUICode("ui_delete")} ${numSelected}`}
            </ButtonComp>

            <ButtonComp
              buttonType="import"
              onClick={() => importAssignments()}
              ariaLabel={parseUICode("ui_create_new_set")}
            >
              {parseUICode("ui_import_assignments")}
            </ButtonComp>

            <ButtonComp
              buttonType="normal"
              onClick={() => selectAll()}
              ariaLabel={" debug "}
            >
              select all
            </ButtonComp>
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
        <ButtonComp
          buttonType="normal"
          onClick={() => console.log(courseAssignments)}
          ariaLabel={" debug "}
        >
          log all assignments
        </ButtonComp>
      </Stack>
    </>
  );
}
