import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language } from "../constantsUI";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  Box,
  Checkbox,
  Grid,
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";
import { CodeAssignmentData, CourseData } from "../types";
import { getAssignments } from "../helpers/requests";

type filterState = {
  isChecked: boolean;
  value: string;
};

type AssignmentWithCheck = {
  isChecked: boolean;
  value: CodeAssignmentData;
};

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

  function handleUpdateUniqueTags(assignments: CodeAssignmentData[]) {
    const tags: string[] = [];
    const tagsFilter: filterState[] = [];

    assignments.forEach((assignment: CodeAssignmentData) => {
      assignment?.tags.forEach((tag) => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    });

    tags.forEach((tag) => {
      const tagFilter: filterState = {
        isChecked: false,
        value: tag,
      };
      tagsFilter.push(tagFilter);
    });

    setUniqueTags(tagsFilter);
  }

  function handleUpdateFilter(
    assignments: CodeAssignmentData[],
    attribute: string,
    setter: React.Dispatch<React.SetStateAction<filterState[]>>
  ) {
    const uniques: string[] = [];
    const filters: filterState[] = [];

    assignments.forEach((assignment: CodeAssignmentData) => {
      const newUnique: string | null = assignment?.[attribute].toString();

      if (newUnique && !uniques.includes(newUnique)) {
        uniques.push(newUnique);
      }
    });

    uniques.forEach((unique) => {
      const uniqueFilter: filterState = {
        isChecked: false,
        value: unique.toString(),
      };
      filters.push(uniqueFilter);
    });
    setter(filters);
  }

  function handleSearch(value: string) {
    setSearch(value);
  }

  /**
   * Invert the checked state of the element specified by value.
   */
  function handleCheckArray(
    value: any,
    check: boolean,
    setter: React.Dispatch<React.SetStateAction<any[]>>
  ) {
    setter((prevState) => {
      const newState = prevState.filter((filter) => {
        if (filter.value === value) {
          filter.isChecked = check;
        }
        return filter;
      });

      return newState;
    });
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
      handleUpdateUniqueTags(assignments);
      handleUpdateFilter(assignments, "module", setUniqueModules);
      handleUpdateFilter(assignments, "assignmentType", setUniqueTypes);
    }
  };

  // Get the course assignments on page load
  useEffect(() => {
    refreshAssignments();
  }, []);

  // Update the selected assignments counter
  useEffect(() => {
    const checkedAssignments: CodeAssignmentData[] = courseAssignments.map(
      (assignment) => {
        return assignment.isChecked ? assignment.value : null;
      }
    );

    // remove empty elements and update assignments
    setSelectedAssignments(checkedAssignments.filter((n) => n));

    const numChecked: number = checkedAssignments.reduce(
      (accumulator, currentValue) => {
        return accumulator + (currentValue ? 1 : 0);
      },
      0
    );

    setNumSelected(numChecked);
  }, [courseAssignments]);

  function checkIfAnyCommonItems(array1: string[], array2: string[]) {
    return array1.some((item) => array2.includes(item));
  }

  function checkIfShouldShowAssignment(
    assignment: CodeAssignmentData,
    property: string,
    filterElements: filterState[]
  ): boolean {
    let shouldShow = true;
    let checkedCount = 0;

    const match = filterElements.find((filter) => {
      if (!filter.isChecked) {
        return false;
      }

      checkedCount = checkedCount + 1;

      const assignmentValue: CodeAssignmentData[keyof CodeAssignmentData] =
        assignment[property];

      if (assignmentValue.constructor.name == "Array") {
        if (checkIfAnyCommonItems(assignmentValue, [filter.value])) {
          return true;
        }
      } else {
        if (assignmentValue.toString() === filter.value) {
          return true;
        }
      }

      return false;
    });

    if (!match) {
      shouldShow = false;
    }

    // if no filters, show all
    if (checkedCount === 0) {
      shouldShow = true;
    }

    return shouldShow;
  }

  assignments = courseAssignments
    ? courseAssignments.map((assignment: AssignmentWithCheck) => {
        let showAssignment = true;

        showAssignment = checkIfShouldShowAssignment(
          assignment.value,
          "tags",
          uniqueTags
        )
          ? showAssignment
          : false;

        showAssignment = checkIfShouldShowAssignment(
          assignment.value,
          "module",
          uniqueModules
        )
          ? showAssignment
          : false;

        showAssignment = checkIfShouldShowAssignment(
          assignment.value,
          "assignmentType",
          uniqueTypes
        )
          ? showAssignment
          : false;

        if (search && search.length > 0) {
          const titleFormatted = assignment.value.title.toLowerCase();
          const searchFormatted = search.toLowerCase();

          showAssignment = titleFormatted.includes(searchFormatted)
            ? true
            : false;
        }

        return showAssignment ? (
          <ListItem
            key={assignment.value.title}
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
        ) : null;
      })
    : null;

  function formAssignmentTypeText(type: string): string {
    return (texts as any)[`ui_${type}`]?.[language?.current] ?? "";
  }

  /**
   * @returns A JSX list of unique filters with checkboxes
   */
  function generateFilter(
    uniques: filterState[],
    setUniques: React.Dispatch<React.SetStateAction<filterState[]>>,
    filterTextFunction?: (text: string) => string
  ): Array<React.JSX.Element> {
    const filters = uniques
      ? uniques.map((unique) => {
          return (
            <ListItem
              key={unique.value}
              startAction={
                <Checkbox
                  checked={unique.isChecked}
                  onChange={() =>
                    handleCheckArray(
                      unique.value,
                      !unique.isChecked,
                      setUniques
                    )
                  }
                ></Checkbox>
              }
            >
              <ListItemButton
                selected={unique.isChecked}
                onClick={() =>
                  handleCheckArray(unique.value, !unique.isChecked, setUniques)
                }
              >
                {filterTextFunction
                  ? filterTextFunction(unique.value)
                  : unique.value}
              </ListItemButton>
            </ListItem>
          );
        })
      : null;
    return filters;
  }

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

  const handleDeleteSelected = async () => {
    try {
      const deletePromises = selectedAssignments.map(async (assignment) => {
        const result = await window.api.deleteAssignment(
          activePath,
          assignment.assignmentID
        );
        return result;
      });

      const results = await Promise.all(deletePromises);

      // get the remaining assignments
      refreshAssignments();
    } catch (error) {
      console.error("Error deleting assignments:", error);
    }
  };

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
            onClick={() => handleDeleteSelected()}
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
