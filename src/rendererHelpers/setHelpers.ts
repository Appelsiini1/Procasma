import { COURSE_PERIODS } from "../constants";
import {
  CourseData,
  ExportSetAssignmentData,
  ExportSetData,
  SetAssignmentWithCheck,
  SetData,
} from "../types";
import { handleIPCResult } from "./errorHelpers";

export function importSetData(
  inSet: ExportSetData,
  allAssignments: SetAssignmentWithCheck[]
): SetData {
  // Deconstructing the set to remove the old assignments
  const { assignments, ...newSet } = inSet;

  const newAssignments = allAssignments.map((a) => {
    const foundAssignment = assignments.find(
      (inAssignment) => inAssignment.id === a.value.assignmentID
    );
    if (foundAssignment) {
      a.selectedModule = foundAssignment.selectedModule;
      a.selectedPosition = foundAssignment.selectedPosition;
      a.selectedVariation = foundAssignment.variationId;
    } else {
      a.selectedModule = -1;
    }
    return a;
  });

  const outSet: SetData = {
    ...newSet,
    assignments: newAssignments,
    targetModule: null,
    targetPosition: null,
  };

  return outSet;
}

export function exportSetData(inSet: SetData): ExportSetData {
  // Deconstructing the set to remove the old attributes
  const { assignments, targetModule, targetPosition, ...newSet } = inSet;

  const assignedAssignments = inSet.assignments.filter(
    (a) => a.selectedModule !== -1
  );

  // Take SetAssignmentWithChecks and convert them to ExportSetAssignmentData
  const newAssignments = assignedAssignments.map((a) => {
    const assignment = a.value;
    const newAssignment = {} as ExportSetAssignmentData;
    newAssignment.id = assignment.assignmentID;
    newAssignment.variationId = a.selectedVariation;
    newAssignment.CGid =
      assignment.variations[a.selectedVariation]?.cgConfig?.id;
    newAssignment.selectedModule = a.selectedModule;
    newAssignment.selectedPosition = a.selectedPosition;
    newAssignment.folder = assignment.folder;
    return newAssignment;
  });

  const outSet: ExportSetData = {
    ...newSet,
    assignments: newAssignments,
  };
  return outSet;
}

/**
 * Calculate a relative badness for each variation
 */
export function calculateBadnesses(assignments: SetAssignmentWithCheck[]) {
  const currentYear = new Date().getFullYear();
  let earliestYear = currentYear;
  let totalPeriods = 4;

  // Get the earliest year
  assignments.forEach((a) => {
    const assignment = a.value;

    Object.keys(assignment.variations).map((key) => {
      const usedIn = assignment.variations[key].usedIn;

      usedIn.forEach((used) => {
        const usedSplit = used.split("/");
        const usedYear = Number(usedSplit[0]);

        earliestYear = usedYear < earliestYear ? usedYear : earliestYear;
        return;
      });
      return;
    });
  });

  totalPeriods = (currentYear - earliestYear) * COURSE_PERIODS;

  // Calculate badnesses
  assignments.map((a) => {
    const assignment = a.value;

    // loop through variations
    Object.keys(assignment.variations).map((key) => {
      const variation = assignment.variations[key];
      const usedIn = variation.usedIn;

      let latestYear = earliestYear;
      let latestPeriod = 1;

      // use the latest usedIn entry by checking
      // if latest year then if latest period
      usedIn.forEach((used) => {
        const usedSplit = used.split("/");
        const usedYear = Number(usedSplit[0]);
        const usedPeriod = Number(usedSplit[1]);

        if (usedYear >= latestYear) {
          latestYear = usedYear;
          latestPeriod = usedPeriod;
        }
      });

      const badness: number =
        (latestYear - earliestYear) * COURSE_PERIODS + latestPeriod;
      const normalizedBadness: number = badness / totalPeriods;

      // add the badness value to the variation within allAssignments
      variation.usedInBadness = normalizedBadness;
      return;
    });
  });
  return assignments;
}

export async function exportSetToDisk(
  exportedSet: ExportSetData,
  activeCourse: CourseData
) {
  let snackbarSeverity = "success";
  let snackbarText = "ui_export_success";
  try {
    const savePath = await handleIPCResult(() => window.api.selectDir());
    if (savePath !== "") {
      await handleIPCResult(() =>
        window.api.exportSetFS(exportedSet, activeCourse, savePath)
      );
    } else {
      snackbarSeverity = "info";
      snackbarText = "ui_action_canceled";
    }
  } catch (err) {
    snackbarText = err.message;
    snackbarSeverity = "error";
    throw err;
  }
  return { snackbarText: snackbarText, snackbarSeverity: snackbarSeverity };
}
