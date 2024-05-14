import { Typography } from "@mui/joy";
import { ui_selected as _selected_text } from "../../resource/texts.json";

export default function SelectedHeader({
  selected,
  language,
}: {
  selected: number;
  language: string;
}) {
  const ui_selected: any = _selected_text;
  const text: string = ui_selected[language];
  return (
    <Typography level="h2">
      ({selected}) {text}
    </Typography>
  );
}
