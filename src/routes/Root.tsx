import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language, dividerColor } from "../constantsUI";
import LogoText from "../../resource/LogoText.png";
import { Box, Divider, Grid, Typography } from "@mui/joy";
import ButtonComp from "../components/ButtonComp";
import { useNavigate } from "react-router-dom";

const dividerSX = { padding: ".1rem", margin: "2rem", bgcolor: dividerColor };

export default function Root() {
  const pageName = texts.ui_main[language.current];
  let noInIndex = NaN; //make dynamic later
  const navigate = useNavigate();
  return (
    <>
      <PageHeaderBar pageName={pageName} />
      <div className="menuContent">
        <img src={LogoText} className="textLogo" />
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
                  console.log("Add Course");
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
                onClick={() => console.log("Open Course")}
                ariaLabel={texts.ui_aria_nav_open_course[language.current]}
              >
                {texts.course_open[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="settings"
                onClick={() => {
                  console.log("Manage Course");
                  navigate("manageCourse");
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
                  console.log("Add Assignment");
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
                  console.log("Manage Assignments");
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
                  console.log("Add Module");
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
                  console.log("Manage Modules");
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
                  console.log("Add assignment set");
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
                  console.log("Add project work");
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
                onClick={() => console.log("Export project work")}
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
