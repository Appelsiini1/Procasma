import {
  CodeAssignmentData,
  CodeAssignmentSelectionData,
  ExportSetData,
  FullAssignmentSetData,
} from "../types";
import { coursePath } from "../globalsMain";
import path from "path";
import { assignmentDataFolder } from "../constants";
import { handleReadFileFS } from "../mainHelpers/fileOperations";

export function isExpanding(assignment: CodeAssignmentData) {
  if (assignment.next?.length > 0 || assignment.previous?.length > 0) {
    return true;
  }
  return false;
}

export function setToFullData(set: ExportSetData): FullAssignmentSetData {
  let assignmentArray: CodeAssignmentSelectionData[] = [];
  for (const setAssignment of set.assignments) {
    const assigPath = path.join(
      coursePath.path,
      assignmentDataFolder,
      setAssignment.folder,
      setAssignment.id + ".json"
    );
    const fullData = handleReadFileFS(assigPath) as CodeAssignmentData;
    let newAssignment: CodeAssignmentSelectionData = {
      variation: fullData.variations[setAssignment.variationId],
      CGid: setAssignment.CGid,
      selectedPosition: setAssignment.selectedPosition,
      selectedModule: setAssignment.selectedModule,
      assignmentID: fullData.assignmentID,
      level: fullData.level,
      folder: fullData.folder,
      codeLanguage: fullData.codeLanguage,
      title: fullData.title,
    };
    assignmentArray.push(newAssignment);
  }
  const newSet: FullAssignmentSetData = {
    assignmentArray: assignmentArray,
    ...set,
  };
  return newSet;
}
