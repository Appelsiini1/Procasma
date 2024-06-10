import React from "react";
import LevelComponent from "../components/LevelComponent";

export function deleteLevel(
  levels: Array<React.JSX.Element>,
  setLevels: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>,
  levelID: string,
  pageType: string
) {
  if (pageType !== "new") {
    // call some function through IPC that deletes it from disk
  } else {
    setLevels(
      levels.filter((element) => (element.key === levelID ? false : true))
    );
  }
}

export function addLevel(
  levels: Array<React.JSX.Element> | null,
  setLevels: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>
) {
  if (!levels) {
    setLevels([<LevelComponent levelID="A" key="A" />]);
  } else {
    // function to get next available levelID
    setLevels([...levels, <LevelComponent levelID="B" key="B" />]);
  }
}
