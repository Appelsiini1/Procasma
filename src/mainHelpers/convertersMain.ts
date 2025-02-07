export function spacesToUnderscores(input: string): string {
  return input.replace(/ /g, "_");
}

export function cssToString(css: any): string {
  let cssString = "";

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);

  for (const rule of sheet.cssRules) {
    cssString += String(rule);
  }

  return cssString;
}
