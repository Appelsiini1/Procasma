import { useNavigate } from "react-router";
import { Box, List, Stack, Typography } from "@mui/joy";
import { useContext, useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";
import {
  CourseData,
  SetAlgoAssignmentData,
  SetAssignmentWithCheck,
  SetData,
  SetWithCheck,
} from "../types";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import {
  generateChecklist,
  setSelectedViaChecked,
  wrapWithCheck,
  wrapWithCheckAndVariation,
} from "../rendererHelpers/browseHelpers";
import { ActiveObjectContext, UIContext } from "../components/Context";
import {
  calculateBadnesses,
  exportManySetsToDisk,
  importSetData,
} from "../rendererHelpers/setHelpers";

export default function SetBrowse() {
  const {
    activePath,
    activeSet,
    handleActiveSet,
    activeCourse,
  }: {
    activePath: string;
    activeSet: SetData;
    handleActiveSet: (value: SetData) => void;
    activeCourse: CourseData;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const [allSets, setAllSets] = useState<Array<SetWithCheck>>([]);
  const [selectedSets, setSelectedSets] = useState<Array<SetData>>([]);
  const [navigateToSet, setNavigateToSet] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const navigate = useNavigate();
  let sets: Array<React.JSX.Element> = null;

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
      setAllSets(setsWithCheck);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  useEffect(() => {
    if (!activePath) {
      return;
    }
    refreshSets();
    handleHeaderPageName("ui_set_browser");
    handleActiveSet(null);
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
    const numChecked = setSelectedViaChecked(allSets, setSelectedSets);

    setNumSelected(numChecked);
  }, [allSets]);

  sets = generateChecklist(allSets, setAllSets, handleOpenSet, false, true);

  async function handleOpenSet() {
    try {
      const setsResult = await handleIPCResult(() =>
        window.api.getSetsFS(activePath, selectedSets[0].id)
      );

      const assignments: SetAlgoAssignmentData[] = await handleIPCResult(() =>
        window.api.getTruncatedAssignmentsFS(activePath)
      );

      const assignmentsWithCheck: SetAssignmentWithCheck[] =
        wrapWithCheckAndVariation(assignments);

      // calculate badness values for each variation based on "usedIn"
      const readyAssignments = calculateBadnesses(assignmentsWithCheck);

      handleActiveSet(importSetData(setsResult[0], readyAssignments));

      setNavigateToSet(true);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  // Navigates to an assignment set page by listening to the active set.
  useEffect(() => {
    if (activeSet && navigateToSet) {
      setNavigateToSet(false);
      navigate("/setCreator");
    }
  }, [activeSet, navigateToSet]);

  // Exports set to disk
  async function handleExportSet() {
    let snackbarSeverity = "error";
    let snackbarText = "ui_no_set_selected";
    try {
      if (selectedSets.length > 0) {
        handleSnackbar({ ["action"]: parseUICode("ui_export_status") });
        const result = await exportManySetsToDisk(
          // @ts-ignore
          selectedSets, // TypeScript reports an incompatible type even though they are compatible
          activeCourse
        );
        snackbarText = result.snackbarText;
        snackbarSeverity = result.snackbarSeverity;
      }
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  return (
    <>
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
          onClick={() => handleOpenSet()}
          ariaLabel={parseUICode("ui_aria_modify_sets")}
          disabled={numSelected === 1 ? false : true}
        >
          {parseUICode("ui_modify")}
        </ButtonComp>
        <ButtonComp
          confirmationModal={true}
          modalText={`${parseUICode("ui_delete")} 
            ${numSelected}`}
          buttonType="delete"
          onClick={() => handleDeleteSelected()}
          ariaLabel={parseUICode("ui_aria_delete_sets")}
          disabled={numSelected > 0 ? false : true}
        >
          {`${parseUICode("ui_delete")} ${numSelected}`}
        </ButtonComp>
        <ButtonComp
          buttonType="normal"
          onClick={() => handleExportSet()}
          ariaLabel={parseUICode("ui_aria_export_sets")}
          disabled={numSelected > 0 ? false : true}
        >
          {parseUICode("ui_export")}
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
        <Typography level="h3">{parseUICode("ui_assignment_sets")}</Typography>

        <Box
          height="30rem"
          width="100%"
          sx={{
            border: "2px solid lightgrey",
            borderRadius: "0.5rem",
          }}
          overflow={"auto"}
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
    </>
  );
}
