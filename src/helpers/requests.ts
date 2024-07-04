import { CodeAssignmentData, ModuleData } from "../types";

export const refreshTitle = async () => {
  try {
    const vers = await window.api.getAppVersion();
    const title = "Procasma " + vers;
    window.api.setTitle(title);
  } catch (error) {
    console.error(error);
  }
};

export const getAssignments = async (activePath: string) => {
  try {
    const assignments: CodeAssignmentData[] = await window.api.getAssignments(
      activePath
    );

    if (!assignments) {
      throw new Error("no assignments");
    }

    return assignments;
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const getModules = async (activePath: string) => {
  try {
    const modules: ModuleData[] = await window.api.getModules(activePath);

    if (!modules) {
      throw new Error("no modules");
    }

    return modules;
  } catch (error) {
    console.error(error);
  }
  return null;
};
