/**
 * Original code by https://github.com/gwuhaolin/chrome-finder
 * License: ISC
 */

import { execSync } from "child_process";
import path from "path";
import { canAccess, newLineRegex, sort } from "./util";

export function darwin() {
  const suffixes = [
    "/Contents/MacOS/Google Chrome Canary",
    "/Contents/MacOS/Google Chrome",
    "/Contents/MacOS/Chromium",
  ];

  const LSREGISTER =
    "/System/Library/Frameworks/CoreServices.framework" +
    "/Versions/A/Frameworks/LaunchServices.framework" +
    "/Versions/A/Support/lsregister";

  const installations: string[] = [];

  execSync(`
    ${LSREGISTER} -dump | grep -E -i -o '/.+(google chrome( canary)?|chromium)\\.app(\\s|$)' | grep -E -v 'Caches|TimeMachine|Temporary|/Volumes|\\.Trash'
  `)
    .toString()
    .split(newLineRegex)
    .forEach((inst) => {
      suffixes.forEach((suffix) => {
        const execPath = path.join(inst.trim(), suffix);
        if (canAccess(execPath)) {
          installations.push(execPath);
        }
      });
    });

  // Retains one per line to maintain readability.
  const priorities = [
    {
      regex: new RegExp(`^${process.env.HOME}/Applications/.*Chromium.app`),
      weight: 49,
    },
    {
      regex: new RegExp(`^${process.env.HOME}/Applications/.*Chrome.app`),
      weight: 50,
    },
    {
      regex: new RegExp(
        `^${process.env.HOME}/Applications/.*Chrome Canary.app`
      ),
      weight: 51,
    },
    { regex: /^\/Applications\/.*Chromium.app/, weight: 99 },
    { regex: /^\/Applications\/.*Chrome.app/, weight: 100 },
    { regex: /^\/Applications\/.*Chrome Canary.app/, weight: 101 },
    { regex: /^\/Volumes\/.*Chromium.app/, weight: -3 },
    { regex: /^\/Volumes\/.*Chrome.app/, weight: -2 },
    { regex: /^\/Volumes\/.*Chrome Canary.app/, weight: -1 },
  ];

  return sort(installations, priorities);
}

module.exports = darwin;
