import { SupportedLanguages } from "./types";

// Class constants
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

// UI constants
export const buttonMinWidth = "7rem";
export const language = new CurrentLanguage();
export const dividerColor = "#BEBEBE";
