import { AccordionGroup, Box, Stack } from "@mui/joy";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import { getNextID } from "../rendererHelpers/getNextID";
import {
  addVariation,
  removeVariation,
} from "../rendererHelpers/variationHelpers";
import { defaultVariation } from "../testData";
import { Variation } from "../types";
import ButtonComp from "./ButtonComp";
import VariationComponent from "./VariationComponent";
import { parseUICode } from "../rendererHelpers/translation";

type ComponentProps = {
  variations: {
    [key: string]: Variation;
  };
  handleAssignment: HandleAssignmentFn;
};

export default function VariationsGroup({
  variations,
  handleAssignment,
}: ComponentProps) {
  return (
    <>
      <ButtonComp
        buttonType="normal"
        onClick={() =>
          addVariation(
            defaultVariation,
            variations,
            getNextID,
            "variations",
            handleAssignment
          )
        }
        ariaLabel={parseUICode("ui_aria_add_variation")}
      >
        {parseUICode("ui_add_variation")}
      </ButtonComp>

      <div className="emptySpace2" />
      <Box
        sx={{
          maxHeight: "40rem",
          overflowY: "auto",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <AccordionGroup size="lg" sx={{ width: "100%", marginRight: "2rem" }}>
          {variations
            ? Object.keys(variations).map((varID) => (
                <Stack
                  key={varID}
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="start"
                  spacing={0.5}
                >
                  <VariationComponent
                    varID={varID}
                    variation={variations[varID]}
                    handleAssignment={handleAssignment}
                    pathInAssignment={`variations.${varID}`}
                  ></VariationComponent>

                  <ButtonComp
                    confirmationModal={true}
                    modalText={`${parseUICode("ui_delete")} 
                        ${parseUICode("ui_variation")} ${varID}`}
                    buttonType="delete"
                    onClick={() =>
                      removeVariation(
                        varID,
                        variations,
                        "variations",
                        handleAssignment
                      )
                    }
                    ariaLabel={parseUICode("ui_aria_delete_variation")}
                  >
                    {`${parseUICode("ui_delete")} ${varID}`}
                  </ButtonComp>

                  <div className="emptySpace1" />
                </Stack>
              ))
            : ""}
        </AccordionGroup>
        <div className="emptySpace1" />
      </Box>
    </>
  );
}
