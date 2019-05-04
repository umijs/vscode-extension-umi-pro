interface CodeWithLoc {
  code: string;
  loc: {
    start: {
      line: number;
      column: number;
    };
    end: {
      line: number;
      column: number;
    };
  };
}

export interface IDvaModel {
  namespace: string;
  effects: {
    [name: string]: CodeWithLoc;
  };
  reducers: {
    [name: string]: CodeWithLoc;
  };
}

export interface IDvaModelWithFilePath extends IDvaModel {
  filePath: string;
}
