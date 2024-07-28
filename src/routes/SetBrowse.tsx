import PageHeaderBar from "../components/PageHeaderBar";
import { useNavigate } from "react-router-dom";
import { Box, List, Stack, Typography } from "@mui/joy";
import { useContext, useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";
import { CourseData, SetData } from "../types";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import {
  generateChecklist,
  WithCheckWrapper,
  wrapWithCheck,
} from "../rendererHelpers/browseHelpers";
import { SnackbarContext } from "../components/Context";

export interface SetWithCheck extends WithCheckWrapper {
  value: SetData;
}

export default function SetBrowse({
  activeCourse,
  activePath,
}: {
  activeCourse: CourseData;
  activePath: string;
}) {
  const navigate = useNavigate();
  const [courseSets, setCourseSets] = useState<Array<SetWithCheck>>([]);
  const [noSelected, setNoSelected] = useState(0);
  const [selectedModules, setSelectedModules] = useState<Array<string>>([]);
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);
  let sets: Array<React.JSX.Element> = null;
  //let tags: Array<React.JSX.Element> = null;
  const { handleSnackbar } = useContext(SnackbarContext);

  async function getSets() {
    try {
      if (!activePath) {
        return;
      }

      const setsResult = await handleIPCResult(() =>
        window.api.getSetsFS(activePath)
      );

      const setsWithCheck: SetWithCheck[] = wrapWithCheck(setsResult);

      // update sets
      setCourseSets(setsWithCheck);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  useEffect(() => {
    if (!activePath) {
      return;
    }
    getSets();
  }, []);

  sets = generateChecklist(courseSets, setCourseSets);

  return (
    <>
      <PageHeaderBar
        pageName={parseUICode("ui_set_browser")}
        courseID={activeCourse?.id}
        courseTitle={activeCourse?.title}
      />
      <div className="content">
        <div className="emptySpace1" />
        <SearchBar
          autoFillOptions={[]}
          optionLabel={"name"}
          searchFunction={() => console.log("search")}
        ></SearchBar>

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
            ariaLabel={parseUICode("ui_aria_export_sets")}
          >
            {parseUICode("ui_export")}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={null}
            ariaLabel={parseUICode("ui_aria_delete_sets")}
          >
            {parseUICode("ui_delete")}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={null}
            ariaLabel={parseUICode("ui_aria_modify_sets")}
          >
            {parseUICode("ui_modify")}
          </ButtonComp>
        </Stack>

        <div className="emptySpace2" />

        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Typography level="h3">
            {parseUICode("ui_assignment_sets")}
          </Typography>

          <Box
            height="30rem"
            width="100%"
            sx={{
              border: "2px solid lightgrey",
              borderRadius: "0.5rem",
            }}
          >
            <List>{sets}</List>
          </Box>
        </Stack>

        <div className="emptySpace1" />
        <ButtonComp
          buttonType="normal"
          onClick={() => navigate(-1)}
          ariaLabel={parseUICode("ui_aria_cancel")}
        >
          {parseUICode("ui_close")}
        </ButtonComp>
      </div>
    </>
  );
}
