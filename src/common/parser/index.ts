import { IDvaModel } from './interface';
import * as fs from 'mz/fs';
import * as babelParser from '@babel/parser';

interface IDvaModelParser {
  parse(code: string): Promise<IDvaModel>;

  parseFile(path: string): Promise<IDvaModel>;
}

export class DvaModelParser implements IDvaModelParser {
  public async parse(code: string): Promise<IDvaModel> {
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'classProperties'],
    });
    console.log('ast', ast);
    return {
      namespace: 'Demo',
      effects: {},
      reducers: {},
    };
  }

  public async parseFile(path: string): Promise<IDvaModel> {
    const code = await fs.readFile(path, 'utf-8');
    return this.parse(code);
  }
}
