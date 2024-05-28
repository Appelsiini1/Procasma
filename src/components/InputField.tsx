import { Input, Textarea } from "@mui/joy";
import React from "react";

type ButtonProps = {
  isLarge?: boolean;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  fieldKey: string;
};

export default function InputField({
  isLarge = false,
  placeholder = "...",
  defaultValue = null,
  disabled = false,
  fieldKey,
}: ButtonProps) {
  let component: React.JSX.Element = null;
  if (isLarge) {
    component = (
      <Textarea
        sx={{ maxWidth: "40em", minWidth: "10em" }}
        minRows={5}
        maxRows={5}
        placeholder={placeholder}
        key={fieldKey}
        disabled={disabled}
      />
    );
  } else {
    component = (
      <Input
        sx={{ maxWidth: "30em", minWidth: "10em" }}
        placeholder={placeholder}
        defaultValue={defaultValue}
        key={fieldKey}
        disabled={disabled}
      />
    );
  }
  return component;
}
