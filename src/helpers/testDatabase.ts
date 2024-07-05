import * as DatabaseFunc from "../helpers/databaseOperations";
import * as testGlobals from "../myTestGlobals";

export async function testDatabase() {
  const testPath = "C:\\Users\\ramis\\Documents\\Procasma database test";
  //   const dbPromise = new Promise((resolve, reject) => {
  //     let value = DatabaseFunc.initDB(testPath);
  //     resolve(value);
  //   });
  //   dbPromise.then((value: { content: any; error: any }) => {

  //   });

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
