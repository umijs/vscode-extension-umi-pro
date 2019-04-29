export interface IDvaModel {
  namespace: string;
  effects: {
    [name: string]: {
      code: string;
    };
  };
  reducers: {
    [name: string]: {
      code: string;
    };
  };
}
