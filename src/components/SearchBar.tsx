import { language } from "../constantsUI";
import texts from "../../resource/texts.json";
import { Autocomplete, Stack, Typography } from "@mui/joy";
import ButtonComp from "./ButtonComp";

type OptionType = {
  [key: string]: any;
};

/**
 * autoFillOptions should be an array of objects, each with
 * a "label" attribute. the "label" key can be overridden with the
 * "optionLabel" attribute.
 */
export default function SearchBar({
  title = texts.ui_search[language.current],
  autoFillOptions,
  optionLabel,
  searchFunction,
}: {
  title?: string;
  autoFillOptions: Array<object>;
  optionLabel: string;
  searchFunction: () => void;
}) {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        sx={{ width: "100%" }}
      >
        <Typography level="h4">{title}</Typography>
        <div style={{ width: "100%" }}>
          <Autocomplete
            key="caSearch"
            placeholder="..."
            options={autoFillOptions}
            getOptionLabel={(option: OptionType) => option[optionLabel]}
          />
        </div>
        <ButtonComp buttonType="normal" onClick={searchFunction}>
          {texts.ui_search_button[language.current]}
        </ButtonComp>
      </Stack>
    </>
  );
}
