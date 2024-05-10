import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { IconButton } from "@mui/joy";

export default function CounterButtons({
  onIncrement,
  onDecrement,
}: {
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <>
      <IconButton
        variant="solid"
        sx={{
          color: "#00000",
          backgroundColor: "#F8A866",
          "&:hover": { backgroundColor: "#F68C35" },
          //padding: "0em 0.8em",
        }}
        onClick={onIncrement}
      >
        <AddIcon />
      </IconButton>
      <IconButton
        variant="solid"
        sx={{
          color: "#00000",
          backgroundColor: "#66B6F8",
          "&:hover": { backgroundColor: "#359FF6" },
          marginLeft: ".5rem",
          //padding: "0em 0.8em",
        }}
        onClick={onDecrement}
      >
        <RemoveIcon />
      </IconButton>
    </>
  );
}
