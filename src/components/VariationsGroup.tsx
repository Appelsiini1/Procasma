import { AccordionGroup, Box, Grid, Typography } from "@mui/joy";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import { getNextID } from "../rendererHelpers/getNextID";
import {
  addVariation,
  removeVariation,
} from "../rendererHelpers/variationHelpers";
import { Variation } from "../types";
import ButtonComp from "./ButtonComp";
import VariationComponent from "./VariationComponent";
import { parseUICode } from "../rendererHelpers/translation";
import { defaultVariation } from "../defaultObjects";

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
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
      >
        <Grid>
          <Typography level="h3">{parseUICode("ui_variations")}</Typography>
        </Grid>
        <Grid>
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
        </Grid>
      </Grid>

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
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="start"
                  spacing={1}
                  key={varID}
                >
                  <Grid xs={1.5} sx={{ marginTop: "0.5rem" }}>
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
                      {varID}
                    </ButtonComp>
                  </Grid>
                  <Grid xs={10.5}>
                    <VariationComponent
                      varID={varID}
                      variation={variations[varID]}
                      handleAssignment={handleAssignment}
                      pathInAssignment={`variations.${varID}`}
                    ></VariationComponent>
                  </Grid>
                </Grid>
              ))
            : ""}
        </AccordionGroup>
        <div className="emptySpace1" />
      </Box>
    </>
  );
}
