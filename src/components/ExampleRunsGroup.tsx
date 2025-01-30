import ButtonComp from "./ButtonComp";
import { ExampleRunType } from "../types";
import { getNextIDNumeric } from "../rendererHelpers/getNextID";
import {
  addVariation,
  removeVariation,
} from "../rendererHelpers/variationHelpers";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import { Box, Stack, Typography } from "@mui/joy";
import ExampleRun from "./ExampleRun";
import { parseUICode } from "../rendererHelpers/translation";
import { defaultExampleRun } from "../defaultObjects";
import { deepCopy } from "../rendererHelpers/utilityRenderer";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";

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
  const [openRun, setOpenRun] = useState<string>("");
  return (
    <>
      <Typography level="h4" sx={{ marginBottom: "0.5rem" }}>
        {parseUICode("ui_ex_runs")}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Box
          sx={{
            backgroundColor: "var(--content-background-inner)",
            padding: "0.5rem",
            border: "2px solid lightgrey",
            borderRadius: "0.2rem",
            height: "fit-content",
          }}
        >
          <Stack
            direction="row"
            justifyContent={"end"}
            sx={{ paddingY: "0.2rem" }}
          >
            <ButtonComp
              sx={{ maxWidth: "3rem", minWidth: "4rem" }}
              buttonType="normal"
              onClick={() =>
                addVariation(
                  deepCopy(defaultExampleRun),
                  exampleRuns,
                  getNextIDNumeric,
                  `${pathInAssignment}.exampleRuns`,
                  handleAssignment
                )
              }
              ariaLabel={parseUICode("ui_aria_add_ex_run")}
            >
              <AddIcon />
            </ButtonComp>
          </Stack>

          {exampleRuns
            ? Object.keys(exampleRuns).map((exRunID) => (
                <Stack
                  key={exRunID}
                  direction="row"
                  spacing={1}
                  justifyContent={"space-between"}
                  sx={{ paddingY: "0.2rem" }}
                >
                  <ButtonComp
                    sx={{ width: "3rem" }}
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
                  />
                  <ButtonComp
                    sx={{ maxWidth: "3rem", minWidth: "4rem" }}
                    buttonType="normal"
                    onClick={() => setOpenRun(exRunID)}
                    ariaLabel={parseUICode("ui_edit_example_run")}
                  >
                    {exRunID}
                  </ButtonComp>
                </Stack>
              ))
            : ""}
        </Box>

        <Box
          sx={{
            backgroundColor: "var(--content-background-inner)",
            padding: "0.5rem",
            border: "2px solid lightgrey",
            borderRadius: "0.2rem",
            height: "fit-content",
            minHeight: "10rem",
            width: "100%",
          }}
        >
          {exampleRuns[openRun] ? (
            <>
              <ExampleRun
                exRunID={openRun}
                exampleRun={exampleRuns[openRun]}
                handleAssignment={handleAssignment}
                pathInAssignment={`${pathInAssignment}.exampleRuns.${openRun}`}
              ></ExampleRun>
            </>
          ) : (
            ""
          )}
        </Box>
      </Stack>
    </>
  );
}
