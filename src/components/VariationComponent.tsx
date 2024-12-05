import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Grid,
  ListItemContent,
  Stack,
  Typography,
} from "@mui/joy";
import { spacingSX } from "../constantsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";
import ButtonComp from "./ButtonComp";
import FileList from "./FileList";
import { ExampleRunType, Variation } from "../types";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import ExampleRunsGroup from "./ExampleRunsGroup";
import { parseUICode } from "../rendererHelpers/translation";
import {
  arrayToString,
  splitStringToArray,
} from "../rendererHelpers/converters";
import { useState } from "react";
import CGConfigComponent from "./CGConfigComponent";

type ComponentProps = {
  varID: string;
  variation: Variation;
  handleAssignment: HandleAssignmentFn;
  pathInAssignment: string;
  useLevelsInstead?: boolean;
};

export default function VariationComponent({
  varID,
  variation,
  handleAssignment,
  pathInAssignment,
  useLevelsInstead,
}: ComponentProps) {
  const exampleRuns: { [key: string]: ExampleRunType } = variation.exampleRuns;
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <CGConfigComponent
        open={open}
        setOpen={setOpen}
        handleAssignment={handleAssignment}
        pathInAssignment={pathInAssignment}
        variation={variation}
      />
      <Accordion sx={{ backgroundColor: "#FaFaFa" }}>
        <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
          <Avatar color="primary">{varID}</Avatar>
          <ListItemContent>
            <Typography level="title-md">
              {useLevelsInstead
                ? parseUICode("ui_level")
                : parseUICode("ui_variation") + " " + varID}
            </Typography>
          </ListItemContent>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ marginLeft: "4rem", marginTop: "1rem" }}>
            <Stack
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing={2}
              sx={spacingSX}
            >
              <Typography level="h4">{parseUICode("ui_inst")}</Typography>
              <HelpText text={parseUICode("help_inst")} />
            </Stack>
            <InputField
              fieldKey={varID + "vInstInput"}
              isLarge
              defaultValue={variation.instructions}
              onChange={(value: string) =>
                handleAssignment(
                  `${pathInAssignment}.instructions`,
                  value,
                  true
                )
              }
            />

            <div className="emptySpace1" />
            <ButtonComp
              buttonType="normalAlt"
              onClick={() => setOpen(true)}
              ariaLabel={parseUICode("ui_aria_cg_config")}
            >
              {parseUICode("ui_cg_config")}
            </ButtonComp>

            <div className="emptySpace2" />
            <FileList
              files={variation.files}
              handleAssignment={handleAssignment}
              pathInAssignment={`${pathInAssignment}.files`}
            ></FileList>

            <div className="emptySpace2" />
            <ExampleRunsGroup
              exampleRuns={exampleRuns}
              pathInAssignment={pathInAssignment}
              handleAssignment={handleAssignment}
            ></ExampleRunsGroup>

            <div className="emptySpace2" />
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing={1}
            >
              <Grid xs={3}>
                <Typography level="h4">{parseUICode("ui_used_in")}</Typography>
              </Grid>
              <Grid xs={1}>
                <HelpText text={parseUICode("help_used_in")} />
              </Grid>
              <Grid xs={8}>
                <InputField
                  fieldKey="caUsedInInput"
                  defaultValue={arrayToString(variation?.usedIn)}
                  onChange={(value: string) =>
                    handleAssignment(
                      `${pathInAssignment}.usedIn`,
                      splitStringToArray(value),
                      true
                    )
                  }
                />{" "}
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
