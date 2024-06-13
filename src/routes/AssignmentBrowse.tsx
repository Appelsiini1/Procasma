import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language, currentCourse, dividerColor } from "../constantsUI";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  Box,
  Checkbox,
  Grid,
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/joy";
import SelectedHeader from "../components/SelectedHeader";
import { useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";

// Get list of assignments via IPC later
const testAssignments = [
  {
    assignmentID: "a1",
    title: "Tehtävä 1",
    module: "1",
    assignmentType: "assignment",
  },
  {
    assignmentID: "a2",
    title: "Tehtävä 2",
    module: "2",
    assignmentType: "assignment",
  },
];

// Get list of modules via IPC later
const testModules = [
  { moduleID: "1", name: "Viikko 1" },
  { moduleID: "2", name: "Viikko 2" },
];

const testTags = ["print", "try...except"];

export default function AssignmentBrowse() {
  const pageType = useLoaderData();
  const navigate = useNavigate();
  const [noSelected, setNoSelected] = useState(0);
  const [selectedList, setSelectedList] = useState<Array<String>>([]);
  const [selectedModules, setSelectedModules] = useState<Array<String>>([]);
  const [selectedTags, setSelectedTags] = useState<Array<String>>([]);
  let assignments: Array<React.JSX.Element> = null;
  let selectFragment: React.JSX.Element = null;
  let pageButtons: React.JSX.Element = null;
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  function handleSelectedListChange(
    assignmentID: string,
    state: boolean,
    setBoxState: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    if (pageType === "browse") {
      if (state) {
        setSelectedList(selectedList.filter((value) => value !== assignmentID));
        setNoSelected(selectedList.length - 1);
        setBoxState(!state);
      } else {
        setSelectedList([...selectedList, assignmentID]);
        console.log(selectedList.length);
        setNoSelected(selectedList.length + 1);
        setBoxState(!state);
      }
    } else {
    }
  }

  function handleSelectedModules(
    moduleID: string,
    state: boolean,
    setBoxState: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    if (state) {
      setSelectedModules(selectedModules.filter((value) => value !== moduleID));
      setBoxState(!state);
    } else {
      setSelectedModules([...selectedModules, moduleID]);
      setBoxState(!state);
    }
  }

  function handleSelectedTags(
    tag: string,
    state: boolean,
    setBoxState: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    if (state) {
      setSelectedTags(selectedTags.filter((value) => value !== tag));
      setBoxState(!state);
    } else {
      setSelectedTags([...selectedTags, tag]);
      setBoxState(!state);
    }
  }

  assignments = testAssignments.map((value) => {
    const [boxState, setBoxState] = useState(false);
    return (
      <ListItem
        key={value.assignmentID}
        startAction={
          <Checkbox
            checked={boxState}
            onChange={() =>
              handleSelectedListChange(
                value.assignmentID,
                boxState,
                setBoxState
              )
            }
          ></Checkbox>
        }
      >
        <ListItemButton
          selected={boxState}
          onClick={() =>
            handleSelectedListChange(value.assignmentID, boxState, setBoxState)
          }
        >
          {value.title}
        </ListItemButton>
      </ListItem>
    );
  });

  modules = testModules.map((value) => {
    const [boxState, setBoxState] = useState(false);
    return (
      <ListItem
        key={value.moduleID}
        startAction={
          <Checkbox
            checked={boxState}
            onChange={() =>
              handleSelectedModules(value.moduleID, boxState, setBoxState)
            }
          ></Checkbox>
        }
      >
        <ListItemButton
          selected={boxState}
          onClick={() =>
            handleSelectedModules(value.moduleID, boxState, setBoxState)
          }
        >
          {value.name}
        </ListItemButton>
      </ListItem>
    );
  });

  tags = testTags.map((value) => {
    const [boxState, setBoxState] = useState(false);
    return (
      <ListItem
        key={value}
        startAction={
          <Checkbox
            checked={boxState}
            onChange={() => handleSelectedTags(value, boxState, setBoxState)}
          ></Checkbox>
        }
      >
        <ListItemButton
          selected={boxState}
          onClick={() => handleSelectedTags(value, boxState, setBoxState)}
        >
          {value}
        </ListItemButton>
      </ListItem>
    );
  });

  if (pageType === "browse") {
    selectFragment = (
      <>
        <div className="emptySpace1" />
        <SearchBar
          autoFillOptions={testAssignments}
          optionLabel={"title"}
          searchFunction={() => console.log("search")}
        ></SearchBar>

        <div className="emptySpace1" />
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
          <ButtonComp
            buttonType="normal"
            onClick={() => console.log(selectedList)}
          >
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
                <List>
                  <ListItem nested>
                    <ListSubheader>
                      {texts.ui_modules[language.current]}
                    </ListSubheader>
                    <List>{modules}</List>
                  </ListItem>
                  <ListItem nested>
                    <ListSubheader>
                      {texts.ui_tags[language.current]}
                    </ListSubheader>
                    <List>{tags}</List>
                  </ListItem>
                </List>
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
