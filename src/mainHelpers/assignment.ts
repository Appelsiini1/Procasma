import { CodeAssignmentData } from "../types";

export function isExpanding(assignment: CodeAssignmentData) {
  if (assignment.next || assignment.previous) {
    return true;
  }
  return false;
}
