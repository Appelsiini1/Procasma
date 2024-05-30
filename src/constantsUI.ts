import { SupportedLanguages, CourseData } from "./types";
import {
  ui_week,
  ui_module,
  ui_no_module,
  languages,
} from "../resource/texts.json";

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

class CurrentCourse {
  private _title: string;
  private _ID: string;
  private _modules: number;
  private _moduleType: "week" | "module" | null;
  private _language: SupportedLanguages;
  private _codeLanguage: string | null;
  private _CodeGradeID: number;
  private _minLevel: number;
  private _maxLevel: number;
  private _levels: {
    [key: number]: {
      fullName: string;
      abbreviation: string;
    };
  };

  get title() {
    return this._title;
  }
  get ID() {
    return this._ID;
  }
  get modules() {
    return this._modules;
  }
  get moduleType() {
    return this._moduleType;
  }
  get language() {
    return this._language;
  }
  get codeLanguage() {
    return this._codeLanguage;
  }
  get minLevel() {
    return this._minLevel;
  }
  get maxLevel() {
    return this._maxLevel;
  }
  get levels() {
    return this._levels;
  }
  get CodeGradeID() {
    return this._CodeGradeID;
  }
  constructor() {
    // course data should be fetched from file later
    this._title = "Untitled Course";
    this._ID = "0000";
    this._modules = 0;
    this._moduleType = null;
    this._language = "FI";
    this._codeLanguage = null;
    this._CodeGradeID = 0;
    this._minLevel = 0;
    this._maxLevel = 0;
    this._levels = {};
  }

  set values(data: CourseData) {
    this._title = data.title;
    this._ID = data.ID;
    this._modules = data.modules;
    this._moduleType = data.moduleType;
    this._language = data.language;
    this._codeLanguage = data.codeLanguage;
    this._CodeGradeID = data.CodeGradeID;
    this._minLevel = data.minLevel;
    this._maxLevel = data.maxLevel;
    this._levels = data.levels;
  }
}

// UI constants
export const buttonMinWidth = "7rem";
export const largeButtonMinWidth = "18rem";
export const language = new CurrentLanguage();
export const dividerColor = "#BEBEBE";
export const currentCourse = new CurrentCourse();
export const supportedModuleTypes = [ui_week, ui_module, ui_no_module].map(
  (value) => {
    if (value === ui_no_module) {
      return { typeName: value[language.current], isNull: true };
    }
    return { typeName: value[language.current], isNull: false };
  }
);
export const buttonShadow = "1px 1px 3px 1px rgb(0 0 0 / 20%)";
