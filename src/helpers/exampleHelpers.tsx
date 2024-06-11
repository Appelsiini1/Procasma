import ExampleRun from "../components/ExampleRun";
import { getNextIDNumeric } from "./getNextID";

export function addExampleRun(
  exampleAccordion: Array<React.JSX.Element>,
  setExampleAccordion: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>
) {
  if (!exampleAccordion) {
    setExampleAccordion([<ExampleRun runID="1" key="1" />]);
  } else {
    // list the existing ids
    const runIDs = exampleAccordion.map((element) => element.key);

    // function to get next available runID
    const nextRunID = getNextIDNumeric(runIDs);
    setExampleAccordion([
      ...exampleAccordion,
      <ExampleRun runID={nextRunID} key={nextRunID} />,
    ]);
  }
}

export function deleteExampleRun(
  setExampleAccordion: React.Dispatch<
    React.SetStateAction<React.JSX.Element[]>
  >,
  key: string
) {
  setExampleAccordion((prevExamples) =>
    prevExamples.filter((example) => example.key !== key)
  );
}
