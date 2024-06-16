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
import texts from "../../resource/texts.json";
import { language, currentCourse, spacingSX } from "../constantsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";
import ButtonComp from "./ButtonComp";
import FileList from "./FileList";
import { ExampleRunType, Variation } from "../types";
import { HandleAssignmentFn } from "../helpers/assignmentHelpers";
import ExampleRunsGroup from "./ExampleRunsGroup";

type ComponentProps = {
  varID: string;
  variation: Variation;
  handleAssignment: HandleAssignmentFn;
  pathInAssignment: string;
};

export default function VariationComponent({
  varID,
  variation,
  handleAssignment,
  pathInAssignment,
}: ComponentProps) {
  const exampleRuns: { [key: string]: ExampleRunType } = variation.exampleRuns;

  return (
    <Accordion sx={{ backgroundColor: "#FaFaFa" }}>
      <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
        <Avatar color="primary">{varID}</Avatar>
        <ListItemContent>
          <Typography level="title-md">
            {texts.ui_variation[language.current] + " " + varID}
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
              {texts.ui_inst[language.current]}
            </Typography>
            <HelpText text={texts.help_inst[language.current]} />
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
            ariaLabel={texts.ui_aria_cg_config[language.current]}
          >
            {texts.ui_cg_config[language.current]}
          </ButtonComp>

          <div className="emptySpace2" />
          <Typography level="h4" sx={spacingSX}>
            {texts.ui_files[language.current]}
          </Typography>

          <FileList
            files={variation.files}
            handleAssignment={handleAssignment}
            pathInAssignment={`${pathInAssignment}.files`}
          ></FileList>

          <div className="emptySpace2" />
          <Typography level="h4" sx={spacingSX}>
            {texts.ui_ex_runs[language.current]}
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
