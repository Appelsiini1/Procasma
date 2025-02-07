import { Apiv2 } from "@codegrade/apiv2-client";
import { CodeLanguage, SettingsType } from "./types";

class CurrentPath {
  private _path: string;

  get path() {
    return this._path;
  }
  set path(newPath: string) {
    this._path = newPath;
  }
}

class Settings implements SettingsType {
  private _codeLanguages: Array<CodeLanguage>;
  private _language: string;
  private _shortenFiles: boolean;
  private _fileMaxLinesDisplay: number;
  private _shortenCode: boolean;

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
  get shortenCode() {
    return this._shortenCode;
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
    this._shortenCode = data.shortenCode;
  }

  toJSON() {
    return {
      codeLanguages: this._codeLanguages,
      language: this._language,
      shortenFiles: this._shortenFiles,
      fileMaxLinesDisplay: this._fileMaxLinesDisplay,
      shortenCode: this._shortenCode,
    };
  }

  toIPC() {
    let newCLS = [];
    for (const cl of this._codeLanguages) {
      const newFileExtension = cl.fileExtensions.join(";");
      newCLS.push({ name: cl.name, fileExtensions: newFileExtension });
    }
    return { ...this.toJSON(), codeLanguages: newCLS };
  }
}

class CodeGradeLoginState {
  private _apiInstance: Apiv2 = null;

  set apiInstance(value: Apiv2) {
    this._apiInstance = value;
  }

  get apiInstance() {
    return this._apiInstance;
  }
}

class WorkerWindowGlobal {
  private _id: number;

  get id() {
    return this._id;
  }
  set id(value: number) {
    this._id = value;
  }
}

export const coursePath = new CurrentPath();
export const globalSettings = new Settings();
export const cgInstance = new CodeGradeLoginState();
export const workerID = new WorkerWindowGlobal();
export const mainWindowID = new WorkerWindowGlobal();
