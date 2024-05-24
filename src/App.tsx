import { useState } from "react";
import ButtonComp from "./components/Button";
import NumberInput from "./components/NumberInput";
import InputField from "./components/InputField";
import Dropdown from "./components/Dropdown";
import SwitchComp from "./components/Switch";
import HelpText from "./components/HelpText";
import SelectedHeader from "./components/SelectedHeader";
import PageHeaderBar from "./components/PageHeaderBar";
import ItemList from "./components/ItemList";

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
  return (
    <div>
      <PageHeaderBar pageName="Main Menu" courseName="CT00A0000 jtoantiantaontao" />
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
      </div>
      <p></p>
      {/* <ItemList language="FI" /> */}
    </div>
  );
}

export default App;
