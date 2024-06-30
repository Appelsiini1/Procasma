import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language } from "../constantsUI";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  List,
  ListSubheader,
  ListItem,
  Stack,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";
import { CodeAssignmentData, CourseData } from "../types";
import { getAssignments } from "../helpers/requests";
import {
  AssignmentWithCheck,
  filterState,
  filterType,
  generateAssignments,
  generateFilter,
  handleDeleteSelected,
  handleUpdateFilter,
  handleUpdateUniqueTags,
  setSelectedViaChecked,
} from "../helpers/browseHelpers";

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
  let pageButtons: React.JSX.Element = null;
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;
  let types: Array<React.JSX.Element> = null;

  const [courseAssignments, setCourseAssignments] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentData>
  >([]);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>([]);
  const [uniqueModules, setUniqueModules] = useState<Array<filterState>>([]);
  const [uniqueTypes, setUniqueTypes] = useState<Array<filterState>>([]);
  const [search, setSearch] = useState<string>(null);

  function handleSearch(value: string) {
    setSearch(value);
  }

  function getTagsFromAssignments(
    assignments: CodeAssignmentData[]
  ): Array<string> {
    const tags: Array<string> = [];
    assignments.forEach((assignment) => {
      tags.push(...assignment.tags);
    });
    return tags;
  }

  const refreshAssignments = async () => {
    if (!activePath) {
      return;
    }

    const assignments: CodeAssignmentData[] = await getAssignments(activePath);

    if (!assignments) {
      return;
    }

    // wrap the fetched assignments to store checked state
    const assignentsWithCheck = assignments.map((assignment) => {
      const assignmentCheck: AssignmentWithCheck = {
        isChecked: false,
        value: assignment,
      };

      return assignmentCheck;
    });

    if (assignentsWithCheck) {
      // update assignments and filters
      setCourseAssignments(assignentsWithCheck);
      const tags: Array<string> = getTagsFromAssignments(assignments);
      handleUpdateUniqueTags(tags, setUniqueTags);

      const modules: Array<string> = assignments.map((assignment) => {
        return String(assignment.module);
      });

      const types: Array<string> = assignments.map((assignment) => {
        return String(assignment.assignmentType);
      });

      handleUpdateFilter(modules, setUniqueModules);
      handleUpdateFilter(types, setUniqueTypes);
    }
  };

  // Get the course assignments on page load
  useEffect(() => {
    refreshAssignments();
  }, []);

  // Update the selected assignments counter
  useEffect(() => {
    const numChecked = setSelectedViaChecked(
      courseAssignments,
      setSelectedAssignments
    );

    setNumSelected(numChecked);
  }, [courseAssignments]);

  /**
   * Generate a string specifying the assignment type from
   * the identifier within an assignment.
   */
  function formAssignmentTypeText(type: string): string {
    return (texts as any)[`ui_${type}`]?.[language?.current] ?? "";
  }

  const modulesFilter: filterType = { name: "module", filters: uniqueModules };
  const tagsFilter: filterType = { name: "tags", filters: uniqueTags };
  const typesFilter: filterType = {
    name: "assignmentType",
    filters: uniqueTypes,
  };

  assignments = generateAssignments(
    courseAssignments,
    setCourseAssignments,
    [modulesFilter, tagsFilter, typesFilter],
    search
  );
  modules = generateFilter(uniqueModules, setUniqueModules);
  tags = generateFilter(uniqueTags, setUniqueTags);
  types = generateFilter(uniqueTypes, setUniqueTypes, formAssignmentTypeText);

  async function handleOpenAssignment() {
    // set the first selected assignment as global
    if (!selectedAssignments || selectedAssignments.length < 1) {
      console.log("no assignment selected");
      return;
    }
    setNavigateToAssignment(true);
    handleActiveAssignment(selectedAssignments[0]);
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
        {/*<SelectedHeader selected={numSelected} />*/}

        <div className="emptySpace1" />
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <ButtonComp
            buttonType="normal"
            onClick={() =>
              handleDeleteSelected(
                selectedAssignments,
                activePath,
                refreshAssignments
              )
            }
            ariaLabel={texts.ui_aria_remove_selected[language.current]}
          >
            {`${texts.ui_delete[language.current]} ${numSelected}`}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => {
              handleOpenAssignment();
            }}
            ariaLabel={texts.ui_aria_show_edit[language.current]}
          >
            {texts.ui_show_edit[language.current]}
          </ButtonComp>
          <Typography>
            {selectedAssignments && selectedAssignments.length > 0
              ? selectedAssignments[0]?.title
              : ""}
          </Typography>
        </Stack>
      </>
    );
    pageButtons = (
      <>
        <ButtonComp
          buttonType="normal"
          onClick={null}
          ariaLabel={texts.ui_aria_save[language.current]}
        >
          {texts.ui_save[language.current]}
        </ButtonComp>
        <ButtonComp
          buttonType="normal"
          onClick={() => {
            console.log(courseAssignments);
            console.log(uniqueTags);
            console.log(uniqueModules);
            console.log(uniqueTypes);
          }}
          ariaLabel={texts.ui_aria_save[language.current]}
        >
          log checked states
        </ButtonComp>
        <ButtonComp
          buttonType="normal"
          onClick={() => navigate(-1)}
          ariaLabel={texts.ui_aria_cancel[language.current]}
        >
          {texts.ui_cancel[language.current]}
        </ButtonComp>
      </>
    );
  }
  return (
    <>
      <PageHeaderBar
        pageName={texts.ui_assignment_browser[language.current]}
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
                <List>
                  <ListItem nested>
                    <ListSubheader>
                      {texts.ui_type[language.current]}
                    </ListSubheader>
                    <List>{types}</List>
                  </ListItem>
                  <ListItem nested>
                    <ListSubheader>
                      {texts.ui_modules[language.current]}
                    </ListSubheader>
                    <List>{modules}</List>
                  </ListItem>
                  <ListItem nested>
                    <ListSubheader>
                      {texts.ui_tags[language.current]}
                    </ListSubheader>
                    <List>{tags}</List>
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
          {pageButtons}
        </Stack>
      </div>
    </>
  );
}
