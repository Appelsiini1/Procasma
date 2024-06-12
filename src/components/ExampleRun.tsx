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
import { language, spacingSX } from "../constantsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";
import SwitchComp from "./SwitchComp";
import { useState } from "react";

export default function ExampleRun({ varID }: { varID: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <Accordion>
      <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
        <Avatar color="primary">{varID}</Avatar>
        <ListItemContent>
          <Typography level="title-md">
            {texts.ex_run[language.current] + " " + varID}
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
          <InputField fieldKey={varID + "eInputsInput"} isLarge />
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
          <InputField fieldKey={varID + "eCMDInput"} />
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
            <SwitchComp checked={checked} setChecked={setChecked} />
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
            fieldKey={varID + "eOutputInput"}
            isLarge
            disabled={checked}
          />
          <div className="emptySpace1" />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
