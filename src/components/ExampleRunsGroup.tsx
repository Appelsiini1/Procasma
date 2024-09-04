import ButtonComp from "./ButtonComp";
import { ExampleRunType } from "../types";
import { getNextIDNumeric } from "../generalHelpers/getNextID";
import {
  addVariation,
  removeVariation,
} from "../rendererHelpers/variationHelpers";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import { AccordionGroup, Box, Grid, Stack, Typography } from "@mui/joy";
import ExampleRun from "./ExampleRun";
import { parseUICode } from "../rendererHelpers/translation";
import { defaultExampleRun } from "../defaultObjects";

type ComponentProps = {
  exampleRuns: {
    [key: string]: ExampleRunType;
  };
  pathInAssignment: string;
  handleAssignment: HandleAssignmentFn;
};

export default function ExampleRunsGroup({
  exampleRuns,
  pathInAssignment,
  handleAssignment,
}: ComponentProps) {
  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
      >
        <Grid>
          <Typography level="h4">{parseUICode("ui_ex_runs")}</Typography>
        </Grid>
        <Grid>
          <ButtonComp
            buttonType="normal"
            onClick={() =>
              addVariation(
                defaultExampleRun,
                exampleRuns,
                getNextIDNumeric,
                `${pathInAssignment}.exampleRuns`,
                handleAssignment
              )
            }
            ariaLabel={parseUICode("ui_aria_add_ex_run")}
          >
            {parseUICode("ui_add_ex_run")}
          </ButtonComp>
        </Grid>
      </Grid>

      <div className="emptySpace1" />
      <Box
        sx={{
          maxHeight: "40rem",
          overflowY: "auto",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <AccordionGroup
          size="lg"
          sx={{
            width: "100%",
            marginRight: "2rem",
          }}
        >
          {exampleRuns
            ? Object.keys(exampleRuns).map((exRunID) => (
                <Stack
                  key={exRunID}
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="start"
                  spacing={0.5}
                >
                  <ExampleRun
                    exRunID={exRunID}
                    exampleRun={exampleRuns[exRunID]}
                    handleAssignment={handleAssignment}
                    pathInAssignment={`${pathInAssignment}.exampleRuns.${exRunID}`}
                  ></ExampleRun>

                  <ButtonComp
                    confirmationModal={true}
                    modalText={`${parseUICode("ui_delete")} 
                      ${parseUICode("ex_run")} 
                      ${exRunID}`}
                    buttonType="delete"
                    onClick={() =>
                      removeVariation(
                        exRunID,
                        exampleRuns,
                        `${pathInAssignment}.exampleRuns`,
                        handleAssignment
                      )
                    }
                    ariaLabel={parseUICode("ui_aria_delete_ex_run")}
                  >
                    {exRunID}
                  </ButtonComp>
                  <div className="emptySpace1" />
                </Stack>
              ))
            : ""}
        </AccordionGroup>
      </Box>
    </>
  );
}
