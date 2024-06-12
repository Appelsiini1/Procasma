import { getNextID } from "../helpers/getNextID";

/**
 * TODO: dependency injection of component to join this
 * helper with "variationHelpers.tsx"
 */
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
 * VariationComponent or LevelComponent) as dependency injection.
 */
export function addVariation(
  AccordionComponent: React.ComponentType<AccordionComponentProps>,
  variations: Array<React.JSX.Element> | null,
  setVariations: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>
) {
  if (!variations || variations.length < 1) {
    setVariations([<AccordionComponent varID="A" key="A" />]);
  } else {
    // list the existing ids
    const varIDs = variations.map((variation) => variation.key);

    // function to get next available varID
    const nextID = getNextID(varIDs);
    setVariations([
      ...variations,
      <AccordionComponent varID={nextID} key={nextID} />,
    ]);
  }
}
