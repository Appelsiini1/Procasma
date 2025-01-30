import { Grid, Stack, Typography } from "@mui/joy";
import { spacingSX } from "../constantsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";
import ButtonComp from "./ButtonComp";
import FileList from "./FileList";
import { ExampleRunType, ProjectLevel, Variation } from "../types";
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
  variation: Variation | ProjectLevel;
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
      <Stack>
        <Typography level="h3">
          {useLevelsInstead
            ? /* Normal variation does not have a levelName but project work level does*/
              /* @ts-ignore */
              variation?.levelName ?? parseUICode("ui_level")
            : parseUICode("ui_variation") + " " + varID}
        </Typography>

        {useLevelsInstead ? (
          <>
            <Typography level="h3">{parseUICode("ui_level_title")}</Typography>
            <InputField
              fieldKey={varID + "levelNameInput"}
              /* Normal variation does not have a levelName but project work level does*/
              /* @ts-ignore */
              defaultValue={variation.levelName}
              onChange={(value: string) =>
                handleAssignment(`${pathInAssignment}.levelName`, value, true)
              }
            />
          </>
        ) : (
          ""
        )}
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
          sx={{ ...spacingSX, marginTop: "1rem" }}
        >
          <Typography level="h4">{parseUICode("ui_inst")}</Typography>
          <HelpText text={parseUICode("help_inst")} />
        </Stack>
        <InputField
          fieldKey={varID + "vInstInput"}
          isLarge
          defaultValue={variation.instructions}
          onChange={(value: string) =>
            handleAssignment(`${pathInAssignment}.instructions`, value, true)
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
            />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
