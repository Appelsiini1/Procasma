import {
  SupportedLanguages,
  CourseData,
  CodeLanguage,
  SupportedModuleType,
  SettingsType,
} from "./types";

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
  private _moduleType: SupportedModuleType;
  private _language: SupportedLanguages;
  private _codeLanguage: CodeLanguage | null;
  private _CodeGradeID: number;
  private _minLevel: number;
  private _maxLevel: number;
  private _levels: {
    [key: number]: {
      fullName: string;
      abbreviation: string;
    };
  } | null;

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
    this._title = "Untitled Course";
    this._ID = "0000";
    this._modules = 0;
    this._moduleType = null;
    this._language = "FI";
    this._codeLanguage = {
      name: "Python",
      fileExtensions: [".py"],
    };
    this._CodeGradeID = 0;
    this._minLevel = 0;
    this._maxLevel = 0;
    this._levels = null;
  }

  set values(data: CourseData) {
    this._title = data.title;
    this._ID = data.id;
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

class Settings implements SettingsType {
  private _codeLanguages: Array<CodeLanguage>;
  private _language: string;
  private _shortenFiles: boolean;
  private _fileMaxLinesDisplay: number;

  get codeLanguages() {
    return this._codeLanguages;
  }
  get language() {
    return this._language;
  }
  get shortenFiles() {
    return this._shortenFiles;
  }
  get fileMaxLinesDisplay() {
    return this._fileMaxLinesDisplay;
  }

  constructor() {
    this._codeLanguages = [
      {
        name: "Python",
        fileExtensions: [".py"],
      },
      { name: "C", fileExtensions: [".c", ".h"] },
      { name: "JavaScript", fileExtensions: [".js", ".jsx"] },
      { name: "TypeScript", fileExtensions: [".ts", ".tsx"] },
      { name: "Java", fileExtensions: [".java"] },
    ];
    this._language = "ENG";
    this._shortenFiles = true;
    this._fileMaxLinesDisplay = 15;
  }

  set values(data: SettingsType) {
    this._codeLanguages = data.codeLanguages;
    this._language = data.language;
    this._shortenFiles = data.shortenFiles;
    this._fileMaxLinesDisplay = data.fileMaxLinesDisplay;
  }
  get values() {
    return {
      codeLanguages: this._codeLanguages,
      language: this._language,
      shortenFiles: this._shortenFiles,
      fileMaxLinesDisplay: this._fileMaxLinesDisplay,
    };
  }

  toJSON() {
    return {
      codeLanguages: this._codeLanguages,
      language: this._language,
      shortenFiles: this._shortenFiles,
      fileMaxLinesDisplay: this._fileMaxLinesDisplay,
    };
  }

  fromIPC(data: any) {
    this._language = data.language;
    this._shortenFiles = data.shortenFiles;
    this._fileMaxLinesDisplay = data.fileMaxLinesDisplay;

    // TODO this empties the code languages in the constructor
    /*const newCLS = [];
    for (const cl of data.codeLanguages) {
      newCLS.push({
        name: cl.name,
        fileExtensions: cl.fileExtensions.split(";"),
      });
    }
    this._codeLanguages = newCLS;*/
  }
}

export const language = new CurrentLanguage();
export const currentCourse = new CurrentCourse();
export const globalSettings = new Settings();
