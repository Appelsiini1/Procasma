import { SupportedLanguages } from "../types";
import texts from "../../resource/texts.json";

class CurrentLanguage {
  _language: SupportedLanguages;

  set current(newLanguage: SupportedLanguages) {
    this._language = newLanguage;
  }
  get current() {
    return this._language;
  }

  constructor() {
    this._language = "FI";
  }
}

export const language = new CurrentLanguage();

export function parseUICodeMain(ui_code: string): string {
  try {
    const messageTranslated = (texts as any)?.[ui_code]?.[language.current];
    return messageTranslated ?? ui_code;
  } catch {
    return ui_code;
  }
}
