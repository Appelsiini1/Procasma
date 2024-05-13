import { Input, Textarea } from "@mui/joy";

type ButtonProps = { isLarge: boolean; placeholder: string };

export default function InputField({ isLarge, placeholder }: ButtonProps) {
  let component: JSX.Element = null;
  if (isLarge) {
    component = (
      <Textarea
        sx={{ maxWidth: "40em", minWidth: "10em" }}
        minRows={5}
        maxRows={5}
        placeholder={placeholder}
      />
    );
  } else {
    component = (
      <Input
        sx={{ maxWidth: "30em", minWidth: "10em" }}
        placeholder={placeholder}
      />
    );
  }
  return component;
}
