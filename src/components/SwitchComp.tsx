import Switch, { switchClasses } from "@mui/joy/Switch";
import React from "react";

type ButtonProps = {
  checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
};

export default function SwitchComp({
  checked,
  setChecked,
  disabled = false,
}: ButtonProps) {
  return (
    <Switch
      size="lg"
      checked={checked}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        setChecked(event.target.checked)
      }
      disabled={disabled}
      sx={{
        "--Switch-thumbSize": "18px",
        "--Switch-trackWidth": "60px",
        "--Switch-trackHeight": "27px",
        "--Switch-trackBackground": "#BCBDBD",
        "&:hover": {
          "--Switch-trackBackground": "#BCBDBD",
        },
        [`&.${switchClasses.checked}`]: {
          "--Switch-trackBackground": "#F8A866",
          "&:hover": {
            "--Switch-trackBackground": "#F8A866",
          },
        },
      }}
    />
  );
}
