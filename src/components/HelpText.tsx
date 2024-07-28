import { Tooltip, Typography } from "@mui/joy";

export default function HelpText({ text }: { text: string }) {
  return (
    <Tooltip title={text} variant="solid" placement="top-start" size="lg">
      <Typography color="primary" level="title-lg" sx={{ maxWidth: "1.5em" }}>
        (?)
      </Typography>
    </Tooltip>
  );
}
