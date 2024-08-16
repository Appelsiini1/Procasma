import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Typography,
} from "@mui/joy";
import packages from "../../resource/licenses.json";
import { parseUICode } from "../rendererHelpers/translation";

export default function LicensesPage() {
  function mapLicenses() {
    let components = [];
    let index = 1;
    for (const packg of packages) {
      let title = parseUICode("ui_group") + " " + index;
      components.push(
        <Accordion key={index} sx={{ marginBottom: "0.25em" }}>
          <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
            <Typography level="h4">{title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{parseUICode("ui_licenses_group")}</Typography>
            <ul>
              {packg["dependencies"].map((value, listIndex) => {
                return (
                  <li
                    key={"dep-" + index.toString() + "-" + listIndex.toString()}
                  >
                    {value}
                  </li>
                );
              })}
            </ul>
            <Typography>{parseUICode("ui_license_text")}</Typography>
            <pre style={{ whiteSpace: "pre-wrap" }}>{packg["content"]}</pre>
          </AccordionDetails>
        </Accordion>
      );
      index += 1;
    }
    return components;
  }
  return (
    <div>
      <Typography level="h1">{parseUICode("ui_licenses")}</Typography>
      <Typography sx={{ marginTop: "1em" }}>
        {parseUICode("ui_licenses_text")}
      </Typography>
      <AccordionGroup
        sx={{ maxWidth: "80%", backgroundColor: "#FaFaFa", marginTop: "1em" }}
      >
        {mapLicenses()}
      </AccordionGroup>
    </div>
  );
}
