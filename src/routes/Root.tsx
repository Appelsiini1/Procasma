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
              >
                {texts.course_create[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="openCourse"
                onClick={() => console.log("Open Course")}
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
                onClick={() => console.log("Add assignment set")}
              >
                {texts.ui_assignment_set[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="openCourse"
                onClick={() => console.log("Open assignment set management")}
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
              >
                {texts.ui_add_project_work[language.current]}
              </ButtonComp>
            </Grid>
            <Grid>
              <ButtonComp
                buttonType="export"
                onClick={() => console.log("Export project work")}
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
                onClick={() => console.log("Settings")}
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
