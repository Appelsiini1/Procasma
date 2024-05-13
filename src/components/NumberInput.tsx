import { Input, Stack, IconButton } from "@mui/joy";
import React from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

type ButtonProps = {
  min: number;
  max: number;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

export default function NumberInput({
  min,
  max,
  value,
  setValue,
}: ButtonProps) {
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
      ></Input>
      <IconButton
        variant="solid"
        sx={{
          color: "#00000",
          backgroundColor: "#F8A866",
          "&:hover": { backgroundColor: "#F68C35" },
          //marginLeft: "1rem",
          //padding: "0em 0.8em",
        }}
        onClick={handleIncrement}
      >
        <AddIcon />
      </IconButton>
      <IconButton
        variant="solid"
        sx={{
          color: "#00000",
          backgroundColor: "#66B6F8",
          "&:hover": { backgroundColor: "#359FF6" },
          //marginLeft: ".5rem",
          //padding: "0em 0.8em",
        }}
        onClick={handleDecrement}
      >
        <RemoveIcon />
      </IconButton>
    </Stack>
  );
}
