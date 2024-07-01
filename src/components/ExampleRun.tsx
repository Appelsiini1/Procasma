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
import { spacingSX } from "../constantsUI";
import { language } from "../globalsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";
import SwitchComp from "./SwitchComp";
import { HandleAssignmentFn } from "../helpers/assignmentHelpers";
import { ExampleRunType } from "../types";
import { splitStringToArray, arrayToString } from "../helpers/converters";

interface ExampleRunProps {
  exRunID: string;
  exampleRun: ExampleRunType;
  handleAssignment: HandleAssignmentFn;
  pathInAssignment: string;
}

export default function ExampleRun({
  exRunID,
  exampleRun,
  handleAssignment,
  pathInAssignment,
}: ExampleRunProps) {
  return (
    <Accordion sx={{ width: "100%" }}>
      <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
        <Avatar color="primary">{exRunID}</Avatar>
        <ListItemContent>
          <Typography level="title-md">
            {texts.ex_run[language.current] + " " + exRunID}
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
              {texts.ex_input[language.current]}
            </Typography>
            <HelpText text={texts.help_inputs[language.current]} />
          </Stack>
          <InputField
            fieldKey={exRunID + "eInputsInput"}
            isLarge
            defaultValue={arrayToString(exampleRun.inputs)}
            onChange={(value: string) =>
              handleAssignment(
                `${pathInAssignment}.inputs`,
                splitStringToArray(value),
                true
              )
            }
          />
          <div className="emptySpace1" />

          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={spacingSX}
          >
            <Typography level="h4">
              {texts.cmd_input[language.current]}
            </Typography>
            <HelpText text={texts.help_cmd_inputs[language.current]} />
          </Stack>
          <InputField
            fieldKey={exRunID + "eCMDInput"}
            defaultValue={arrayToString(exampleRun.cmdInputs)}
            onChange={(value: string) =>
              handleAssignment(
                `${pathInAssignment}.cmdInputs`,
                splitStringToArray(value),
                true
              )
            }
          />
          <div className="emptySpace1" />

          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={spacingSX}
          >
            <Typography level="h4">
              {texts.ui_gen_ex_checkbox[language.current]}
            </Typography>
            <HelpText text={texts.help_gen_ex_checkbox[language.current]} />
            <Box sx={{ width: "2rem" }} />
            <SwitchComp
              checked={exampleRun.generate}
              setChecked={(value: boolean) =>
                handleAssignment(`${pathInAssignment}.generate`, value)
              }
            />
          </Stack>

          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={spacingSX}
          >
            <Typography level="h4">
              {texts.ex_output[language.current]}
            </Typography>
            <HelpText text={texts.help_ex_output[language.current]} />
          </Stack>
          <InputField
            fieldKey={exRunID + "eOutputInput"}
            isLarge
            disabled={exampleRun.generate}
            defaultValue={exampleRun.output}
            onChange={(value: string) =>
              handleAssignment(`${pathInAssignment}.output`, value, true)
            }
          />
          <div className="emptySpace1" />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
