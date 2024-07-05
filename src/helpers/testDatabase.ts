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

  const result = await DatabaseFunc.initDB(testPath);

  console.log("Database init:");
  console.log(result);

  DatabaseFunc.addAssignmentToDatabase(
    testPath,
    testGlobals.testCurrentAssignment
  );
}
