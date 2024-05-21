import { Typography } from "@mui/joy";
import { ui_selected} from "../../resource/texts.json";

export default function SelectedHeader({
  selected,
  language,
}: {
  selected: number;
  language: keyof typeof ui_selected;
}) {
  return (
    <Typography level="h2">
      ({selected}) {ui_selected[language]}
    </Typography>
  );
}
