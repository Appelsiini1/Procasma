import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Avatar,
  Box,
  ListItemContent,
  Stack,
  Typography,
} from "@mui/joy";
import texts from "../../resource/texts.json";
import { language, currentCourse, spacingSX } from "../constantsUI";
import HelpText from "./HelpText";
import InputField from "./InputField";
import ButtonComp from "./ButtonComp";
import { useEffect, useState } from "react";
import FileList from "./FileList";
import { dummyFileRows } from "../testData";
import { addVariation, deleteVariation } from "../helpers/variationHelpers";
import ExampleRun from "./ExampleRun";
import { getNextIDNumeric } from "../helpers/getNextID";
import { Variation } from "../types";
import { HandleAssignmentFn } from "../routes/AssignmentInput";

type ComponentProps = {
  varID: string;
  variation: Variation;
  handleAssignment: HandleAssignmentFn;
};

export default function VariationComponent({
  varID,
  variation,
  handleAssignment,
}: ComponentProps) {
  const [exampleAccordion, setExampleAccordion] =
    useState<Array<React.JSX.Element>>(null);
  //useEffect(() => console.log(variation), []);
  return (
    <Accordion sx={{ backgroundColor: "#FaFaFa" }}>
      <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
        <Avatar color="primary">{varID}</Avatar>
        <ListItemContent>
          <Typography level="title-md">
            {texts.ui_variation[language.current] + " " + varID}
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
            <Typography level="h4">
              {texts.ui_inst[language.current]}
            </Typography>
            <HelpText text={texts.help_inst[language.current]} />
          </Stack>
          <InputField
            fieldKey={varID + "vInstInput"}
            isLarge
            defaultValue={variation.instructions}
            onChange={(value: string) =>
              handleAssignment(`variations.${varID}.instructions`, value)
            }
          />

          <div className="emptySpace1" />
          <ButtonComp
            buttonType="normalAlt"
            onClick={null}
            ariaLabel={texts.ui_aria_cg_config[language.current]}
          >
            {texts.ui_cg_config[language.current]}
          </ButtonComp>

          <div className="emptySpace2" />
          <Typography level="h4" sx={spacingSX}>
            {texts.ui_files[language.current]}
          </Typography>
          <ButtonComp
            buttonType="normal"
            onClick={() => console.log("addFiles()")}
            ariaLabel={texts.ui_aria_import_files[language.current]}
          >
            {texts.ui_import_files[language.current]}
          </ButtonComp>

          <div className="emptySpace1" />
          <FileList rows={dummyFileRows}></FileList>

          <div className="emptySpace2" />
          <Typography level="h4" sx={spacingSX}>
            {texts.ui_ex_runs[language.current]}
          </Typography>
          <ButtonComp
            buttonType="normal"
            onClick={() =>
              addVariation(
                ExampleRun,
                getNextIDNumeric,
                exampleAccordion,
                setExampleAccordion
              )
            }
            ariaLabel={texts.ui_aria_add_ex_run[language.current]}
          >
            {texts.ui_add_ex_run[language.current]}
          </ButtonComp>
          <div className="emptySpace1" />
          <AccordionGroup size="lg" sx={{ width: "100%", marginRight: "2rem" }}>
            {exampleAccordion
              ? exampleAccordion.map((example) => (
                  <Stack
                    key={example.key}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="start"
                    spacing={0.5}
                  >
                    <div style={{ width: "100%" }}>{example}</div>

                    <ButtonComp
                      confirmationModal={true}
                      modalText={`${texts.ui_delete[language.current]} 
                      ${texts.ex_run[language.current]} 
                      ${example.key}`}
                      buttonType="delete"
                      onClick={() =>
                        deleteVariation(
                          exampleAccordion,
                          setExampleAccordion,
                          example.key,
                          "new"
                        )
                      }
                      ariaLabel={texts.ui_aria_delete_ex_run[language.current]}
                    >
                      {`${texts.ui_delete[language.current]} ${example.key}`}
                    </ButtonComp>
                    <div className="emptySpace1" />
                  </Stack>
                ))
              : ""}
          </AccordionGroup>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
