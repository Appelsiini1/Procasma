import log from "electron-log/node";
import { CodeAssignmentData } from "../types";
import { deepCopy } from "../rendererHelpers/utility";
import {
  defaultATv2Config,
  defaultConnectRubric,
  defaultIoTest,
  defaultSimpleMatch,
} from "../defaultObjects";
import util from "util";

export function generateATv2Config(assignment: CodeAssignmentData) {
  try {
    console.log("generateATv2Config, assignment: ", assignment);
    Object.keys(assignment.variations).map((VarID) => {
      const exampleRuns = assignment.variations[VarID].exampleRuns;

      // Instantiate a new config for the variation
      const ATv2Config = deepCopy(defaultATv2Config);
      const connectRubric = deepCopy(defaultConnectRubric);
      const ioTest = deepCopy(defaultIoTest);

      Object.keys(exampleRuns).map((RunID) => {
        const run = exampleRuns[RunID];
        console.log("RunID: ", RunID);
        console.log("inputs: ", run.inputs);
        console.log("cmdInputs: ", run.cmdInputs);
        console.log("output: ", run.output);

        // Instantiate a simpleMatch test for the example run
        const simpleMatch = deepCopy(defaultSimpleMatch);
        simpleMatch.simpleMatch.inputText = run.inputs.join("\n");
        simpleMatch.simpleMatch.outputText = run.output;

        ioTest.ioTest.children.push(simpleMatch);
      });

      connectRubric.connectRubric.children.push(ioTest);

      ATv2Config.test.steps.push(connectRubric);

      // Add files to setup uploadfiles files list

      console.log("ATv2Config: ");
      console.log(
        util.inspect(ATv2Config, false, null, true /* enable colors */)
      );
    });
    return;
  } catch (err) {
    log.error("Error in generateATv2Config():", err.message);
    throw err;
  }
}
