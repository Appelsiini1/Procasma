import React from "react";
import VariationComponent from "../components/VariationComponent";
import { getNextID } from "../helpers/getNextID";

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

export function addVariation(
  variations: Array<React.JSX.Element> | null,
  setVariations: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>
) {
  if (!variations || variations.length < 1) {
    setVariations([<VariationComponent varID="A" key="A" />]);
  } else {
    // list the existing ids
    const varIDs = variations.map((variation) => variation.key);

    // function to get next available varID
    const nextVarID = getNextID(varIDs);
    setVariations([
      ...variations,
      <VariationComponent varID={nextVarID} key={nextVarID} />,
    ]);
  }
}
