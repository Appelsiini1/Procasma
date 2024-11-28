import log from "electron-log/renderer";
import InputField from "../components/InputField";
import { useState } from "react";
import ButtonComp from "../components/ButtonComp";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";

export default function CGDev() {
  const [assigID, setAssigID] = useState<string>("");
  async function getConfig() {
    log.debug("Getting config");
    const result = await handleIPCResult(() =>
      window.api.getATV2Config(assigID)
    );
    log.debug(JSON.parse(result));
  }
  return (
    <>
      Assignment ID:
      <InputField
        fieldKey="assigID"
        onChange={(value) => setAssigID(String(value))}
      ></InputField>
      <ButtonComp
        buttonType="normal"
        onClick={() => {
          getConfig();
        }}
        ariaLabel=""
      >
        Get config
      </ButtonComp>
    </>
  );
}
