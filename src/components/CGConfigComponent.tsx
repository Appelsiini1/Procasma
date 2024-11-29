import {
  Box,
  CircularProgress,
  Grid,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import InputField from "./InputField";
import ButtonComp from "./ButtonComp";
import { parseUICode } from "../rendererHelpers/translation";
import { HandleAssignmentFn } from "../rendererHelpers/assignmentHelpers";
import { useEffect, useState } from "react";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import CGAutoTestComponent from "./CGAutoTestComponent";
import { Variation } from "../types";

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
  const [idField, setIdField] = useState<string | number>("");
  const [resultConfig, setResultConfig] = useState<any>(null);
  const [ATcomponent, setATcomponent] = useState<JSX.Element>(<></>);
  const [updatePage, setUpdatePage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchAssignment() {
    setLoading(true);
    const result = await handleIPCResult(() =>
      window.api.getATV2Config(String(idField))
    );
    const resultJSON = JSON.parse(result);
    setResultConfig(resultJSON);
    setUpdatePage(!updatePage);
  }

  function saveConfig() {
    handleAssignment(pathInAssignment + ".cgConfig.id", idField);
    handleAssignment(pathInAssignment + ".cgConfig.atv2", resultConfig);
    setOpen(false);
  }

  useEffect(() => {
    if (Object.keys(variation.cgConfig.atv2).length != 0) {
      setATcomponent(
        <CGAutoTestComponent atvConfig={variation.cgConfig.atv2} />
      );
      setIdField(variation.cgConfig.id);
    }
  }, []);

  useEffect(() => {
    if (resultConfig != null)
      setATcomponent(<CGAutoTestComponent atvConfig={resultConfig} />);
    setLoading(false);
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
          {ATcomponent}
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
