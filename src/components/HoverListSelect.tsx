import {
  List,
  ListItem,
  ListItemButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import { parseUICode } from "../rendererHelpers/translation";
import LaunchIcon from "@mui/icons-material/Launch";

export default function HoverListSelect<T>({
  children,
  items,
  itemKey,
  handleSelect,
}: {
  children: React.ReactNode;
  items: T[];
  itemKey: keyof T;
  handleSelect: (item: T) => void;
}) {
  return (
    <Tooltip
      title={
        <>
          <Stack spacing={0} sx={{ minWidth: "18rem" }}>
            <Typography level="title-lg" sx={{ padding: "0.5rem" }}>
              {parseUICode("menu_open_recent")}
            </Typography>
            <List>
              {items.map((item, index) => (
                <ListItem key={index} startAction={<LaunchIcon />}>
                  <ListItemButton onClick={() => handleSelect(item)}>
                    {String(item[itemKey])}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Stack>
        </>
      }
      variant="outlined"
    >
      <div>{children}</div>
    </Tooltip>
  );
}
