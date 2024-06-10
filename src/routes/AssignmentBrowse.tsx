import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language, currentCourse, dividerColor } from "../constantsUI";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Box, Grid, List, Stack, Typography } from "@mui/joy";
import SelectedHeader from "../components/SelectedHeader";
import { useState } from "react";
import ButtonComp from "../components/ButtonComp";

export default function AssignmentBrowse() {
  const pageType = useLoaderData();
  const navigate = useNavigate();
  const [noSelected, setNoSelected] = useState(0);
  const assignments: Array<React.JSX.Element> = [];
  const tags: Array<React.JSX.Element> = [];
  let selectFragment: React.JSX.Element = null;
  let pageButtons: React.JSX.Element = null;

  if (pageType === "browse") {
    selectFragment = (
      <>
        <SelectedHeader selected={noSelected} />
        <div className="emptySpace1" />
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <ButtonComp buttonType="normal" onClick={null}>
            {texts.ui_remove_selected[language.current]}
          </ButtonComp>
          <ButtonComp buttonType="normal" onClick={null}>
            {texts.ui_show_edit[language.current]}
          </ButtonComp>
        </Stack>
      </>
    );
    pageButtons = (
      <>
        <ButtonComp buttonType="normal" onClick={null}>
          {texts.ui_save[language.current]}
        </ButtonComp>
        <ButtonComp buttonType="normal" onClick={() => navigate(-1)}>
          {texts.ui_cancel[language.current]}
        </ButtonComp>
      </>
    );
  }
  return (
    <>
      <PageHeaderBar pageName={texts.ui_assignment_browser[language.current]} />
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
                  borderRadius: "1.5%",
                }}
              >
                Box thing
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
                  borderRadius: "1.5%",
                }}
              >
                <List>{tags}</List>
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
