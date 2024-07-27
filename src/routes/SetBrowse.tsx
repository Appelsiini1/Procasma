import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language } from "../globalsUI";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/joy";
import SelectedHeader from "../components/SelectedHeader";
import { useState } from "react";
import ButtonComp from "../components/ButtonComp";
import SearchBar from "../components/SearchBar";
import { CourseData } from "../types";
import { parseUICode } from "../rendererHelpers/translation";

// Get list of modules via IPC later
const testSets = [
  { moduleID: "1", name: "Viikko 1" },
  { moduleID: "2", name: "Viikko 2" },
];

const testTags = ["print", "try...except"];

export default function SetBrowse({
  activeCourse,
  activePath,
}: {
  activeCourse: CourseData;
  activePath: string;
}) {
  const navigate = useNavigate();
  const [noSelected, setNoSelected] = useState(0);
  const [selectedModules, setSelectedModules] = useState<Array<string>>([]);
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);
  let modules: Array<React.JSX.Element> = null;
  let tags: Array<React.JSX.Element> = null;

  function handleSelectedModules(
    moduleID: string,
    state: boolean,
    setBoxState: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    if (state) {
      setSelectedModules(selectedModules.filter((value) => value !== moduleID));
      setNoSelected(selectedModules.length - 1);
      setBoxState(!state);
    } else {
      setSelectedModules([...selectedModules, moduleID]);
      setNoSelected(selectedModules.length + 1);
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

  //TODO: abstract this mapping and the handle function
  modules = testSets.map((value) => {
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
          autoFillOptions={testSets}
          optionLabel={"name"}
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
            <List>{modules}</List>
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
