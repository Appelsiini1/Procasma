import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  ListItemContent,
  Stack,
  Typography,
} from "@mui/joy";
import { spacingSX } from "../constantsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";
import ButtonComp from "./ButtonComp";
import FileList from "./FileList";
import { ExampleRunType, Variation } from "../types";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import ExampleRunsGroup from "./ExampleRunsGroup";
import { parseUICode } from "../rendererHelpers/translation";

type ComponentProps = {
  varID: string;
  variation: Variation;
  handleAssignment: HandleAssignmentFn;
  pathInAssignment: string;
};

export default function LevelComponent({
  varID,
  variation,
  handleAssignment,
  pathInAssignment,
}: ComponentProps) {
  const exampleRuns: { [key: string]: ExampleRunType } = variation.exampleRuns;

  return (
    <Accordion>
      <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
        <Avatar color="primary">{varID}</Avatar>
        <ListItemContent>
          <Typography level="title-md">
            {parseUICode("ui_level") + " " + varID}
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
            <Typography level="h4">{parseUICode("ui_level_title")}</Typography>
            <HelpText text={parseUICode("help_inst")} />
          </Stack>

          <div className="emptySpace1" />
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={spacingSX}
          >
            <Typography level="h4">{parseUICode("ui_inst")}</Typography>
            <HelpText text={parseUICode("help_inst")} />
          </Stack>
          <InputField
            fieldKey={varID + "vInstInput"}
            isLarge
            defaultValue={variation.instructions}
            onChange={(value: string) =>
              handleAssignment(`${pathInAssignment}.instructions`, value, true)
            }
          />

          <div className="emptySpace1" />
          <ButtonComp
            buttonType="normalAlt"
            onClick={null}
            ariaLabel={parseUICode("ui_aria_cg_config")}
          >
            {parseUICode("ui_cg_config")}
          </ButtonComp>

          <div className="emptySpace1" />
          <Typography level="h4" sx={spacingSX}>
            {parseUICode("ui_files")}
          </Typography>

          <FileList
            files={variation.files}
            handleAssignment={handleAssignment}
            pathInAssignment={`${pathInAssignment}.files`}
          ></FileList>

          <div className="emptySpace1" />
          <Typography level="h4" sx={spacingSX}>
            {parseUICode("ui_ex_runs")}
          </Typography>

          <ExampleRunsGroup
            exampleRuns={exampleRuns}
            pathInAssignment={pathInAssignment}
            handleAssignment={handleAssignment}
          ></ExampleRunsGroup>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
