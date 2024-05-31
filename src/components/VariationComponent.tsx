import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  ListItemContent,
  Typography,
} from "@mui/joy";
import texts from "../../resource/texts.json";
import { language, currentCourse, dividerColor } from "../constantsUI";
import ModalAlertDelete from "./ModalAlertDelete";

export default function VariationComponent({
  varID,
  self,
}: {
  varID: string;
  self: any;
}) {
  console.log(self);
  console.log(self.prototype);
  return (
    <Accordion>
      <AccordionSummary>
        <Avatar color="primary">{varID}</Avatar>
        <ListItemContent>
          <Typography level="title-md">
            {texts.ui_variation[language.current] + " " + varID}
          </Typography>
        </ListItemContent>
      </AccordionSummary>
      <AccordionDetails>
        <ModalAlertDelete
          button="normal"
          deleteFunction={() => {
            self.prototype.deleteVariation(varID);
          }}
        />
      </AccordionDetails>
    </Accordion>
  );
}
