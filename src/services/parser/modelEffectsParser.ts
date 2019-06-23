import { Range } from 'vscode';
import * as fs from 'mz/fs';
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import {
  ObjectMethod,
  isObjectPattern,
  isFunctionExpression,
  isObjectMethod,
  FunctionExpression,
  isObjectProperty,
  isIdentifier,
  isCallExpression,
  identifier,
  objectProperty,
  objectPattern,
} from '@babel/types';
import { Service, Token, Inject } from 'typedi';
import { IVscodeService, VscodeServiceToken } from './../vscodeService';
import { isNotNull, sourceLocationToRange } from '../../common/utils';
import generate from '@babel/generator';
import { isEqual } from 'lodash';

interface ModelEffectsCode {
  range: Range;
  code: string;
}

export interface IModelEffectsParser {
  parseFile(path: string): Promise<ModelEffectsCode[]>;
}

export const ModelEffectsParserToken = new Token<IModelEffectsParser>();

const reduxSagaEffectsCommands = ['put', 'call', 'select', 'cancel', 'take'];

@Service(ModelEffectsParserToken)
// eslint-disable-next-line @typescript-eslint/class-name-casing
class _ModelEffectParser implements IModelEffectsParser {
  public readonly vscodeService: IVscodeService;

  constructor(
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.vscodeService = vscodeService;
  }

  public async parseFile(filePath: string) {
    const code = await fs.readFile(filePath, 'utf-8');
    const config = this.vscodeService.getConfig(filePath);
    if (!config) {
      return [];
    }
    const ast = babelParser.parse(code, config.parserOptions);
    const result: ModelEffectsCode[] = [];
    const {
      isDvaEffects,
      isDvaModelCreatorEffects,
      getEffectsCommands,
      getParamsEffectsCommands,
    } = this;
    traverse(ast, {
      enter(path) {
        const { node } = path;
        if (isDvaEffects(node) || isDvaModelCreatorEffects(node)) {
          if (!node.loc) {
            return;
          }
          const effectsCommands = getEffectsCommands(node);
          if (isNotNull(effectsCommands) && effectsCommands.length > 0) {
            const paramsEffectsCommands = getParamsEffectsCommands(node) || [];
            if (isEqual(effectsCommands.sort(), paramsEffectsCommands.sort())) {
              return;
            }
            let [action] = node.params;
            if (!action) {
              node.params[0] = identifier('_');
            }
            node.params[1] = objectPattern(
              effectsCommands.map(key => {
                return objectProperty(identifier(key), identifier(key), false, true);
              })
            );
            const { code } = generate(node, { retainLines: true });
            const codeArray: string[] = code.split('\n');
            let i = 0;
            while (!codeArray[i]) {
              i++;
            }
            result.push({
              range: sourceLocationToRange(node.loc),
              code: codeArray.slice(i).join('\n'),
            });
          }
        }
      },
    });
    return result;
  }

  private isDvaEffects(node: any): node is ObjectMethod {
    if (isObjectMethod(node) && node.generator) {
      return true;
    }
    return false;
  }

  private isDvaModelCreatorEffects(node: any): node is FunctionExpression {
    if (isFunctionExpression(node) && node.generator) {
      return true;
    }
    return false;
  }

  private getEffectsCommands(node: ObjectMethod | FunctionExpression): string[] {
    const effectsCommands = new Set<string>();
    traverse(
      node,
      {
        YieldExpression(path) {
          const { node } = path;
          const { argument } = node;
          if (!isCallExpression(argument)) {
            return;
          }
          const { callee } = argument;
          if (!isIdentifier(callee)) {
            return;
          }
          if (reduxSagaEffectsCommands.some(o => o === callee.name)) {
            effectsCommands.add(callee.name);
          }
        },
      },
      {}
    );
    return Array.from(effectsCommands);
  }

  private getParamsEffectsCommands(node: ObjectMethod | FunctionExpression) {
    const effectsCommandsNode = node.params[1];
    if (!effectsCommandsNode || !isObjectPattern(effectsCommandsNode)) {
      return null;
    }
    return effectsCommandsNode.properties
      .map(o => {
        if (isObjectProperty(o) && isIdentifier(o.key)) {
          return o.key.name;
        }
        return null;
      })
      .filter((o): o is string => !!o);
  }
}
