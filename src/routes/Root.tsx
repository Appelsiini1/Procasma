import PageHeaderBar from "../components/PageHeaderBar";
import { dividerColor } from "../constantsUI";
import LogoText from "../../resource/LogoText.png";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  Box,
  Divider,
  Grid,
  Typography,
} from "@mui/joy";
import ButtonComp from "../components/ButtonComp";
import { useNavigate } from "react-router-dom";
import FadeInImage from "../components/FadeInImage";
import { CodeAssignmentData, CourseData, ModuleData } from "../types";
import { useEffect, useState } from "react";
import { refreshTitle } from "../rendererHelpers/requests";
import SnackbarComp, {
  SnackBarAttributes,
  functionResultToSnackBar,
} from "../components/SnackBarComp";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { parseUICode } from "../rendererHelpers/translation";

const dividerSX = { padding: ".1rem", margin: "2rem", bgcolor: dividerColor };
const smallDividerSX = {
  padding: ".1rem",
  margin: "2rem",
  bgcolor: dividerColor,
  marginLeft: "7rem",
  marginRight: "7rem",
};

export default function Root({
  activeCourse,
  activePath,
  handleActiveCourse,
  handleActivePath,
  activeAssignment,
  handleActiveAssignment,
  activeModule,
  handleActiveModule,
}: {
  activeCourse: CourseData;
  activePath: string;
  handleActiveCourse: React.Dispatch<React.SetStateAction<CourseData>>;
  handleActivePath: React.Dispatch<React.SetStateAction<string>>;
  activeAssignment: CodeAssignmentData;
  handleActiveAssignment: React.Dispatch<
    React.SetStateAction<CodeAssignmentData>
  >;
  activeModule: ModuleData;
  handleActiveModule: React.Dispatch<React.SetStateAction<ModuleData>>;
}) {
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [navigateToProjectWork, setNavigateToProjectWork] = useState(false);
  const [navigateToModule, setNavigateToModule] = useState(false);
  const [assignmentsInIndex, setAssignmentsInIndex] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "success", text: "" });

  const refreshAssignmentsInIndex = async () => {
    try {
      const assignments: CodeAssignmentData[] = await handleIPCResult(() =>
        window.api.getAssignments(activePath)
      );

      const numAssignments: number = assignments.reduce(
        (accumulator, currentValue) => {
          return accumulator + (currentValue ? 1 : 0);
        },
        0
      );

      setAssignmentsInIndex(numAssignments);
    } catch (err) {
      functionResultToSnackBar(
        { error: parseUICode(err.message) },
        setShowSnackbar,
        setSnackBarAttributes
      );
    }
  };

  useEffect(() => {
    refreshTitle();
  }, []);

  // update the assignments in index count
  useEffect(() => {
    if (activePath) {
      refreshAssignmentsInIndex();
    }
  }, [activePath]);

  // navigate to assignment after clearing
  useEffect(() => {
    if (activeAssignment === null && navigateToAssignment) {
      setNavigateToAssignment(false);
      navigate("/inputCodeAssignment");
    }
  }, [activeAssignment, navigateToAssignment]);

  // navigate to assignment after clearing
  useEffect(() => {
    if (activeAssignment === null && navigateToProjectWork) {
      setNavigateToProjectWork(false);
      navigate("/inputCodeProjectWork");
    }
  }, [activeAssignment, navigateToProjectWork]);

  // navigate to module after clearing
  useEffect(() => {
    if (activeModule === null && navigateToModule) {
      setNavigateToModule(false);
      navigate("/newModule");
    }
  }, [activeModule, navigateToModule]);

  const pageName = parseUICode("ui_main");
  const navigate = useNavigate();

  async function handleSelectCourseFolder() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_course_folder_opened";
    try {
      const coursePath: string = await handleIPCResult(() =>
        window.api.selectDir()
      );

      const course: CourseData = await handleIPCResult(() =>
        window.api.readCourse(coursePath)
      );

      if (course) {
        handleActiveCourse(course);
        handleActivePath(coursePath);
      } else {
        snackbarSeverity = "info";
        snackbarText = "ui_course_folder_invalid";
      }
    } catch (err) {
      snackbarSeverity = "error";
      snackbarText = err.message;
    }
    functionResultToSnackBar(
      { [snackbarSeverity]: parseUICode(snackbarText) },
      setShowSnackbar,
      setSnackBarAttributes
    );
  }

  return (
    <>
      <PageHeaderBar
        pageName={pageName}
        courseID={activeCourse?.ID}
        courseTitle={activeCourse?.title}
      />
      <div className="menuContent">
        <div style={{ height: "10rem" }}>
          <FadeInImage src={LogoText} className="textLogo" alt="main logo" />
        </div>

        <Typography level="h4" sx={{ paddingBottom: "2rem" }}>
          {parseUICode("ui_no_assignments_index") +
            ": " +
            `${assignmentsInIndex ? String(assignmentsInIndex) : "0"}`}
        </Typography>

        <Box>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={3}
          >
            <Grid>
              <ButtonComp
                buttonType="largeAdd"
                onClick={() => {
                  navigate("/createCourse");
                }}
                ariaLabel={parseUICode("ui_aria_nav_course_create")}
              >
                {parseUICode("course_create")}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="openCourse"
                onClick={() => handleSelectCourseFolder()}
                ariaLabel={parseUICode("ui_aria_nav_open_course")}
              >
                {parseUICode("course_open")}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() =>
                  activeCourse ? navigate("/manageCourse") : null
                }
                ariaLabel={parseUICode("ui_aria_nav_manage_course")}
                disabled={activeCourse ? false : true}
              >
                {parseUICode("course_manage")}
              </ButtonComp>
            </Grid>
          </Grid>

          <Divider sx={dividerSX} role="presentation" />

          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={3}
          >
            <Grid>
              <ButtonComp
                buttonType="largeAdd"
                onClick={() => {
                  setAddingAssignment(!addingAssignment);
                }}
                ariaLabel={parseUICode("ui_aria_nav_add_assignment")}
                disabled={activeCourse ? false : true}
              >
                {parseUICode("ui_assignment")}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => {
                  navigate("/AssignmentBrowse");
                }}
                ariaLabel={parseUICode("ui_aria_nav_browse_assignments")}
                disabled={activeCourse ? false : true}
              >
                {parseUICode("ui_assignment_management")}
              </ButtonComp>
            </Grid>
          </Grid>

          <AccordionGroup>
            <Accordion expanded={addingAssignment}>
              <AccordionDetails>
                <>
                  <Divider sx={smallDividerSX} role="presentation" />

                  <Grid
                    container
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={3}
                  >
                    <Grid>
                      <ButtonComp
                        buttonType="largeAddAlt"
                        onClick={() => {
                          // clear the active assignment
                          // useEffect will navigate on the change
                          setNavigateToAssignment(true);
                          activeAssignment
                            ? handleActiveAssignment(null)
                            : navigate("/inputCodeAssignment");
                        }}
                        ariaLabel={parseUICode("ui_aria_nav_add_assignment")}
                      >
                        {parseUICode("ui_code_assignment")}
                      </ButtonComp>
                    </Grid>

                    <Grid>
                      <ButtonComp
                        buttonType="largeAddAlt"
                        onClick={() => {
                          // clear the active project work
                          // useEffect will navigate on the change
                          setNavigateToProjectWork(true);
                          activeAssignment
                            ? handleActiveAssignment(null)
                            : navigate("/inputCodeProjectWork");
                        }}
                        ariaLabel={parseUICode("ui_aria_nav_add_project")}
                      >
                        {parseUICode("ui_project_work")}
                      </ButtonComp>
                    </Grid>

                    <Grid>
                      <ButtonComp
                        buttonType="largeAddAlt"
                        onClick={() => {
                          console.log("Add other");
                        }}
                        ariaLabel={parseUICode("ui_add")}
                      >
                        {parseUICode("ui_other")}
                      </ButtonComp>
                    </Grid>
                  </Grid>
                </>
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>

          <Divider sx={dividerSX} role="presentation" />

          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={3}
          >
            <Grid>
              <ButtonComp
                buttonType="largeAdd"
                onClick={() => {
                  // clear the active module
                  // useEffect will navigate on the change
                  setNavigateToModule(true);
                  activeModule
                    ? handleActiveModule(null)
                    : navigate("/newModule");
                }}
                ariaLabel={parseUICode("ui_aria_nav_add_module")}
                disabled={activeCourse ? false : true}
              >
                {parseUICode("ui_module")}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => {
                  navigate("/moduleBrowse");
                }}
                ariaLabel={parseUICode("ui_aria_nav_browse_modules")}
                disabled={activeCourse ? false : true}
              >
                {parseUICode("ui_module_management")}
              </ButtonComp>
            </Grid>
          </Grid>

          <Divider sx={dividerSX} role="presentation" />

          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={3}
          >
            <Grid>
              <ButtonComp
                buttonType="largeAdd"
                onClick={() => {
                  navigate("/setCreator");
                }}
                ariaLabel={parseUICode("ui_aria_nav_add_set")}
                disabled={activeCourse ? false : true}
              >
                {parseUICode("ui_assignment_set")}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="openCourse"
                onClick={() => navigate("/SetBrowse")}
                ariaLabel={parseUICode("ui_aria_nav_browse_sets")}
                disabled={activeCourse ? false : true}
              >
                {parseUICode("ui_assignment_sets")}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="export"
                onClick={() => navigate("/exportProject")}
                ariaLabel={parseUICode("ui_aria_nav_export_project")}
                disabled={activeCourse ? false : true}
              >
                {parseUICode("ui_export_project")}
              </ButtonComp>
            </Grid>
          </Grid>

          <Divider sx={dividerSX} role="presentation" />

          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={3}
          >
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => navigate("/settings")}
                ariaLabel={parseUICode("ui_delete")}
              >
                {parseUICode("ui_settings")}
              </ButtonComp>
            </Grid>
          </Grid>
          <div className="emptySpace3" />
        </Box>
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
