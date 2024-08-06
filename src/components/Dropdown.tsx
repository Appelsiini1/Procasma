import { KeyboardArrowDown } from "@mui/icons-material";
import Select, { selectClasses } from "@mui/joy/Select";
import React from "react";
import Option from "@mui/joy/Option";

type ButtonProps = {
  options: Array<object>;
  labelKey: string;
  placeholder?: string;
  defaultValue?: string;
  name: string;
  disabled?: boolean;
  /*onChange?: (
    event: React.SyntheticEvent | null,
    newValue: string | null
  ) => void;*/
  onChange: (value: string | number) => void;
};

export default function Dropdown({
  options,
  labelKey,
  placeholder = "",
  defaultValue,
  name,
  disabled,
  onChange,
}: ButtonProps) {
  const formattedOptions: Array<React.JSX.Element> = [];
  for (let index = 0; index < options.length; index++) {
    const element: any = options[index];
    formattedOptions.push(
      <Option key={index.toString()} value={element[labelKey]}>
        {" "}
        {element[labelKey]}
      </Option>
    );
  }

  const handleChange = (
    event: React.SyntheticEvent | null,
    newValue: string | null
  ) => {
    onChange(newValue);
  };

  return (
    <Select
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      indicator={<KeyboardArrowDown />}
      onChange={handleChange}
      disabled={disabled}
      sx={{
        minWidth: "10em",
        maxWidth: "100%",
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
