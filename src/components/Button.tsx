import Button from "@mui/joy/Button";
import Add from "@mui/icons-material/Add";

const largeAdd = {
  color: "#00000",
  backgroundColor: "#F8A866",
  "&:hover": { backgroundColor: "#F68C35" },
  padding: "20px",
} as const;

const largeAlt = {
  color: "#00000",
  backgroundColor: "#66B6F8",
  "&:hover": { backgroundColor: "#359FF6" },
  padding: "10px 20px",
} as const;

export default function ButtonComp() {
  return (
    <Button sx={largeAlt} size="lg" startDecorator={<Add />}>
      Button text
    </Button>
  );
}
