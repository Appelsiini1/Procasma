class CurrentPath {
  private _path: string;

  get path() {
    return this._path;
  }
  set path(newPath: string) {
    this._path = newPath;
  }
}

export const coursePath = new CurrentPath();
