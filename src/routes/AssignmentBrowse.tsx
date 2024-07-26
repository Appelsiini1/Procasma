import PageHeaderBar from "../components/PageHeaderBar";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  List,
  ListSubheader,
  ListItem,
  Stack,
  Typography,
  Checkbox,
  ListItemButton,
} from "@mui/joy";
import { useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";
import {
  CodeAssignmentData,
  CodeAssignmentDatabase,
  CourseData,
  ModuleDatabase,
  TagDatabase,
} from "../types";
import {
  WithCheckWrapper,
  filterState,
  generateFilterList,
  handleCheckArray,
  handleUpdateFilter,
  handleUpdateUniqueTags,
  setSelectedViaChecked,
} from "../rendererHelpers/browseHelpers";
import SnackbarComp, {
  SnackBarAttributes,
  functionResultToSnackBar,
} from "../components/SnackBarComp";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";

export interface AssignmentWithCheck extends WithCheckWrapper {
  value: CodeAssignmentDatabase;
}

export function generateAssignments(
  assignments: AssignmentWithCheck[],
  setCourseAssignments: React.Dispatch<
    React.SetStateAction<AssignmentWithCheck[]>
  >
) {
  return assignments
    ? assignments.map((assignment: AssignmentWithCheck) => {
        return (
          <ListItem
            key={assignment.value.id}
            startAction={
              <Checkbox
                checked={assignment.isChecked}
                onChange={() =>
                  handleCheckArray(
                    assignment.value,
                    !assignment.isChecked,
                    setCourseAssignments
                  )
                }
              ></Checkbox>
            }
          >
            <ListItemButton
              selected={assignment.isChecked}
              onClick={() =>
                handleCheckArray(
                  assignment.value,
                  !assignment.isChecked,
                  setCourseAssignments
                )
              }
            >
              {assignment.value.title}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
}

export default function AssignmentBrowse({
  activeCourse,
  activePath,
  activeAssignment,
  handleActiveAssignment,
}: {
  activeCourse: CourseData;
  activePath: string;
  activeAssignment: CodeAssignmentData;
  handleActiveAssignment: (value: CodeAssignmentData) => void;
}) {
  const pageType = useLoaderData();
  const navigate = useNavigate();
  let assignments: Array<React.JSX.Element> = null;
  let selectFragment: React.JSX.Element = null;
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  const [courseAssignments, setCourseAssignments] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentDatabase>
  >([]);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>([]);
  const [uniqueModules, setUniqueModules] = useState<Array<filterState>>([]);
  const [search, setSearch] = useState<string>("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "success", text: "" });

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
      if (
        checkedTags.length > 0 ||
        checkedModules.length > 0 ||
        search?.length > 0
      ) {
        // Filter if filters selected
        assignmentsResult = await handleIPCResult(() =>
          window.api.getFilteredAssignmentsDB(activePath, filters)
        );
      } else {
        assignmentsResult = await handleIPCResult(() =>
          window.api.getAssignmentsDB(activePath)
        );
      }

      // wrap the fetched assignments to store checked state
      const assignentsWithCheck = assignmentsResult.map((assignment) => {
        const assignmentCheck: AssignmentWithCheck = {
          isChecked: false,
          value: assignment,
        };

        return assignmentCheck;
      });

      // update assignments and filters
      setCourseAssignments(assignentsWithCheck);
    } catch (err) {
      functionResultToSnackBar(
        { error: parseUICode(err.message) },
        setShowSnackbar,
        setSnackBarAttributes
      );
    }
  };

  function handleSearch(value: string) {
    setSearch(value);
    refreshAssignments();
  }

  async function updateFilters() {
    const tagsResult: TagDatabase[] = await handleIPCResult(() =>
      window.api.getAssignmentTagsDB(activePath)
    );

    handleUpdateUniqueTags(tagsResult, setUniqueTags);

    const modulesResult: ModuleDatabase[] = await handleIPCResult(() =>
      window.api.handleGetModulesFS(activePath)
    );

    handleUpdateFilter(modulesResult, setUniqueModules);
  }

  // Get the course assignments and filters on page load
  useEffect(() => {
    refreshAssignments();
    updateFilters();
  }, []);

  async function handleDeleteSelected() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_delete_success";
    try {
      const deletePromises = selectedAssignments.map(async (assignment) => {
        await handleIPCResult(() =>
          window.api.handleDeleteAssignmentFS(activePath, assignment.id)
        );
      });
      await Promise.all(deletePromises);

      // get the remaining assignments
      refreshAssignments();
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
  }, [uniqueTags, uniqueModules]);

  assignments = generateAssignments(courseAssignments, setCourseAssignments);
  modules = generateFilterList(uniqueModules, setUniqueModules);
  tags = generateFilterList(uniqueTags, setUniqueTags);

  async function handleOpenAssignment() {
    try {
      if (!selectedAssignments || selectedAssignments.length < 1) {
        throw new Error("ui_no_assignment_seleted");
      }

      const assignmentsResult = await handleIPCResult(() =>
        window.api.handleGetAssignmentsFS(activePath, selectedAssignments[0].id)
      );

      setNavigateToAssignment(true);
      handleActiveAssignment(assignmentsResult[0]);
    } catch (err) {
      functionResultToSnackBar(
        { error: parseUICode(err.message) },
        setShowSnackbar,
        setSnackBarAttributes
      );
    }
  }

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

  if (pageType === "browse") {
    selectFragment = (
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
            confirmationModal={true}
            modalText={`${parseUICode("ui_delete")} 
              ${numSelected}`}
            buttonType="normal"
            onClick={() => handleDeleteSelected()}
            ariaLabel={parseUICode("ui_aria_remove_selected")}
          >
            {`${parseUICode("ui_delete")} ${numSelected}`}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => {
              handleOpenAssignment();
            }}
            ariaLabel={parseUICode("ui_aria_show_edit")}
          >
            {parseUICode("ui_show_edit")}
          </ButtonComp>
          <Typography>
            {selectedAssignments && selectedAssignments.length > 0
              ? selectedAssignments[0]?.title
              : ""}
          </Typography>
        </Stack>
      </>
    );
  }
  return (
    <>
      <PageHeaderBar
        pageName={parseUICode("ui_assignment_browser")}
        courseID={activeCourse?.ID}
        courseTitle={activeCourse?.title}
      />
      <div className="content">
        {selectFragment}

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
        </Stack>
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
