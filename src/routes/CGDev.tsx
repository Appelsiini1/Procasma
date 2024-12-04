import log from "electron-log/renderer";
import InputField from "../components/InputField";
import { useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";

export default function CGDev() {
  const [assigID, setAssigID] = useState<string>("");
  const [resultConfig, setResultConfig] = useState<any>(null);
  const [ATcomponent, setATcomponent] = useState<JSX.Element>(<>Palikka</>);
  const [updatePage, setUpdatePage] = useState<boolean>(false);

  async function getConfig() {
    log.debug("Getting config");
    const result = await handleIPCResult(() =>
      window.api.getATV2Config(assigID)
    );
    const resultJSON = JSON.parse(result);
    setResultConfig(resultJSON);
    setUpdatePage(!updatePage);
  }

  useEffect(() => {
    log.debug("UseEffect resultConfig: ", resultConfig);
    if (resultConfig != null) setATcomponent(<></>);
  }, [updatePage]);
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
      {ATcomponent}
    </>
  );
}
