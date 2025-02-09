import {
  Grid,
  List,
  ListItem,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/joy";
import ListSkeleton, { ListSkeletonSmall } from "./Skeletons";
import { parseUICode } from "../rendererHelpers/translation";
import { useContext, useEffect, useState } from "react";
import { UIContext } from "./Context";

interface BrowserProps {
  results: React.JSX.Element[];
  filters: { name: string; element: React.JSX.Element[] }[];
  getResultsFunc: () => Promise<void>;
  getFiltersFunc: () => Promise<void>;
  resultDependencies: unknown[];
  requestRefreshBrowser: boolean;
  setRequestRefreshBrowser: (value: boolean) => void;
}

/**
 * Handles rendering browser elements and updating the data to be displayed.
 * @param results The results content.
 * @param filters The display names and content of filters
 * @param getResultsFunc The function to call when results should be updated.
 * @param getFiltersFunc The function to call when filters should be updated
 * @param resultDependencies The items that results depends on when fetching.
 * @param requestRefreshBrowser When true, initiates a filter refresh.
 * @param setRequestRefreshBrowser Used to set requestRefreshBrowser.
 * @returns
 */
export default function Browser({
  results,
  filters,
  getResultsFunc,
  getFiltersFunc,
  resultDependencies,
  requestRefreshBrowser,
  setRequestRefreshBrowser,
}: BrowserProps) {
  const { handleSnackbar } = useContext(UIContext);
  const filtersExist = typeof getFiltersFunc === "undefined" ? false : true;
  const [waitingForResults, setWaitingForResults] = useState(true);
  const [waitingForFilters, setWaitingForFilters] = useState(filtersExist);

  async function getResults() {
    setWaitingForResults(true);
    try {
      await getResultsFunc();
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
    setWaitingForResults(false);
  }

  useEffect(() => {
    if (resultDependencies.some((dep) => typeof dep === "undefined")) {
      return;
    }
    getResults();
  }, resultDependencies);

  async function getFilters() {
    setWaitingForFilters(true);
    try {
      await getFiltersFunc();
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
    setWaitingForFilters(false);
  }

  useEffect(() => {
    if (!requestRefreshBrowser) {
      return;
    }
    setRequestRefreshBrowser(false);
    // A request to refresh the browser should start by getting the latest
    // filters

    // If getFilterFunc is undefined, a request to refresh the browser
    // should directly call getResults
    if (!filtersExist) {
      getResults();
    } else {
      getFilters();
    }
  }, [requestRefreshBrowser]);

  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justifyContent="flex-start"
      alignItems="stretch"
      sx={{ minWidth: "100%", marginY: "1rem" }}
    >
      <Grid xs={8}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
        >
          <Typography level="h3">{parseUICode("ui_results")}</Typography>

          <Stack
            height="40rem"
            maxHeight="50vh"
            width="100%"
            sx={{
              border: "1px solid lightgrey",
              borderRadius: "0.5rem",
              backgroundColor: "var(--content-background)",
            }}
            direction="column"
            justifyContent="start"
            alignItems="start"
          >
            {waitingForResults ? (
              <ListSkeleton />
            ) : (
              <List sx={{ width: "calc(100% - 8px)", overflow: "auto" }}>
                {results}
              </List>
            )}
          </Stack>
        </Stack>
      </Grid>
      <Grid xs={4}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
        >
          <Typography level="h3">{parseUICode("ui_filter")}</Typography>

          <Stack
            height="40rem"
            maxHeight="50vh"
            width="100%"
            sx={{
              border: "1px solid lightgrey",
              borderRadius: "0.5rem",
              backgroundColor: "var(--content-background)",
            }}
            direction="column"
            justifyContent="start"
            alignItems="start"
          >
            {waitingForFilters ? (
              <ListSkeletonSmall />
            ) : (
              <List sx={{ width: "calc(100% - 8px)", overflow: "auto" }}>
                {filters.map((filter, index) => {
                  return (
                    <ListItem nested key={index}>
                      <ListSubheader>{filter.name}</ListSubheader>
                      <List>{filter.element}</List>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}
