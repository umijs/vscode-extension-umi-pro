import { IDvaModel } from './../types';
import * as fs from 'mz/fs';
import * as babelParser from '@babel/parser';
import {
  isExportDefaultDeclaration,
  isObjectExpression,
  ObjectExpression,
  Node,
  isObjectProperty,
  isStringLiteral,
  isObjectMethod,
} from '@babel/types';
import generate from '@babel/generator';

export interface IDvaModelParser {
  parse(code: string): Promise<IDvaModel[]>;

  parseFile(path: string): Promise<IDvaModel[]>;
}

export class DvaModelParser implements IDvaModelParser {
  public async parse(code: string): Promise<IDvaModel[]> {
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'classProperties',
        'dynamicImport',
        'jsx',
        [
          'decorators',
          {
            decoratorsBeforeExport: true,
          },
        ],
      ],
    });
    let modelObjects: ObjectExpression[] = [];
    for (const node of ast.program.body) {
      let model: Node = node;
      if (isExportDefaultDeclaration(model)) {
        model = model.declaration;
      }
      if (isObjectExpression(model)) {
        modelObjects.push(model);
      }
    }
    return modelObjects
      .map(o => this.parseObjectExpression(o))
      .filter(o => !!o) as IDvaModel[];
  }

  public async parseFile(path: string): Promise<IDvaModel[]> {
    const code = await fs.readFile(path, 'utf-8');
    return this.parse(code);
  }
  private parseObjectExpression(ast: ObjectExpression): IDvaModel | null {
    const result: IDvaModel = {
      namespace: '',
      effects: {},
      reducers: {},
    };
    ast.properties.forEach(property => {
      if (!isObjectProperty(property)) {
        return;
      }
      const key = property.key.name;
      if (key === 'namespace' && isStringLiteral(property.value)) {
        result.namespace = property.value.value;
        return;
      }
      let isEffectsOrReducers = key === 'effects' || key === 'reducers';
      if (isEffectsOrReducers && isObjectExpression(property.value)) {
        const { value } = property;
        value.properties.forEach(valueProperty => {
          if (!isObjectMethod(valueProperty)) {
            return;
          }
          const methodName = valueProperty.key.name;
          const { code } = generate(valueProperty);
          const { loc } = valueProperty;
          result[key][methodName] = {
            code,
            loc,
          };
        });
      }
    });
    if (!result.namespace) {
      return null;
    }
    if (
      Object.keys(result.effects).length === 0 &&
      Object.keys(result.reducers).length === 0
    ) {
      return null;
    }
    return result;
  }
}
