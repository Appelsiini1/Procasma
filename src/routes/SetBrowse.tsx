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
  setSelectedViaChecked,
  WithCheckWrapper,
  wrapWithCheck,
} from "../rendererHelpers/browseHelpers";
import { ActiveObjectContext, SnackbarContext } from "../components/Context";

export interface SetWithCheck extends WithCheckWrapper {
  value: SetData;
}

export default function SetBrowse() {
  const {
    activeCourse,
    activePath,
    activeSet,
    handleActiveSet,
  }: {
    activeCourse: CourseData;
    activePath: string;
    activeSet: SetData;
    handleActiveSet: (value: SetData) => void;
  } = useContext(ActiveObjectContext);
  const navigate = useNavigate();
  const [courseSets, setCourseSets] = useState<Array<SetWithCheck>>([]);
  const [selectedSets, setSelectedSets] = useState<Array<SetData>>([]);
  const [navigateToSet, setNavigateToSet] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  let sets: Array<React.JSX.Element> = null;
  //let tags: Array<React.JSX.Element> = null;
  const { handleSnackbar } = useContext(SnackbarContext);

  async function refreshSets() {
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
    refreshSets();
  }, []);

  async function handleDeleteSelected() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_delete_success";
    try {
      await handleIPCResult(() =>
        window.api.deleteSetsFS(
          activePath,
          selectedSets.map((set) => set.id)
        )
      );

      refreshSets(); // get the remaining sets
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  // Update the selected sets counter
  useEffect(() => {
    const numChecked = setSelectedViaChecked(courseSets, setSelectedSets);

    setNumSelected(numChecked);
  }, [courseSets]);

  sets = generateChecklist(courseSets, setCourseSets);

  async function handleOpenSet() {
    setNavigateToSet(true);
    handleActiveSet(selectedSets[0]);
  }

  useEffect(() => {
    if (activeSet && navigateToSet) {
      setNavigateToSet(false);
      navigate("/setCreator");
    }
  }, [activeSet, navigateToSet]);

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
            confirmationModal={true}
            modalText={`${parseUICode("ui_delete")} 
            ${numSelected}`}
            buttonType="normal"
            onClick={() => handleDeleteSelected()}
            ariaLabel={parseUICode("ui_aria_delete_sets")}
            disabled={numSelected > 0 ? false : true}
          >
            {`${parseUICode("ui_delete")} ${numSelected}`}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => handleOpenSet()}
            ariaLabel={parseUICode("ui_aria_modify_sets")}
            disabled={numSelected === 1 ? false : true}
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
