import { Stack } from "@mui/joy";
import ButtonComp from "./ButtonComp";
import log from "electron-log/renderer";
import { DEVMODE } from "../constantsUI";

/**
 * Display a row of debug buttons for any variables.
 * Renders only if DEVMODE is on.
 * @param vars Any variables.
 */
export default function DebugButtonStack({
  items,
}: {
  items: Record<string, unknown>;
}) {
  return (
    <>
      {DEVMODE ? (
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          {Object.entries(items).map(([name, value]) => (
            <ButtonComp
              key={name}
              buttonType="debug"
              onClick={() => log.debug(value)}
              ariaLabel={" debug "}
            >
              {`Log ${name}`}
            </ButtonComp>
          ))}
        </Stack>
      ) : null}
    </>
  );
}
