import { useState } from "react";
import ButtonComp from "./components/ButtonComp";
import NumberInput from "./components/NumberInput";
import InputField from "./components/InputField";
import Dropdown from "./components/Dropdown";
import SwitchComp from "./components/Switch";
import HelpText from "./components/HelpText";
import SelectedHeader from "./components/SelectedHeader";
import PageHeaderBar from "./components/PageHeaderBar";
import ModalAlertDelete from "./components/ModalAlertDelete";
import ModalConfirm from "./components/ModalConfirm";
import ModalPopup from "./components/ModalPopup";
import Button from "@mui/joy/Button";

function App() {
  function onClick() {
    console.log("Button clicked!");
  }
  const [value, setValue] = useState("1");
  const options = [
    { name: "dog", age: 5 },
    { name: "cat", age: 6 },
  ];
  const [checked, setChecked] = useState<boolean>(false);
  const selected = 6;
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div>
      <PageHeaderBar
        pageName="Main Menu"
        courseName="CT00A0000 jtoantiantaontao"
      />
      <div className="content">
        <h1>💖 Hello World!</h1>
        <p>Welcome to your Electron application.</p>
        <div>
          <ButtonComp buttonType="largeAdd" onClick={onClick}>
            Tehtävä
          </ButtonComp>

          <ButtonComp buttonType="createCourse" onClick={onClick} margin={true}>
            Luo kurssi
          </ButtonComp>

          <ButtonComp buttonType="export" onClick={onClick} margin={true}>
            Vie sarja
          </ButtonComp>
        </div>
        <p></p>
        <div>
          <ButtonComp buttonType="addAssignment" onClick={onClick}>
            Ohjelmointitehtävä
          </ButtonComp>
          <ButtonComp buttonType="manage" onClick={onClick} margin={true}>
            Tehtäväselain
          </ButtonComp>
        </div>
        <p></p>
        <div>
          <ButtonComp buttonType="normal" onClick={onClick}>
            Tallenna
          </ButtonComp>
          <ButtonComp buttonType="normalAlt" onClick={onClick} margin={true}>
            Integraatio
          </ButtonComp>
          <ButtonComp buttonType="openCourse" onClick={onClick} margin={true}>
            Avaa kurssi
          </ButtonComp>
        </div>
        <p></p>
        <ButtonComp buttonType="settings" onClick={onClick} margin={true}>
          Asetukset
        </ButtonComp>
        <ButtonComp buttonType="setManage" onClick={onClick} margin={true}>
          Tehtäväsarjat
        </ButtonComp>
        <p></p>
        <NumberInput min={1} max={100} value={value} setValue={setValue} />
        <p></p>
        <InputField isLarge={true} placeholder="Text here..." />
        <InputField isLarge={false} placeholder="Text here..." />
        <p></p>
        <Dropdown
          options={options}
          labelKey="name"
          placeholder="Select..."
          name="dropdown"
        />
        <p></p>
        <SwitchComp checked={checked} setChecked={setChecked} />
        <HelpText text="Help text..." />
        <p></p>
        <SelectedHeader selected={selected} language="FI" />
        <p></p>
        <ModalAlertDelete button="normal" language="FI" />
        <ModalConfirm language="FI" />
        <Button
          variant="solid"
          sx={{
            color: "#00000",
            backgroundColor: "#F8A866",
            "&:hover": { backgroundColor: "#F68C35" },
            padding: "0.1em 1.2em",
            fontSize: "1em",
            minWidth: "7rem",
          }}
          onClick={() => setOpen(true)}
        >
          Avaa popup
        </Button>
        <ModalPopup
          open={open}
          setOpen={setOpen}
          header="Testi"
          content="Testi-ilmoitus"
          language="FI"
        />
      </div>
    </div>
  );
}

export default App;
