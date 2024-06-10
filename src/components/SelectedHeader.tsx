import { Typography } from "@mui/joy";
import { ui_selected } from "../../resource/texts.json";
import { language } from "../constantsUI";

export default function SelectedHeader({ selected }: { selected: number }) {
  return (
    <Typography level="h3">
      ({selected}) {ui_selected[language.current]}
    </Typography>
  );
}
