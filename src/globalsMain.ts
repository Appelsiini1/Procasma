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
  private _chromePath: string;

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
  get chromePath() {
    return this._chromePath;
  }
  set chromePath(path: string) {
    this._chromePath = path;
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
    this._chromePath = null;
  }

  set values(data: SettingsType) {
    this._codeLanguages = data.codeLanguages;
    this._language = data.language;
    this._shortenFiles = data.shortenFiles;
    this._fileMaxLinesDisplay = data.fileMaxLinesDisplay;
    this._chromePath = data.chromePath;
  }

  toJSON() {
    return {
      codeLanguages: this._codeLanguages,
      language: this._language,
      shortenFiles: this._shortenFiles,
      fileMaxLinesDisplay: this._fileMaxLinesDisplay,
      chromePath: this._chromePath,
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

export const coursePath = new CurrentPath();
export const globalSettings = new Settings();
