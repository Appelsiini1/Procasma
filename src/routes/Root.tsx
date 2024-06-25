import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language, dividerColor } from "../constantsUI";
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
import { CodeAssignmentData, CourseData } from "../types";
import { useEffect, useState } from "react";
import { getAssignments } from "../helpers/requests";

const dividerSX = { padding: ".1rem", margin: "2rem", bgcolor: dividerColor };
const smallDividerSX = {
  padding: ".1rem",
  margin: "2rem",
  bgcolor: dividerColor,
  marginLeft: "7rem",
  marginRight: "7rem",
};

const getVersion = async () => {
  try {
    const vers = await window.api.getAppVersion();
    const title = "Procasma " + vers;
    window.api.setTitle(title);
  } catch (error) {
    console.error(error);
  }
};

export default function Root({
  activeCourse,
  activePath,
  handleActiveCourse,
  handleActivePath,
  activeAssignment,
  handleActiveAssignment,
}: {
  activeCourse: CourseData;
  activePath: string;
  handleActiveCourse: React.Dispatch<React.SetStateAction<CourseData>>;
  handleActivePath: React.Dispatch<React.SetStateAction<string>>;
  activeAssignment: CodeAssignmentData;
  handleActiveAssignment: React.Dispatch<
    React.SetStateAction<CodeAssignmentData>
  >;
}) {
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [assignmentsInIndex, setAssignmentsInIndex] = useState(null);

  const refreshAssignmentsInIndex = async () => {
    const assignments: CodeAssignmentData[] = await getAssignments(activePath);

    if (!assignments) {
      return;
    }

    const numAssignments: number = assignments.reduce(
      (accumulator, currentValue) => {
        return accumulator + (currentValue ? 1 : 0);
      },
      0
    );

    setAssignmentsInIndex(numAssignments);
  };

  // update the assignments in index count
  useEffect(() => {
    getVersion();

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

  const pageName = texts.ui_main[language.current];
  const navigate = useNavigate();

  async function handleSelectCourseFolder() {
    try {
      const coursePath: string = await window.api.selectDir();

      const course = await window.api.readCourse(coursePath);

      if (course) {
        handleActiveCourse(course);
        handleActivePath(coursePath);
      } else {
        throw new Error("Course folder not valid");
      }
    } catch (error) {
      console.error("An error occurred:", (error as Error).message);
    }
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
          {texts.ui_no_assignments_index[language.current] +
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
                ariaLabel={texts.ui_aria_nav_course_create[language.current]}
              >
                {texts.course_create[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="openCourse"
                onClick={() => handleSelectCourseFolder()}
                ariaLabel={texts.ui_aria_nav_open_course[language.current]}
              >
                {texts.course_open[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => {
                  if (activeCourse) {
                    navigate("/manageCourse");
                  } else {
                    console.log("Select a course first");
                  }
                }}
                ariaLabel={texts.ui_aria_nav_manage_course[language.current]}
                disabled={activeCourse ? false : true}
              >
                {texts.course_manage[language.current]}
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
                ariaLabel={texts.ui_aria_nav_add_assignment[language.current]}
                disabled={activeCourse ? false : true}
              >
                {texts.ui_assignment[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => {
                  navigate("/AssignmentBrowse");
                }}
                ariaLabel={
                  texts.ui_aria_nav_browse_assignments[language.current]
                }
                disabled={activeCourse ? false : true}
              >
                {texts.ui_assignment_management[language.current]}
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
                        ariaLabel={
                          texts.ui_aria_nav_add_assignment[language.current]
                        }
                      >
                        {texts.ui_code_assignment[language.current]}
                      </ButtonComp>
                    </Grid>

                    <Grid>
                      <ButtonComp
                        buttonType="largeAddAlt"
                        onClick={() => {
                          navigate("/inputCodeProjectWork");
                        }}
                        ariaLabel={
                          texts.ui_aria_nav_add_project[language.current]
                        }
                      >
                        {texts.ui_project_work[language.current]}
                      </ButtonComp>
                    </Grid>

                    <Grid>
                      <ButtonComp
                        buttonType="largeAddAlt"
                        onClick={() => {
                          console.log("Add other");
                        }}
                        ariaLabel={texts.ui_add[language.current]}
                      >
                        {texts.ui_other[language.current]}
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
                  navigate("/newModule");
                }}
                ariaLabel={texts.ui_aria_nav_add_module[language.current]}
                disabled={activeCourse ? false : true}
              >
                {texts.ui_module[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => {
                  navigate("/moduleBrowse");
                }}
                ariaLabel={texts.ui_aria_nav_browse_modules[language.current]}
                disabled={activeCourse ? false : true}
              >
                {texts.ui_module_management[language.current]}
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
                ariaLabel={texts.ui_aria_nav_add_set[language.current]}
                disabled={activeCourse ? false : true}
              >
                {texts.ui_assignment_set[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="openCourse"
                onClick={() => navigate("/SetBrowse")}
                ariaLabel={texts.ui_aria_nav_browse_sets[language.current]}
                disabled={activeCourse ? false : true}
              >
                {texts.ui_assignment_sets[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="export"
                onClick={() => navigate("/exportProject")}
                ariaLabel={texts.ui_aria_nav_export_project[language.current]}
                disabled={activeCourse ? false : true}
              >
                {texts.ui_export_project[language.current]}
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
                ariaLabel={texts.ui_delete[language.current]}
              >
                {texts.ui_settings[language.current]}
              </ButtonComp>
            </Grid>
          </Grid>
          <div className="emptySpace3" />
        </Box>
      </div>
    </>
  );
}
