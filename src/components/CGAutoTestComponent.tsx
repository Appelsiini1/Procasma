import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/joy";
import { parseUICode } from "../rendererHelpers/translation";
import InputField from "./InputField";

export default function CGAutoTestComponent({
  setupPhase,
  testPhase,
  changeSetup,
  changeTests,
}: {
  setupPhase: string;
  testPhase: string;
  changeSetup: React.Dispatch<React.SetStateAction<string>>;
  changeTests: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <AccordionGroup size="sm" sx={{ width: "90%", marginRight: "2rem" }}>
      <Accordion sx={{ backgroundColor: "#FaFaFa" }}>
        <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
          <Typography level="h4">{parseUICode("cg_setup")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ paddingLeft: "0.5em" }}>
            <InputField
              fieldKey="cgConfigSetupInput"
              onChange={(value) => changeSetup(String(value))}
              isLarge
              defaultValue={setupPhase}
            ></InputField>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ backgroundColor: "#FaFaFa" }}>
        <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
          <Typography level="h4">{parseUICode("cg_tests")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ paddingLeft: "0.5em" }}>
            <InputField
              fieldKey="cgConfigSetupInput"
              onChange={(value) => changeTests(String(value))}
              isLarge
              defaultValue={testPhase}
            ></InputField>
          </Box>
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  );
}
