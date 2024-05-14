import { KeyboardArrowDown } from "@mui/icons-material";
import Select, { selectClasses } from "@mui/joy/Select";
import React from "react";
import Option from "@mui/joy/Option";

type ButtonProps = {
  options: Array<object>;
  labelKey: string;
  placeholder: string;
  name: string;
};

export default function Dropdown({
  options,
  labelKey,
  placeholder,
  name,
}: ButtonProps) {
  let formattedOptions: Array<React.JSX.Element> = [];
  for (let index = 0; index < options.length; index++) {
    const element: any = options[index];
    formattedOptions.push(
      <Option key={element[labelKey]} value={index.toString()}>
        {" "}
        {element[labelKey]}
      </Option>
    );
  }

  return (
    <Select
      name={name}
      placeholder={placeholder}
      indicator={<KeyboardArrowDown />}
      sx={{
        minWidth: "10em",
        maxWidth: "30em",
        [`& .${selectClasses.indicator}`]: {
          transition: "0.2s",
          [`&.${selectClasses.expanded}`]: {
            transform: "rotate(-180deg)",
          },
        },
      }}
    >
      {formattedOptions}
    </Select>
  );
}
