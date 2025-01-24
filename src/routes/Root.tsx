import { DEVMODE, dividerSX, smallDividerSX } from "../constantsUI";
import LogoText from "../../resource/LogoTextSmall.png";
import { Box, Divider, Grid, Typography } from "@mui/joy";
import ButtonComp from "../components/ButtonComp";
import { useNavigate } from "react-router";
import FadeInImage from "../components/FadeInImage";
import {
  CodeAssignmentData,
  CourseData,
  ModuleData,
  RecentCourse,
  SetData,
} from "../types";
import { useContext, useEffect, useState } from "react";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { parseUICode } from "../rendererHelpers/translation";
import { ActiveObjectContext, UIContext } from "../components/Context";
import { currentCourse } from "../globalsUI";
import HoverListSelect from "../components/HoverListSelect";

export default function Root() {
  const {
    activeCourse,
    activePath,
    handleActiveCourse,
    handleActivePath,
    activeAssignment,
    handleActiveAssignment,
    activeModule,
    handleActiveModule,
    activeSet,
    handleActiveSet,
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
    activeSet: SetData;
    handleActiveSet: React.Dispatch<React.SetStateAction<SetData>>;
  } = useContext(ActiveObjectContext);
  const {
    handleSnackbar,
    handleHeaderPageName,
    handleHeaderCourseID,
    handleHeaderCourseTitle,
  } = useContext(UIContext);
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [navigateToProjectWork, setNavigateToProjectWork] = useState(false);
  const [navigateToModule, setNavigateToModule] = useState(false);
  const [navigateToSet, setNavigateToSet] = useState(false);
  const [assignmentsInIndex, setAssignmentsInIndex] = useState(null);
  const navigate = useNavigate();
  const [version, setVersion] = useState("");
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);

  const refreshAssignmentsInIndex = async () => {
    try {
      const count = await handleIPCResult(() =>
        window.api.getAssignmentCountDB(activePath)
      );

      setAssignmentsInIndex(count);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  };

  const getRecentCourses = async () => {
    try {
      const recentCourses = await handleIPCResult(() =>
        window.api.getRecentCoursesFS()
      );
      setRecentCourses(recentCourses);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  };

  useEffect(() => {
    //refreshTitle();
    handleHeaderPageName("ui_main");
    handleHeaderCourseID(activeCourse?.id);
    handleHeaderCourseTitle(activeCourse?.title);
  }, []);

  useEffect(() => {
    async function getVersion() {
      const versionTemp = await handleIPCResult(() =>
        window.api.getAppVersion()
      );
      setVersion(versionTemp);
    }
    getVersion();
    getRecentCourses();
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

  // navigate to project work after clearing
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

  // navigate to set after clearing
  useEffect(() => {
    if (activeSet === null && navigateToSet) {
      setNavigateToSet(false);
      navigate("/setCreator");
    }
  }, [activeSet, navigateToSet]);

  // TODO add select course function that takes the path
  async function handleSelectCourse(coursePath: string) {
    let snackbarSeverity = "success";
    let snackbarText = "ui_course_folder_opened";
    try {
      const course: CourseData = await handleIPCResult(() =>
        window.api.handleGetCourseFS(coursePath)
      );

      if (course) {
        handleActiveCourse(course);
        handleActivePath(coursePath);
        handleHeaderCourseID(course.id);
        handleHeaderCourseTitle(course.title);
        window.api.setCoursePath(coursePath);
        currentCourse.values = course;
      } else {
        snackbarSeverity = "error";
        snackbarText = "ui_course_folder_invalid";
      }
    } catch (err) {
      snackbarSeverity = "error";
      snackbarText = err.message;
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
    getRecentCourses();
  }

  async function handleSelectRecentCourse(course: RecentCourse) {
    handleSelectCourse(course.path);
  }

  async function handleSelectCourseFolder() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_course_folder_opened";
    try {
      const coursePath: string = await handleIPCResult(() =>
        window.api.selectDir()
      );
      if (coursePath.length === 0) {
        snackbarSeverity = "info";
        snackbarText = "ui_action_canceled";
      } else {
        handleSelectCourse(coursePath);
      }
    } catch (err) {
      snackbarSeverity = "error";
      snackbarText = err.message;
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  function checkModuleDisabled() {
    if (activeCourse) {
      if (activeCourse !== null && activeCourse.moduleType !== null) {
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  return (
    <>
      <div className="menuContent">
        <div style={{ height: "7rem" }}>
          <FadeInImage src={LogoText} className="textLogo" alt="main logo" />
        </div>

        <Typography level="h4" sx={{ paddingBottom: "1.5rem" }}>
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
              <HoverListSelect<RecentCourse>
                items={recentCourses}
                itemKey={"title" as keyof RecentCourse}
                handleSelect={handleSelectRecentCourse}
              >
                <ButtonComp
                  buttonType="openCourse"
                  onClick={() => handleSelectCourseFolder()}
                  ariaLabel={parseUICode("ui_aria_nav_open_course")}
                >
                  {parseUICode("course_open")}
                </ButtonComp>
              </HoverListSelect>
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
                buttonType="openCourse"
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
          {addingAssignment ? (
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
                    disabled={false}
                  >
                    {parseUICode("ui_project_work")}
                  </ButtonComp>
                </Grid>

                <Grid>
                  <ButtonComp
                    buttonType="largeAddAlt"
                    onClick={() => {
                      handleSnackbar({
                        ["info"]: parseUICode("ui_action_unavailable"),
                      });
                    }}
                    ariaLabel={parseUICode("ui_add")}
                    disabled={true}
                  >
                    {parseUICode("ui_other")}
                  </ButtonComp>
                </Grid>
              </Grid>
            </>
          ) : null}

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
                disabled={checkModuleDisabled()}
              >
                {parseUICode("ui_module")}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="openCourse"
                onClick={() => {
                  navigate("/moduleBrowse");
                }}
                ariaLabel={parseUICode("ui_aria_nav_browse_modules")}
                disabled={checkModuleDisabled()}
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
                  // clear the active set, useEffect will navigate on the change
                  setNavigateToSet(true);
                  activeSet ? handleActiveSet(null) : navigate("/setCreator");
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
                ariaLabel={parseUICode("ui_settings")}
              >
                {parseUICode("ui_settings")}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => navigate("/codegradeSettings")}
                ariaLabel={parseUICode("ui_cg")}
              >
                {parseUICode("ui_cg")}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="close"
                onClick={() => window.api.closeApp()}
                ariaLabel={parseUICode("ui_close")}
              >
                {parseUICode("ui_close")}
              </ButtonComp>
            </Grid>
          </Grid>
          {DEVMODE ? (
            <>
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
                    onClick={() => navigate("/CGDEV")}
                    ariaLabel={"CGDEV"}
                  >
                    {"CG DEV"}
                  </ButtonComp>
                </Grid>
              </Grid>
            </>
          ) : null}
          <div className="emptySpace3" />
        </Box>
        <Typography>Procasma {version}</Typography>
        <div />
      </div>
    </>
  );
}
