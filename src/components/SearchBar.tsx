import { language } from "../constantsUI";
import texts from "../../resource/texts.json";
import { Autocomplete, Stack, Typography } from "@mui/joy";
import ButtonComp from "./ButtonComp";
import { useState } from "react";
import InputField from "./InputField";

type OptionType = {
  [key: string]: string;
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
  searchFunction: (value: string) => void;
}) {
  const [text, setText] = useState(null);

  function handleText(value: string) {
    setText(value);
    searchFunction(value);
  }

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
          <InputField
            fieldKey="caSearchBar"
            placeholder="..."
            onChange={(value: string) => handleText(value)}
          />
        </div>
        <ButtonComp
          buttonType="normal"
          onClick={() => searchFunction(text)}
          ariaLabel={texts.ui_aria_search[language.current]}
        >
          {texts.ui_search_button[language.current]}
        </ButtonComp>
      </Stack>
    </>
  );
}
