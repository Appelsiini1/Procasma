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
import { language, currentCourse, dividerColor } from "../constantsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";

type ComponentProps = {
  varID: string;
};

export default function VariationComponent({ varID }: ComponentProps) {
  return (
    <Accordion>
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
          >
            <Typography level="h4">
              {texts.ui_inst[language.current]}
            </Typography>
            <HelpText text={texts.help_inst[language.current]} />
          </Stack>
          <div className="emptySpace1" />
          <InputField fieldKey={varID + "vInstInput"} isLarge />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
