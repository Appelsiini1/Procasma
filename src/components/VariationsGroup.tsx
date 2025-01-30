import { Box, Stack, Typography } from "@mui/joy";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import { getNextID, getNextIDNumeric } from "../rendererHelpers/getNextID";
import {
  addVariation,
  removeVariation,
} from "../rendererHelpers/variationHelpers";
import { Variation } from "../types";
import ButtonComp from "./ButtonComp";
import VariationComponent from "./VariationComponent";
import { parseUICode } from "../rendererHelpers/translation";
import { defaultVariation } from "../defaultObjects";
import { deepCopy } from "../rendererHelpers/utilityRenderer";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

type ComponentProps = {
  variations: {
    [key: string]: Variation;
  };
  handleAssignment: HandleAssignmentFn;
  useLevelsInstead?: boolean;
};

export default function VariationsGroup({
  variations,
  handleAssignment,
  useLevelsInstead,
}: ComponentProps) {
  const [openVariation, setOpenVariation] = useState<string>("");
  return (
    <>
      <div className="emptySpace2" />
      <Typography level="h2" sx={{ marginBottom: "0.5rem" }}>
        {useLevelsInstead
          ? parseUICode("ui_levels")
          : parseUICode("ui_variations")}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Box
          sx={{
            backgroundColor: "var(--content-background)",
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
                  deepCopy(defaultVariation),
                  variations,
                  useLevelsInstead ? getNextIDNumeric : getNextID,
                  "variations",
                  handleAssignment
                )
              }
              ariaLabel={
                useLevelsInstead
                  ? parseUICode("ui_aria_add_level")
                  : parseUICode("ui_aria_add_variation")
              }
            >
              <AddIcon />
            </ButtonComp>
          </Stack>

          {variations
            ? Object.keys(variations).map((varID) => (
                <Stack
                  key={varID}
                  direction="row"
                  spacing={1}
                  justifyContent={"space-between"}
                  sx={{ paddingY: "0.2rem" }}
                >
                  <ButtonComp
                    sx={{ width: "3rem" }}
                    confirmationModal={true}
                    modalText={`${parseUICode("ui_delete")} 
                        ${
                          useLevelsInstead
                            ? parseUICode("ui_level")
                            : parseUICode("ui_variation")
                        } ${varID}`}
                    buttonType="delete"
                    onClick={() =>
                      removeVariation(
                        varID,
                        variations,
                        "variations",
                        handleAssignment
                      )
                    }
                    ariaLabel={
                      useLevelsInstead
                        ? parseUICode("ui_aria_delete_level")
                        : parseUICode("ui_aria_delete_variation")
                    }
                  />
                  <ButtonComp
                    sx={{ maxWidth: "3rem", minWidth: "4rem" }}
                    buttonType="normal"
                    onClick={() => setOpenVariation(varID)}
                    ariaLabel={
                      useLevelsInstead
                        ? parseUICode("ui_edit_level")
                        : parseUICode("ui_edit_variation")
                    }
                  >
                    {varID}
                  </ButtonComp>
                </Stack>
              ))
            : ""}
        </Box>
        <Box
          sx={{
            backgroundColor: "var(--content-background)",
            padding: "0.5rem",
            border: "2px solid lightgrey",
            borderRadius: "0.2rem",
            height: "fit-content",
            minHeight: "10rem",
            width: "100%",
          }}
        >
          {variations[openVariation] ? (
            <>
              <VariationComponent
                varID={openVariation}
                variation={variations[openVariation]}
                handleAssignment={handleAssignment}
                pathInAssignment={`variations.${openVariation}`}
                useLevelsInstead={useLevelsInstead}
              ></VariationComponent>
            </>
          ) : (
            ""
          )}
        </Box>
      </Stack>
    </>
  );
}
