import { Tooltip, Typography } from "@mui/joy";

export default function HelpText({ text }: { text: string }) {
  return (
    <Tooltip title={text} variant="solid" placement="top-start" size="lg">
      <Typography color="success" level="title-lg">
        (?)
      </Typography>
    </Tooltip>
  );
}
