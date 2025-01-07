import { IconButton, Input, Textarea } from "@mui/joy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import React, { useEffect, useState } from "react";
import log from "electron-log/renderer";

type ButtonProps = {
  isLarge?: boolean;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  fieldKey: string;
  type?: "password" | "text";
  onChange: (value: string | number) => void;
};

export default function InputField({
  isLarge = false,
  placeholder = "...",
  defaultValue = null,
  disabled = false,
  fieldKey,
  type = "text",
  onChange,
}: ButtonProps) {
  let component: React.JSX.Element = null;

  const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  const [fieldType, setFieldType] = useState<ButtonProps["type"]>(type);
  const [decorator, setDecorator] = useState<React.JSX.Element>(null);
  const [decoratorState, setDecoratorState] = useState<"visible" | "hidden">(
    "hidden"
  );

  function handlePasswordVisibilityChange() {
    if (decoratorState === "hidden") {
      setDecorator(<VisibilityOffIcon />);
      setFieldType("text");
      setDecoratorState("visible");
    } else {
      setDecorator(<VisibilityIcon />);
      setFieldType("password");
      setDecoratorState("hidden");
    }
  }

  useEffect(() => {
    if (type === "password") {
      setDecorator(<VisibilityIcon />);
    }
  }, []);

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
        type={fieldType}
        placeholder={placeholder}
        defaultValue={defaultValue}
        key={fieldKey}
        disabled={disabled}
        startDecorator={
          type === "password" ? (
            <IconButton
              onClick={() => handlePasswordVisibilityChange()}
              variant="plain"
            >
              {decorator}
            </IconButton>
          ) : null
        }
        onChange={handleChange}
      />
    );
  }
  return component;
}
