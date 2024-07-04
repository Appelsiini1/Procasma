import * as DatabaseFunc from "../helpers/databaseOperations";
import * as testGlobals from "../myTestGlobals";

export function testDatabase() {
  const testPath = "C:\\Users\\ramis\\Documents\\Procasma database test";
  //   const dbPromise = new Promise((resolve, reject) => {
  //     let value = DatabaseFunc.initDB(testPath);
  //     resolve(value);
  //   });
  //   dbPromise.then((value: { content: any; error: any }) => {

  //   });
  console.log(`Database init: ${DatabaseFunc.initDB(testPath).content}`);
  console.log(
    `Add assignment: ${
      DatabaseFunc.addAssignmentToDatabase(
        testPath,
        testGlobals.testCurrentAssignment
      ).content
    }`
  );
}
