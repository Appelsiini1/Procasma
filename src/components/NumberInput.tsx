import { Input, Stack, IconButton } from "@mui/joy";
import React from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { buttonShadow } from "../constantsUI";

type ButtonProps = {
  min?: number;
  max?: number;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
};

export default function NumberInput({
  min,
  max,
  value,
  setValue,
  disabled,
}: ButtonProps) {
  if (!min) {
    min = Number.MIN_SAFE_INTEGER;
  }
  if (!max) {
    max = Number.MAX_SAFE_INTEGER;
  }
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const result = event.target.value.replace(/^(-)|[^0-9]+/g, "$1");

    setValue(result);
  }
  function handleIncrement() {
    let number = Number(value);
    if (number < max) {
      number += 1;
      setValue(number.toString());
    }
  }
  function handleDecrement() {
    let number = Number(value);
    if (number > min) {
      number -= 1;
      setValue(number.toString());
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
      >
        <RemoveIcon />
      </IconButton>
    </Stack>
  );
}
