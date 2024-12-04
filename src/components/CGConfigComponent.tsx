import {
  Box,
  CircularProgress,
  Grid,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Textarea,
} from "@mui/joy";
import InputField from "./InputField";
import ButtonComp from "./ButtonComp";
import { parseUICode } from "../rendererHelpers/translation";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import { useContext, useEffect, useState } from "react";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { Variation } from "../types";
import { UIContext } from "./Context";
import log from "electron-log/renderer";

export default function CGConfigComponent({
  open,
  setOpen,
  handleAssignment,
  pathInAssignment,
  variation,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAssignment: HandleAssignmentFn;
  pathInAssignment: string;
  variation: Variation;
}) {
  const { handleSnackbar } = useContext(UIContext);
  const [idField, setIdField] = useState<string | number>("");
  const [resultConfig, setResultConfig] = useState<any>(null);
  const [showAT, setShowAT] = useState<boolean>(false);
  const [updatePage, setUpdatePage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [tempSetup, setTempSetup] = useState<string>("");
  const [tempTests, setTempTests] = useState<string>("");

  async function fetchAssignment() {
    setLoading(true);
    const result = await handleIPCResult(() =>
      window.api.getATV2Config(String(idField))
    );
    const resultJSON = JSON.parse(result);
    setResultConfig(resultJSON);
    const setupPhase = JSON.stringify(resultJSON["setup"]["steps"], null, 2);
    const testPhase = JSON.stringify(resultJSON["test"]["steps"], null, 2);
    setTempSetup(setupPhase);
    setTempTests(testPhase);
    setUpdatePage(!updatePage);
  }

  function saveConfig() {
    try {
      let parsedSetup;
      let parsedTests;

      tempSetup.length === 0
        ? (parsedSetup = [])
        : (parsedSetup = JSON.parse(tempSetup));

      tempTests.length === 0
        ? (parsedTests = [])
        : (parsedTests = JSON.parse(tempTests));
      const finalConfig = {
        ...resultConfig,
        setup: parsedSetup,
        test: parsedTests,
      };
      handleAssignment(pathInAssignment + ".cgConfig.id", idField);
      handleAssignment(pathInAssignment + ".cgConfig.atv2", finalConfig);
      setOpen(false);
    } catch (Err) {
      log.error("Error in CG saveconfig(): ", Err.message);
      handleSnackbar({ error: parseUICode("error_cg_config_syntax") });
    }
  }

  useEffect(() => {
    if (Object.keys(variation.cgConfig.atv2).length != 0) {
      setResultConfig(variation.cgConfig.atv2);
      const setupPhase = JSON.stringify(
        variation.cgConfig.atv2["setup"]["steps"],
        null,
        2
      );
      const testPhase = JSON.stringify(
        variation.cgConfig.atv2["test"]["steps"],
        null,
        2
      );
      setTempSetup(setupPhase);
      setTempTests(testPhase);
      setShowAT(true);
      setIdField(variation.cgConfig.id);
    }
  }, []);

  useEffect(() => {
    if (resultConfig != null) {
      setShowAT(true);
      setLoading(false);
    }
  }, [updatePage]);

  return (
    <Modal
      aria-labelledby={parseUICode("ui_cg_config")}
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ModalDialog layout="fullscreen" sx={{ padding: 3 }}>
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Typography
          component="h2"
          id="modal-title"
          level="h4"
          textColor="inherit"
          sx={{ fontWeight: "lg", mb: 1 }}
        >
          {parseUICode("ui_cg_config")}
        </Typography>
        <Box sx={{ overflowY: "scroll", height: "90%" }}>
          <Typography>{parseUICode("ui_assignment_id")}:</Typography>
          <Grid
            container
            spacing={2}
            columns={3}
            sx={{ flexGrow: 1, maxWidth: "90%" }}
          >
            <Grid xs={2}>
              <>
                <InputField
                  fieldKey="CGassignmentIDInput"
                  onChange={setIdField}
                ></InputField>
              </>
            </Grid>
            <Grid xs={1}>
              <ButtonComp
                ariaLabel="fetch assignment configuration"
                buttonType="normalAlt"
                onClick={() => fetchAssignment()}
              >
                {parseUICode("ui_search_button")}
              </ButtonComp>
            </Grid>
          </Grid>

          <div className="emptySpace1"></div>
          {loading ? (
            <Typography startDecorator={<CircularProgress />}>
              {" "}
              {parseUICode("ui_loading")}{" "}
            </Typography>
          ) : (
            ""
          )}
          <div className="emptySpace1"></div>
          {showAT ? (
            <AccordionGroup
              size="sm"
              sx={{ width: "90%", marginRight: "2rem" }}
            >
              <Accordion sx={{ backgroundColor: "#FaFaFa" }}>
                <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
                  <Typography level="h4">{parseUICode("cg_setup")}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ padding: "1em" }}>
                    <Textarea
                      sx={{ maxWidth: "100%", minWidth: "10em" }}
                      key="cgConfigSetupInput"
                      onChange={(event) =>
                        setTempSetup(String(event.target.value))
                      }
                      defaultValue={tempSetup}
                      minRows={5}
                      maxRows={20}
                    ></Textarea>
                  </Box>
                </AccordionDetails>
              </Accordion>
              <Accordion sx={{ backgroundColor: "#FaFaFa" }}>
                <AccordionSummary sx={{ backgroundColor: "#D9D9D9" }}>
                  <Typography level="h4">{parseUICode("cg_tests")}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ padding: "1em" }}>
                    <Textarea
                      sx={{ maxWidth: "100%", minWidth: "10em" }}
                      key="cgConfigSetupInput"
                      onChange={(event) =>
                        setTempTests(String(event.target.value))
                      }
                      value={tempTests}
                      minRows={5}
                      maxRows={20}
                    ></Textarea>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </AccordionGroup>
          ) : (
            ""
          )}
        </Box>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <ButtonComp
            buttonType="normal"
            onClick={() => saveConfig()}
            ariaLabel={parseUICode("ui_save")}
          >
            {parseUICode("ui_save")}
          </ButtonComp>
          <ButtonComp
            ariaLabel={parseUICode("ui_close")}
            buttonType="normal"
            onClick={() => setOpen(false)}
          >
            {parseUICode("ui_close")}
          </ButtonComp>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
