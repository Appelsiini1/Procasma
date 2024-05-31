import React from "react";
import VariationComponent from "../components/VariationComponent";

export class VariationAccordion {
  private _variationAccordion: Array<React.JSX.Element> = null;
  private _setAccordion: React.Dispatch<
    React.SetStateAction<React.JSX.Element[]>
  > = null;
  private _pageType: unknown = null;

  constructor(
    accordion: Array<React.JSX.Element>,
    setAccordion: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>,
    pageType: unknown
  ) {
    this._variationAccordion = accordion;
    this._setAccordion = setAccordion;
    this._pageType = pageType;
    // add existing vars
  }

  deleteVariation(varID: string) {
    if (this._pageType !== "new") {
      // call some function through IPC that deletes it from disk
    } else {
      this._setAccordion(
        this._variationAccordion.filter((element) =>
          element.key === varID ? false : true
        )
      );
    }
  }

  addVariation() {
    if (!this._variationAccordion) {
      this._setAccordion([
        <VariationComponent varID="A" key="A" self={this} />,
      ]);
    } else {
      // function to get next available varID
      this._setAccordion([
        ...this._variationAccordion,
        <VariationComponent varID="B" key="B" self={this} />,
      ]);
    }
  }
}
