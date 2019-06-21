import { Range, Uri } from 'vscode';
import * as fs from 'mz/fs';
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import {
  isCallExpression,
  isIdentifier,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
} from '@babel/types';
import { Service, Token, Inject } from 'typedi';
import { IVscodeService, VscodeServiceToken } from './../vscodeService';
import { sourceLocationToRange } from '../../common/utils';

interface ModelReference {
  type: string;
  uri: Uri;
  range: Range;
}

export interface IModelReferenceParser {
  parseFile(path: string): Promise<ModelReference[]>;
}

export const ModelReferenceParserToken = new Token<IModelReferenceParser>();

@Service(ModelReferenceParserToken)
// eslint-disable-next-line @typescript-eslint/class-name-casing
class _ModelReferenceParser implements IModelReferenceParser {
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
    const result: ModelReference[] = [];
    traverse(ast, {
      enter(path) {
        const { node } = path;
        if (!isCallExpression(node)) {
          return;
        }
        const { callee } = node;
        if (!isIdentifier(callee) || node.arguments.length !== 1) {
          return;
        }
        if (callee.name !== 'dispatch' && callee.name !== 'put') {
          return;
        }
        const [firstArgument] = node.arguments;
        if (!isObjectExpression(firstArgument)) {
          return;
        }
        firstArgument.properties.forEach(property => {
          if (!isObjectProperty(property)) {
            return;
          }
          const { value, key } = property;
          if (!isIdentifier(key) || key.name !== 'type' || !isStringLiteral(value) || !value.loc) {
            return;
          }
          result.push({
            type: value.value,
            uri: Uri.file(filePath),
            range: sourceLocationToRange(value.loc),
          });
        });
      },
    });
    return result;
  }
}
