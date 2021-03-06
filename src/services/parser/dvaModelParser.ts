import { VscodeServiceToken, IVscodeService } from './../vscodeService';
import { IDvaModel } from '../../common/types';
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
  isCallExpression,
} from '@babel/types';
import generate from '@babel/generator';
import { Service, Token, Inject } from 'typedi';

export interface IDvaModelParser {
  parseFile(path: string): Promise<IDvaModel[]>;
}

export const DvaModelParserToken = new Token<IDvaModelParser>();

@Service(DvaModelParserToken)
// eslint-disable-next-line @typescript-eslint/class-name-casing
class _DvaModelParser implements IDvaModelParser {
  public readonly vscodeService: IVscodeService;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.vscodeService = vscodeService;
  }

  public async parseFile(path: string): Promise<IDvaModel[]> {
    const code = await fs.readFile(path, 'utf-8');
    const config = this.vscodeService.getConfig(path);
    if (!config) {
      return [];
    }
    const ast = babelParser.parse(code, config.parserOptions);
    let modelObjects: ObjectExpression[] = [];
    for (const node of ast.program.body) {
      let model: Node = node;
      if (isExportDefaultDeclaration(model)) {
        model = model.declaration;
      }
      if (isObjectExpression(model)) {
        modelObjects.push(model);
      }
      if (isCallExpression(model)) {
        const args = model.arguments.filter((o): o is ObjectExpression => isObjectExpression(o));
        modelObjects.push(...args);
      }
    }
    return modelObjects.map(o => this.parseObjectExpression(o)).filter(o => !!o) as IDvaModel[];
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
    if (Object.keys(result.effects).length === 0 && Object.keys(result.reducers).length === 0) {
      return null;
    }
    return result;
  }
}
