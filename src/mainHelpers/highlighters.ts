import log from "electron-log/node";
import { extname, basename } from "node:path";

// Highlight JS
import hljs from "highlight.js/lib/core";

/**
 * Registers a language to use with HLJS
 * @param language Language to register. Defaults to plaintext.
 * @returns Returns the language registered.
 */
function _registerLanguage(language: string) {
  //register the languages you need
  //   if (hljs.getLanguage(language) !== null) return;
  switch (language.toLowerCase()) {
    case "python":
      const python = require("highlight.js/lib/languages/python");
      hljs.registerLanguage("python", python);
      break;
    case "c":
      const c = require("highlight.js/lib/languages/c");
      hljs.registerLanguage("c", c);
      break;
    case "makefile":
      const makefile = require("highlight.js/lib/languages/makefile");
      hljs.registerLanguage("makefile", makefile);
      break;
    case "javascript":
      const javascript = require("highlight.js/lib/languages/javascript");
      hljs.registerLanguage("javascript", javascript);
      break;
    case "typescript":
      const typescript = require("highlight.js/lib/languages/typescript");
      hljs.registerLanguage("typescript", typescript);
      break;
    case "plaintext":
      const plaintext = require("highlight.js/lib/languages/plaintext");
      hljs.registerLanguage("plaintext", plaintext);
      break;
    case "json":
      const json = require("highlight.js/lib/languages/json");
      hljs.registerLanguage("json", json);
      break;
    case "java":
      const java = require("highlight.js/lib/languages/java");
      hljs.registerLanguage("java", java);
      break;
    default:
      const plaintext2 = require("highlight.js/lib/languages/plaintext");
      hljs.registerLanguage("plaintext", plaintext2);
      language = "plaintext";
      break;
  }
  return language;
}

/**
 * Formats a string into HTML with language-spesific highlighting
 * @param code String to highlight
 * @param language Language to use in highlighting
 * @returns HTML string
 */
export function highlightCode(code: string, language: string): string {
  try {
    language = _registerLanguage(language);
    let block = `<div class="code-background"><div class="code-inner-container"><pre><code class="hljs">`;
    block += hljs.highlight(code, { language: language }).value;
    block += `</code></pre></div></div>`;
    return block;
  } catch (err) {
    log.error("Error in highlightCode(): " + err.message);
    throw err;
  }
}

export function parseLanguage(filePath: string, defaultLanguage: string) {
  const extension = extname(filePath);
  let language: string;

  switch (extension.toLowerCase()) {
    case ".json":
      language = "json";
      break;

    case ".c":
      language = "c";
      break;

    case ".py":
      language = "python";
      break;

    case "":
      const base = basename(filePath).toLowerCase();
      if (base === "makefile" || base === "make") {
        language = "makefile";
      } else {
        language = "plaintext";
      }

    default:
      language = defaultLanguage;
      break;
  }

  return language;
}
