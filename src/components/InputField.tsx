import { Input, Textarea } from "@mui/joy";
import React from "react";

type ButtonProps = {
  isLarge?: boolean;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  fieldKey: string;
  onChange: (value: string | number) => void;
};

export default function InputField({
  isLarge = false,
  placeholder = "...",
  defaultValue = null,
  disabled = false,
  fieldKey,
  onChange,
}: ButtonProps) {
  let component: React.JSX.Element = null;

  const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (isLarge) {
    component = (
      <Textarea
        sx={{ maxWidth: "100%", minWidth: "10em" }}
        minRows={5}
        maxRows={20}
        placeholder={placeholder}
        key={fieldKey}
        disabled={disabled}
        defaultValue={defaultValue}
        onChange={handleChangeTextArea}
      />
    );
  } else {
    component = (
      <Input
        sx={{ maxWidth: "100%", minWidth: "10em" }}
        placeholder={placeholder}
        defaultValue={defaultValue}
        key={fieldKey}
        disabled={disabled}
        onChange={handleChange}
      />
    );
  }
  return component;
}
