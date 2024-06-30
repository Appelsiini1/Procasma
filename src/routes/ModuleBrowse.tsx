import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language } from "../constantsUI";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  Box,
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/joy";
import SelectedHeader from "../components/SelectedHeader";
import { useState } from "react";
import ButtonComp from "../components/ButtonComp";
import { CourseData } from "../types";
import { filterState, generateFilter } from "../helpers/browseHelpers";

export default function AssignmentBrowse({
  activeCourse,
}: {
  activeCourse: CourseData;
}) {
  const navigate = useNavigate();

  const [courseModules, setCourseModules] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentData>
  >([]);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const [uniqueTags, setUniqueTags] = useState<Array<filterState>>([]);
  const [uniqueModules, setUniqueModules] = useState<Array<filterState>>([]);
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  modules = generateFilter(uniqueModules, setUniqueModules);
  tags = generateFilter(uniqueTags, setUniqueTags);

  return (
    <>
      <PageHeaderBar
        pageName={texts.ui_module_browser[language.current]}
        courseID={activeCourse?.ID}
        courseTitle={activeCourse?.title}
      />
      <div className="content">
        <SelectedHeader selected={noSelected} />
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
            ariaLabel={texts.ui_remove_selected_modules[language.current]}
          >
            {texts.ui_remove_selected[language.current]}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => console.log(selectedModules)}
            ariaLabel={texts.ui_aria_show_edit[language.current]}
          >
            {texts.ui_show_edit[language.current]}
          </ButtonComp>
        </Stack>

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
                <List>{modules}</List>
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
                <List>{tags}</List>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <div className="emptySpace1" />
        <ButtonComp
          buttonType="normal"
          onClick={() => navigate(-1)}
          ariaLabel={texts.ui_aria_cancel[language.current]}
        >
          {texts.ui_cancel[language.current]}
        </ButtonComp>
      </div>
    </>
  );
}
