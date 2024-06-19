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

// Get list of modules via IPC later
const testModules = [
  { moduleID: "1", name: "Viikko 1" },
  { moduleID: "2", name: "Viikko 2" },
];

const testTags = ["print", "try...except"];

export default function AssignmentBrowse({
  activeCourse,
}: {
  activeCourse: CourseData;
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
