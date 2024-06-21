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
import SelectedHeader from "../components/SelectedHeader";
import { useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";
import { CodeAssignmentData, CourseData } from "../types";
import { testCurrentAssignment } from "../myTestGlobals";

type filterState = {
  isChecked: boolean;
  value: string;
};

export default function AssignmentBrowse({
  activeCourse,
  activePath,
}: {
  activeCourse: CourseData;
  activePath: string;
}) {
  const pageType = useLoaderData();
  const navigate = useNavigate();
  let assignments: Array<React.JSX.Element> = null;
  let selectFragment: React.JSX.Element = null;
  let pageButtons: React.JSX.Element = null;
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  const [courseAssignments, setCourseAssignments] = useState<
    Array<CodeAssignmentData>
  >([]);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>([]);
  const [uniqueModules, setUniqueModules] = useState<Array<filterState>>([]);

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

  function handleUpdateUniqueModules(assignments: CodeAssignmentData[]) {
    const modules: string[] = [];
    const modulesFilter: filterState[] = [];

    assignments.forEach((assignment: CodeAssignmentData) => {
      const newModule: string | null = assignment?.module.toString();

      if (newModule && !modules.includes(newModule)) {
        modules.push(newModule);
      }
    });

    modules.forEach((module) => {
      const moduleFilter: filterState = {
        isChecked: false,
        value: module.toString(),
      };
      modulesFilter.push(moduleFilter);
    });
    setUniqueModules(modulesFilter);
  }

  /**
   * Invert the checked state of the tag specified by value.
   */
  function handleCheckFilter(
    value: string | number,
    check: boolean,
    setter: React.Dispatch<React.SetStateAction<filterState[]>>
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

  useEffect(() => {
    /*
    const getAssignments = async () => {
      try {
        const assignments: CodeAssignmentData[] =
          await window.api.getAssignments(activePath);

        if (assignments) {
          setCourseAssignments(assignments);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getAssignments();
    */

    const testCurrentAssignmentB: CodeAssignmentData = JSON.parse(
      JSON.stringify(testCurrentAssignment)
    );
    testCurrentAssignmentB.module = 2;
    testCurrentAssignmentB.title = "A2";
    testCurrentAssignmentB.tags = ["lol"];

    setCourseAssignments([testCurrentAssignment, testCurrentAssignmentB]);
    handleUpdateUniqueTags([testCurrentAssignment, testCurrentAssignmentB]);
    handleUpdateUniqueModules([testCurrentAssignment, testCurrentAssignmentB]);
  }, []);

  function checkIfAnyCommonItems(array1: string[], array2: string[]) {
    return array1.some((item) => array2.includes(item));
  }

  function isIterable(obj: any) {
    // checks for null and undefined
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === "function";
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

      if (isIterable(assignmentValue)) {
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
    ? courseAssignments.map((assignment: CodeAssignmentData) => {
        let showAssignment = true;

        showAssignment = checkIfShouldShowAssignment(
          assignment,
          "tags",
          uniqueTags
        )
          ? showAssignment
          : false;

        showAssignment = checkIfShouldShowAssignment(
          assignment,
          "module",
          uniqueModules
        )
          ? showAssignment
          : false;

        return showAssignment ? (
          <ListItem
            key={assignment.title}
            startAction={
              <Checkbox
                checked={false} //boxState}
                onChange={() =>
                  /*
                handleSelectedListChange(
                  assignment.assignmentID,
                  boxState,
                  setBoxState
                )
                  */
                  null
                }
              ></Checkbox>
            }
          >
            <ListItemButton
              selected={false} //boxState}
              onClick={
                () => null /*
              handleSelectedListChange(
                assignment.assignmentID,
                boxState,
                setBoxState
              )*/
              }
            >
              {assignment.title}
            </ListItemButton>
          </ListItem>
        ) : null;
      })
    : null;

  modules = uniqueModules
    ? uniqueModules.map((module) => {
        return (
          <ListItem
            key={module.value}
            startAction={
              <Checkbox
                checked={module.isChecked}
                onChange={() =>
                  handleCheckFilter(
                    module.value,
                    !module.isChecked,
                    setUniqueModules
                  )
                }
              ></Checkbox>
            }
          >
            <ListItemButton selected={false} onClick={() => null}>
              {module.value}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;

  tags = uniqueTags
    ? uniqueTags.map((tag) => {
        return (
          <ListItem
            key={tag.value}
            startAction={
              <Checkbox
                checked={tag.isChecked}
                onChange={() =>
                  handleCheckFilter(tag.value, !tag.isChecked, setUniqueTags)
                }
              ></Checkbox>
            }
          >
            <ListItemButton selected={false} onClick={() => null}>
              {tag.value}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;

  if (pageType === "browse") {
    selectFragment = (
      <>
        <div className="emptySpace1" />
        <SearchBar
          autoFillOptions={courseAssignments}
          optionLabel={"title"}
          searchFunction={() => console.log("search")}
        ></SearchBar>

        <div className="emptySpace1" />
        {/*<SelectedHeader selected={noSelected} />*/}

        <div className="emptySpace1" />
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <ButtonComp
            buttonType="normal"
            onClick={null}
            ariaLabel={texts.ui_aria_remove_selected[language.current]}
          >
            {texts.ui_remove_selected[language.current]}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => null} //console.log(selectedList)}
            ariaLabel={texts.ui_aria_show_edit[language.current]}
          >
            {texts.ui_show_edit[language.current]}
          </ButtonComp>
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
                width="100%"
                sx={{
                  border: "2px solid lightgrey",
                  borderRadius: "0.5rem",
                }}
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
                width="100%"
                sx={{
                  border: "2px solid lightgrey",
                  borderRadius: "0.5rem",
                }}
              >
                <List>
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
