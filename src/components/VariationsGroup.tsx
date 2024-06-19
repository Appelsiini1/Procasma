import { AccordionGroup, Box, Stack } from "@mui/joy";
import texts from "../../resource/texts.json";
import { language } from "../constantsUI";
import { HandleAssignmentFn } from "../helpers/assignmentHelpers";
import { getNextID } from "../helpers/getNextID";
import { addVariation, removeVariation } from "../helpers/variationHelpers";
import { defaultVariation } from "../testData";
import { Variation } from "../types";
import ButtonComp from "./ButtonComp";
import VariationComponent from "./VariationComponent";

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
        ariaLabel={texts.ui_aria_add_variation[language.current]}
      >
        {texts.ui_add_variation[language.current]}
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
                    modalText={`${texts.ui_delete[language.current]} 
                        ${texts.ui_variation[language.current]} ${varID}`}
                    buttonType="delete"
                    onClick={() =>
                      removeVariation(
                        varID,
                        variations,
                        "variations",
                        handleAssignment
                      )
                    }
                    ariaLabel={texts.ui_aria_delete_variation[language.current]}
                  >
                    {`${texts.ui_delete[language.current]} ${varID}`}
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
