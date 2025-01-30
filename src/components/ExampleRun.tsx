import { Box, Stack, Typography } from "@mui/joy";
import { spacingSX } from "../constantsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";
import SwitchComp from "./SwitchComp";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import { ExampleRunType } from "../types";
import {
  splitStringToArray,
  arrayToString,
} from "../rendererHelpers/converters";
import { parseUICode } from "../rendererHelpers/translation";

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
    <>
      <Typography level="h4">
        {parseUICode("ex_run") + " " + exRunID}
      </Typography>

      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        sx={{ ...spacingSX, marginTop: "1rem" }}
      >
        <Typography level="h4">{parseUICode("ex_input")}</Typography>
        <HelpText text={parseUICode("help_inputs")} />
      </Stack>
      <InputField
        fieldKey={exRunID + "eInputsInput"}
        isLarge
        defaultValue={exampleRun.inputs.join("\n")}
        onChange={(value: string) =>
          handleAssignment(
            `${pathInAssignment}.inputs`,
            splitStringToArray(value, "\n"),
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
        <Typography level="h4">{parseUICode("cmd_input")}</Typography>
        <HelpText text={parseUICode("help_cmd_inputs")} />
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
        <Typography level="h4">{parseUICode("ui_gen_ex_checkbox")}</Typography>
        <HelpText text={parseUICode("help_gen_ex_checkbox")} />
        <Box sx={{ width: "2rem" }} />
        <SwitchComp
          checked={exampleRun.generate}
          setChecked={(value: boolean) =>
            handleAssignment(`${pathInAssignment}.generate`, value)
          }
          disabled={true}
        />
      </Stack>

      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        sx={spacingSX}
      >
        <Typography level="h4">{parseUICode("ex_output")}</Typography>
        <HelpText text={parseUICode("help_ex_output")} />
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
    </>
  );
}
