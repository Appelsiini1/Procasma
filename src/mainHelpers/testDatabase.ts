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
    DatabaseFunc.addAssignmentToDB(testPath, testGlobals.testCurrentAssignment)
  );
  console.log("Add assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAssignmentFromDB(
      testPath,
      testGlobals.testCurrentAssignment.assignmentID
    )
  );
  console.log("Get assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.updateAssignmentInDB(
      testPath,
      testGlobals.testCurrentEditedAssignment
    )
  );
  console.log("Assignment update:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAssignmentFromDB(
      testPath,
      testGlobals.testCurrentAssignment.assignmentID
    )
  );
  console.log("Get assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteAssignmentFromDB(
      testPath,
      testGlobals.testCurrentAssignment.assignmentID
    )
  );
  console.log("Delete assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.addModuleToDB(testPath, testGlobals.testModule)
  );
  console.log("Add module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getModuleFromDB(testPath, testGlobals.testModule.ID)
  );
  console.log("Get module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.updateModuleInDB(testPath, testGlobals.testEditedModule)
  );
  console.log("Module update:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getModuleFromDB(testPath, testGlobals.testModule.ID)
  );
  console.log("Get module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteModule(testPath, testGlobals.testModule.ID)
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
    DatabaseFunc.addAssignmentToDB(testPath, testGlobals.testCurrentAssignment)
  );
  console.log("Add assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.addAssignmentToDB(
      testPath,
      testGlobals.testCurrentAssignmentSecond
    )
  );
  console.log("Add assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAllAssignments(testPath)
  );
  console.log("Get all assignments:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAllAssignmentTags(testPath)
  );
  console.log("Get all assignment tags:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteAssignmentFromDB(
      testPath,
      testGlobals.testCurrentAssignment.assignmentID
    )
  );
  console.log("Delete assignment:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteAssignmentFromDB(
      testPath,
      testGlobals.testCurrentAssignmentSecond.assignmentID
    )
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
    DatabaseFunc.addModuleToDB(testPath, testGlobals.testModule)
  );
  console.log("Add module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.addModuleToDB(testPath, testGlobals.testModuleSecond)
  );
  console.log("Add module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAllModules(testPath)
  );
  console.log("Get all modules:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getAllModuleTags(testPath)
  );
  console.log("Get all module tags:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.getModuleCount(testPath)
  );
  console.log("Get module count:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteModule(testPath, testGlobals.testModule.ID)
  );
  console.log("Delete module:");
  console.log(result);

  console.log("-----");
  result = await createMainFunctionHandler(() =>
    DatabaseFunc.deleteModule(testPath, testGlobals.testModuleSecond.ID)
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
