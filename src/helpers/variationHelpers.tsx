export function deleteVariation(
  variations: Array<React.JSX.Element>,
  setVariations: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>,
  varID: string,
  pageType: string
) {
  if (pageType !== "new") {
    // call some function through IPC that deletes it from disk
  } else {
    setVariations((prevVariations) =>
      prevVariations.filter((variation) => variation.key !== varID)
    );
  }
}

interface AccordionComponentProps {
  varID: string;
}

/**
 * Takes in any AccordionComponent (most likely
 * VariationComponent, LevelComponent, or ExampleRun) as a
 * dependency injection.
 */
export function addVariation(
  AccordionComponent: React.ComponentType<AccordionComponentProps>,
  getNextIDfunction: (IDs: string[]) => string,
  variations: Array<React.JSX.Element> | null,
  setVariations: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>
) {
  if (!variations || variations.length < 1) {
    const nextID = getNextIDfunction([]);
    setVariations([<AccordionComponent varID={nextID} key={nextID} />]);
  } else {
    // list the existing ids
    const varIDs = variations.map((variation) => variation.key);

    // function to get next available varID
    const nextID = getNextIDfunction(varIDs);
    setVariations([
      ...variations,
      <AccordionComponent varID={nextID} key={nextID} />,
    ]);
  }
}
