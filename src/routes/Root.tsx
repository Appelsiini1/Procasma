import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language, dividerColor } from "../constantsUI";
import LogoText from "../../resource/LogoText.png";
import { Box, Divider, Grid, Typography } from "@mui/joy";
import ButtonComp from "../components/ButtonComp";
import { useNavigate } from "react-router-dom";
import FadeInImage from "../components/FadeInImage";
import { CourseData } from "../types";

const dividerSX = { padding: ".1rem", margin: "2rem", bgcolor: dividerColor };

export default function Root({
  activeCourse,
  handleActiveCourse,
  handleActivePath,
}: {
  activeCourse: CourseData;
  handleActiveCourse: React.Dispatch<React.SetStateAction<CourseData>>;
  handleActivePath: React.Dispatch<React.SetStateAction<string>>;
}) {
  const pageName = texts.ui_main[language.current];
  let noInIndex = NaN; //make dynamic later
  const navigate = useNavigate();

  async function handleSelectCourseFolder() {
    try {
      const coursePath: string = await window.api.selectDir();

      const course = await window.api.readCourse("metadata.json", coursePath);

      if (course) {
        handleActiveCourse(course);
        handleActivePath(coursePath);

        console.log("Active course loaded...");
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
            noInIndex.toString()}
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
                  navigate("createCourse");
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
                    navigate("manageCourse");
                  } else {
                    console.log("Select a course first");
                  }
                }}
                ariaLabel={texts.ui_aria_nav_manage_course[language.current]}
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
                  navigate("inputCodeAssignment");
                }}
                ariaLabel={texts.ui_aria_nav_add_assignment[language.current]}
              >
                {texts.ui_assignment[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => {
                  navigate("AssignmentBrowse");
                }}
                ariaLabel={
                  texts.ui_aria_nav_browse_assignments[language.current]
                }
              >
                {texts.ui_assignment_management[language.current]}
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
                  navigate("newModule");
                }}
                ariaLabel={texts.ui_aria_nav_add_module[language.current]}
              >
                {texts.ui_module[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => {
                  navigate("moduleBrowse");
                }}
                ariaLabel={texts.ui_aria_nav_browse_modules[language.current]}
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
                  navigate("setCreator");
                }}
                ariaLabel={texts.ui_aria_nav_add_set[language.current]}
              >
                {texts.ui_assignment_set[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="openCourse"
                onClick={() => navigate("SetBrowse")}
                ariaLabel={texts.ui_aria_nav_browse_sets[language.current]}
              >
                {texts.ui_assignment_sets[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="largeAdd"
                onClick={() => {
                  navigate("inputCodeProjectWork");
                }}
                ariaLabel={texts.ui_aria_nav_add_project[language.current]}
              >
                {texts.ui_add_project_work[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="export"
                onClick={() => navigate("exportProject")}
                ariaLabel={texts.ui_aria_nav_export_project[language.current]}
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
                onClick={() => navigate("settings")}
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
