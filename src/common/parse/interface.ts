export interface IDvaModel {
  namespace: string;
  effects: {
    [name: string]: string;
  };
  reducers: {
    [name: string]: string;
  };
}
