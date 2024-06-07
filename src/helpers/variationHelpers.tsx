import React from "react";
import VariationComponent from "../components/VariationComponent";

export function deleteVariation(
  variations: Array<React.JSX.Element>,
  setVariations: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>,
  varID: string,
  pageType: string
) {
  if (pageType !== "new") {
    // call some function through IPC that deletes it from disk
  } else {
    setVariations(
      variations.filter((element) => (element.key === varID ? false : true))
    );
  }
}

export function addVariation(
  variations: Array<React.JSX.Element> | null,
  setVariations: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>
) {
  if (!variations) {
    setVariations([<VariationComponent varID="A" key="A" />]);
  } else {
    // function to get next available varID
    setVariations([...variations, <VariationComponent varID="B" key="B" />]);
  }
}
