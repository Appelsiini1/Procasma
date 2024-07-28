import * as DatabaseFunc from "./databaseOperations";
import * as testGlobals from "../myTestGlobals";
import { createMainFunctionHandler } from "./ipcHelpers";

async function originalTests(testPath: string) {
  let result: any = await createMainFunctionHandler(() =>
    DatabaseFunc.initDB(testPath)
  );

  console.log("Database init:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.addAssignmentDB(testPath, testGlobals.testCurrentAssignment)
  );
  console.log("Add assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAssignmentsDB(testPath, [
      testGlobals.testCurrentAssignment.assignmentID,
    ])
  );
  console.log("Get assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.updateAssignmentDB(
      testPath,
      testGlobals.testCurrentEditedAssignment
    )
  );
  console.log("Assignment update:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAssignmentsDB(testPath, [
      testGlobals.testCurrentAssignment.assignmentID,
    ])
  );
  console.log("Get assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteAssignmentsDB(testPath, [
      testGlobals.testCurrentAssignment.assignmentID,
    ])
  );
  console.log("Delete assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.addModuleDB(testPath, testGlobals.testModule)
  );
  console.log("Add module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getModulesDB(testPath, [testGlobals.testModule.id])
  );
  console.log("Get module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.updateModuleDB(testPath, testGlobals.testEditedModule)
  );
  console.log("Module update:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getModulesDB(testPath, [testGlobals.testModule.id])
  );
  console.log("Get module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteModulesDB(testPath, [testGlobals.testModule.id])
  );
  console.log("Delete module:");
  console.log(result);
}

async function assignmentTests(testPath: string) {
  let result: any = await createMainFunctionHandler(() =>
    DatabaseFunc.initDB(testPath)
  );

  console.log("Database init:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.addAssignmentDB(testPath, testGlobals.testCurrentAssignment)
  );
  console.log("Add assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.addAssignmentDB(
      testPath,
      testGlobals.testCurrentAssignmentSecond
    )
  );
  console.log("Add assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAssignmentsDB(testPath)
  );
  console.log("Get all assignments:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAssignmentTagsDB(testPath)
  );
  console.log("Get all assignment tags:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteAssignmentsDB(testPath, [
      testGlobals.testCurrentAssignment.assignmentID,
    ])
  );
  console.log("Delete assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteAssignmentsDB(testPath, [
      testGlobals.testCurrentAssignmentSecond.assignmentID,
    ])
  );
  console.log("Delete assignment:");
  console.log(result);
}

async function moduleTests(testPath: string) {
  let result: any = await createMainFunctionHandler(() =>
    DatabaseFunc.initDB(testPath)
  );

  console.log("Database init:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.addModuleDB(testPath, testGlobals.testModule)
  );
  console.log("Add module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.addModuleDB(testPath, testGlobals.testModuleSecond)
  );
  console.log("Add module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getModulesDB(testPath)
  );
  console.log("Get all modules:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getModuleTagsDB(testPath)
  );
  console.log("Get all module tags:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getModuleCountDB(testPath)
  );
  console.log("Get module count:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteModulesDB(testPath, [testGlobals.testModule.id])
  );
  console.log("Delete module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteModulesDB(testPath, [testGlobals.testModuleSecond.id])
  );
  console.log("Delete module:");
  console.log(result);
}

export async function testDatabase() {
  //const testPath = "C:\\Users\\ramis\\Documents\\Procasma database test";
  const testPath = "C:\\Users\\Elias\\Documents\\DEV\\Procasma\\";

  //originalTests(testPath);
  //assignmentTests(testPath);
  //moduleTests(testPath);
}
