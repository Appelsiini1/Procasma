import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Avatar,
  Box,
  ListItemContent,
  Stack,
  Typography,
} from "@mui/joy";
import texts from "../../resource/texts.json";
import { language, currentCourse, spacingSX } from "../constantsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";
import ButtonComp from "./ButtonComp";
import { useState } from "react";
import ExampleRun from "./ExampleRun";
import FileList from "./FileList";
import { dummyFileRows } from "../testData";

type ComponentProps = {
  levelID: string;
};

export default function LevelComponent({ levelID }: ComponentProps) {
  const [exampleAccordion, setExampleAccordion] =
    useState<Array<React.JSX.Element>>(null);

  function addExampleRun() {
    if (!exampleAccordion) {
      setExampleAccordion([<ExampleRun runID="1" key="1" />]);
    } else {
      // function to get next available levelID
      setExampleAccordion([
        ...exampleAccordion,
        <ExampleRun runID="2" key="2" />,
      ]);
    }
  }
  return (
    <Accordion>
      <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
        <Avatar color="primary">{levelID}</Avatar>
        <ListItemContent>
          <Typography level="title-md">
            {texts.ui_level[language.current] + " " + levelID}
          </Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ marginLeft: "4rem", marginTop: "1rem" }}>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={spacingSX}
          >
            <Typography level="h4">
              {texts.ui_level_title[language.current]}
            </Typography>
            <HelpText text={texts.help_inst[language.current]} />
          </Stack>
          <InputField fieldKey={levelID + "vLevelTitleInput"} />

          <div className="emptySpace1" />
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={spacingSX}
          >
            <Typography level="h4">
              {texts.ui_inst[language.current]}
            </Typography>
            <HelpText text={texts.help_inst[language.current]} />
          </Stack>
          <InputField fieldKey={levelID + "vInstInput"} isLarge />

          <div className="emptySpace1" />
          <ButtonComp buttonType="normalAlt" onClick={null}>
            {texts.ui_cg_config[language.current]}
          </ButtonComp>

          <div className="emptySpace1" />
          <Typography level="h4" sx={spacingSX}>
            {texts.ui_files[language.current]}
          </Typography>
          <ButtonComp
            buttonType="normal"
            onClick={() => console.log("addFiles()")}
          >
            {texts.ui_import_files[language.current]}
          </ButtonComp>

          <div className="emptySpace1" />
          <FileList rows={dummyFileRows}></FileList>

          <div className="emptySpace1" />
          <Typography level="h4" sx={spacingSX}>
            {texts.ui_ex_runs[language.current]}
          </Typography>
          <ButtonComp buttonType="normal" onClick={() => addExampleRun()}>
            {texts.ui_add_ex_run[language.current]}
          </ButtonComp>

          <div className="emptySpace2" />
          <AccordionGroup size="lg" sx={{ width: "100%", marginRight: "2rem" }}>
            {exampleAccordion}
          </AccordionGroup>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
