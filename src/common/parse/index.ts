import { IDvaModel } from './interface';

interface IDvaModelParser {
  parse(code: string): Promise<IDvaModel>;
}

export class DvaModelParser implements IDvaModelParser {
  public async parse(_code: string): Promise<IDvaModel> {
    return {
      namespace: 'Demo',
      effects: {},
      reducers: {},
    };
  }
}
