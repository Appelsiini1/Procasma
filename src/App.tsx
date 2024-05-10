import React from "react";
import ButtonComp from "./components/Button";
import CounterButtons from "./components/CounterButtons";

function App() {
  function onClick() {
    console.log("Button clicked!");
  }
  return (
    <div>
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
      <CounterButtons onDecrement={onClick} onIncrement={onClick} />
      <ButtonComp buttonType="settings" onClick={onClick} margin={true}>
        Asetukset
      </ButtonComp>
      <ButtonComp buttonType="setManage" onClick={onClick} margin={true}>
        Tehtäväsarjat
      </ButtonComp>
    </div>
  );
}

export default App;
