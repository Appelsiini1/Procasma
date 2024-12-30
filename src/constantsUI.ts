import {
  ui_week,
  ui_module,
  ui_no_module,
  ui_lecture,
} from "../resource/texts.json";
import { language } from "./globalsUI";
import { devmode } from "./DEVMODE.json";

// UI constants
export const buttonMinWidth = "7rem";
export const buttonMaxWidth = "16rem";
export const largeButtonMinWidth = "18rem";
export const pageTableMinWidth = "80%";
export const pageTableMaxWidth = "90%";
export const titleCellWidth = "20%";
export const dividerColor = "#BEBEBE";
export const supportedModuleTypes = [
  ui_week,
  ui_module,
  ui_lecture,
  ui_no_module,
].map((value) => {
  if (value === ui_no_module) {
    return { typeName: value[language.current], isNull: true };
  }
  return { typeName: value[language.current], isNull: false };
});
export const buttonShadow = "1px 1px 3px 1px rgb(0 0 0 / 20%)";
export const spacingSX = { marginBottom: "1rem" };
export const dividerSX = {
  padding: ".1rem",
  margin: "2rem",
  bgcolor: dividerColor,
};
export const smallDividerSX = {
  padding: ".1rem",
  margin: "2rem",
  bgcolor: dividerColor,
  marginLeft: "7rem",
  marginRight: "7rem",
};
export const DEVMODE = devmode;
export const COURSE_PERIODS = 4;
