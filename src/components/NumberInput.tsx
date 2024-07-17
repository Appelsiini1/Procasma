import { Input, Stack, IconButton } from "@mui/joy";
import React from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { buttonShadow } from "../constantsUI";
import { parseUICode } from "../rendererHelpers/translation";

type ButtonProps = {
  min?: number;
  max?: number;
  value: number;
  //setValue: React.Dispatch<React.SetStateAction<number>>;
  disabled?: boolean;
  onChange?: (value: number) => void;
};

export default function NumberInput({
  min,
  max,
  value,
  //setValue,
  disabled,
  onChange,
}: ButtonProps) {
  if (!min && min !== 0) {
    min = Number.MIN_SAFE_INTEGER;
  }
  if (!max && max !== 0) {
    max = Number.MAX_SAFE_INTEGER;
  }
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const result = event.target.value.replace(/^(-)|[^0-9]+/g, "$1");
    const resultInt = parseInt(result);

    onChange ? onChange(resultInt) : null;
    //setValue ? setValue(resultInt) : null;
  }
  function handleIncrement() {
    let number = Number(value);
    if (number < max) {
      number += 1;
      //setValue(number);
      onChange(number);
    }
  }
  function handleDecrement() {
    let number = Number(value);
    if (number > min) {
      number -= 1;
      //setValue(number);
      onChange(number);
    }
  }
  return (
    <Stack
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={1.5}
    >
      <Input
        type="text"
        sx={{ maxWidth: "5em", minWidth: "2em" }}
        onChange={handleChange}
        value={value}
        disabled={disabled}
      ></Input>
      <IconButton
        variant="solid"
        sx={{
          color: "#00000",
          backgroundColor: "#F8A866",
          "&:hover": { backgroundColor: "#F68C35" },
          boxShadow: buttonShadow,
          //marginLeft: "1rem",
          //padding: "0em 0.8em",
        }}
        onClick={handleIncrement}
        disabled={disabled}
        aria-label={parseUICode("ui_aria_increment")}
      >
        <AddIcon />
      </IconButton>
      <IconButton
        variant="solid"
        sx={{
          color: "#00000",
          backgroundColor: "#66B6F8",
          "&:hover": { backgroundColor: "#359FF6" },
          boxShadow: buttonShadow,
          //marginLeft: ".5rem",
          //padding: "0em 0.8em",
        }}
        onClick={handleDecrement}
        disabled={disabled}
        aria-label={parseUICode("ui_aria_decrement")}
      >
        <RemoveIcon />
      </IconButton>
    </Stack>
  );
}
