import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Typography,
} from "@mui/joy";
import { parseUICode } from "../rendererHelpers/translation";

export default function CGAutoTestComponent(atvConfig: any) {
  if (atvConfig === null) {
    return <></>;
  } else {
    const setupPhase = JSON.stringify(
      atvConfig["atvConfig"]["setup"]["steps"],
      null,
      2
    );
    const testPhase = JSON.stringify(
      atvConfig["atvConfig"]["test"]["steps"],
      null,
      2
    );

    return (
      <AccordionGroup size="sm" sx={{ width: "90%", marginRight: "2rem" }}>
        <Accordion sx={{ backgroundColor: "#FaFaFa" }}>
          <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
            <Typography level="h4">{parseUICode("cg_setup")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>
              <Typography sx={{ paddingLeft: "0.5em", lineHeight: "1.1" }}>
                {setupPhase}
              </Typography>
            </pre>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ backgroundColor: "#FaFaFa" }}>
          <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
            <Typography level="h4">{parseUICode("cg_tests")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>
              <Typography sx={{ paddingLeft: "0.5em", lineHeight: "1.1" }}>
                {testPhase}
              </Typography>
            </pre>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    );
  }
}
