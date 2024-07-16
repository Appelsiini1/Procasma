import texts from "../../resource/texts.json";
import { language } from "../globalsUI";

/**
 * Try to convert a ui code into its text form using language.current.
 */
export function parseUICode(ui_code: string): string {
  try {
    const messageTranslated = (texts as any)?.[ui_code]?.[language.current];
    return messageTranslated ?? ui_code;
  } catch {
    return ui_code;
  }
}
