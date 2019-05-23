import { Range, Uri, Position } from 'vscode';
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

interface ModelReference {
  type: string;
  uri: Uri;
  range: Range;
}

export interface IModelReferenceParser {
  parseFile(path: string): Promise<ModelReference[]>;
}

export class ModelReferenceParser implements IModelReferenceParser {
  public async parseFile(filePath: string) {
    const code = await fs.readFile(filePath, 'utf-8');
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
            range: new Range(
              new Position(value.loc.start.line - 1, value.loc.start.column),
              new Position(value.loc.end.line - 1, value.loc.end.column)
            ),
          });
        });
      },
    });
    return result;
  }
}
