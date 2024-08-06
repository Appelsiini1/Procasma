import { Stack, Tooltip, Typography } from "@mui/joy";

export default function HelpText({
  text,
  children,
}: {
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <Tooltip title={text} variant="solid" placement="top-start" size="lg">
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{
          justifyContent: "left",
        }}
      >
        {children ?? (
          <Typography
            color="primary"
            level="title-lg"
            sx={{ maxWidth: "1.5em" }}
          >
            (?)
          </Typography>
        )}
      </Stack>
    </Tooltip>
  );
}
