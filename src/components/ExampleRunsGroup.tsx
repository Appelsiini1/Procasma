import texts from "../../resource/texts.json";
import { language } from "../constantsUI";
import { defaultExampleRun } from "../testData";
import ButtonComp from "./ButtonComp";
import { ExampleRunType } from "../types";
import { getNextIDNumeric } from "../helpers/getNextID";
import { addVariation, removeVariation } from "../helpers/variationHelpers";
import { HandleAssignmentFn } from "../helpers/assignmentHelpers";
import { AccordionGroup, Box, Stack } from "@mui/joy";
import ExampleRun from "./ExampleRun";

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
        ariaLabel={texts.ui_aria_add_ex_run[language.current]}
      >
        {texts.ui_add_ex_run[language.current]}
      </ButtonComp>
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
                    modalText={`${texts.ui_delete[language.current]} 
                      ${texts.ex_run[language.current]} 
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
                    ariaLabel={texts.ui_aria_delete_ex_run[language.current]}
                  >
                    {`${texts.ui_delete[language.current]} ${exRunID}`}
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
