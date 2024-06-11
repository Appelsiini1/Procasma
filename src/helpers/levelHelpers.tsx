import React from "react";
import LevelComponent from "../components/LevelComponent";
import { getNextID } from "../helpers/getNextID";

/**
 * TODO: dependency injection of component to join this
 * helper with "variationHelpers.tsx"
 */
export function deleteLevel(
  levels: Array<React.JSX.Element>,
  setLevels: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>,
  levelID: string,
  pageType: string
) {
  if (pageType !== "new") {
    // call some function through IPC that deletes it from disk
  } else {
    setLevels((prevLevels) =>
      prevLevels.filter((level) => level.key !== levelID)
    );
  }
}

export function addLevel(
  levels: Array<React.JSX.Element> | null,
  setLevels: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>
) {
  if (!levels || levels.length < 1) {
    setLevels([<LevelComponent levelID="A" key="A" />]);
  } else {
    // list the existing ids
    const varIDs = levels.map((variation) => variation.key);

    // function to get next available varID
    const nextLevelID = getNextID(varIDs);
    setLevels([
      ...levels,
      <LevelComponent levelID={nextLevelID} key={nextLevelID} />,
    ]);
  }
}
