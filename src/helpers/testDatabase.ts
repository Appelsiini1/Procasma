import * as DatabaseFunc from "../helpers/databaseOperations";
import * as testGlobals from "../myTestGlobals";

async function originalTests(testPath: string) {
  let result: any = await DatabaseFunc.initDB(testPath);

  console.log("Database init:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.addAssignmentToDatabase(
    testPath,
    testGlobals.testCurrentAssignment
  );
  console.log("Add assignment:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.getAssignmentFromDatabase(
    testPath,
    testGlobals.testCurrentAssignment.assignmentID
  );
  console.log("Get assignment:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.updateAssignmentToDatabase(
    testPath,
    testGlobals.testCurrentEditedAssignment
  );
  console.log("Assignment update:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.getAssignmentFromDatabase(
    testPath,
    testGlobals.testCurrentAssignment.assignmentID
  );
  console.log("Get assignment:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.deleteAssignmentFromDatabase(
    testPath,
    testGlobals.testCurrentAssignment.assignmentID
  );
  console.log("Delete assignment:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.addModuleToDatabase(
    testPath,
    testGlobals.testModule
  );
  console.log("Add module:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.getModuleFromDatabase(
    testPath,
    testGlobals.testModule.ID
  );
  console.log("Get module:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.updateModuleToDatabase(
    testPath,
    testGlobals.testEditedModule
  );
  console.log("Module update:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.getModuleFromDatabase(
    testPath,
    testGlobals.testModule.ID
  );
  console.log("Get module:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.deleteModule(testPath, testGlobals.testModule.ID);
  console.log("Delete module:");
  console.log(result);
}

async function assignmentTests(testPath: string) {
  let result: any = await DatabaseFunc.initDB(testPath);

  console.log("Database init:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.addAssignmentToDatabase(
    testPath,
    testGlobals.testCurrentAssignment
  );
  console.log("Add assignment:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.addAssignmentToDatabase(
    testPath,
    testGlobals.testCurrentAssignmentSecond
  );
  console.log("Add assignment:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.getAllAssignments(testPath);
  console.log("Get all assignments:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.getAllAssignmentTags(testPath);
  console.log("Get all assignment tags:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.deleteAssignmentFromDatabase(
    testPath,
    testGlobals.testCurrentAssignment.assignmentID
  );
  console.log("Delete assignment:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.deleteAssignmentFromDatabase(
    testPath,
    testGlobals.testCurrentAssignmentSecond.assignmentID
  );
  console.log("Delete assignment:");
  console.log(result);
}

async function moduleTests(testPath: string) {
  let result: any = await DatabaseFunc.initDB(testPath);

  console.log("Database init:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.addModuleToDatabase(
    testPath,
    testGlobals.testModule
  );
  console.log("Add module:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.addModuleToDatabase(
    testPath,
    testGlobals.testModuleSecond
  );
  console.log("Add module:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.getAllModules(testPath);
  console.log("Get all modules:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.getAllModuleTags(testPath);
  console.log("Get all module tags:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.getModuleCount(testPath);
  console.log("Get module count:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.deleteModule(testPath, testGlobals.testModule.ID);
  console.log("Delete module:");
  console.log(result);

  console.log("-----");
  result = await DatabaseFunc.deleteModule(
    testPath,
    testGlobals.testModuleSecond.ID
  );
  console.log("Delete module:");
  console.log(result);
}

export async function testDatabase() {
  //const testPath = "C:\\Users\\ramis\\Documents\\Procasma database test";
  const testPath = "C:\\Users\\Elias\\Documents\\DEV\\Procasma\\";
  //   const dbPromise = new Promise((resolve, reject) => {
  //     let value = DatabaseFunc.initDB(testPath);
  //     resolve(value);
  //   });
  //   dbPromise.then((value: { content: any; error: any }) => {

  //   });

  //originalTests(testPath);
  //assignmentTests(testPath);
  moduleTests(testPath);
}
