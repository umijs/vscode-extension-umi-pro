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
import { IModelInfoCache } from '../cache';

interface ModelReference {
  namespace: string;
  actionType: string;
  uri: Uri;
  range: Range;
}

export interface IModelReferenceParser {
  parseFile(path: string): Promise<ModelReference[]>;
}

export class ModelReferenceParser implements IModelReferenceParser {
  private cache: IModelInfoCache;

  constructor(cache: IModelInfoCache) {
    this.cache = cache;
  }

  public async parseFile(filePath: string) {
    const code = await fs.readFile(filePath, 'utf-8');
    const fileNamespace = this.cache.getCurrentNameSpace(filePath);
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'classProperties',
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
    try {
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
            if (
              !isIdentifier(key) ||
              key.name !== 'type' ||
              !isStringLiteral(value) ||
              !value.loc
            ) {
              return;
            }
            let namespace;
            let actionType;
            if (value.value.includes('/')) {
              [namespace, actionType] = value.value.split('/');
            } else {
              namespace = fileNamespace;
              actionType = value.value;
            }
            result.push({
              namespace,
              actionType,
              uri: Uri.file(filePath),
              range: new Range(
                new Position(value.loc.start.line - 1, value.loc.start.column),
                new Position(value.loc.end.line - 1, value.loc.end.column)
              ),
            });
          });
        },
      });
    } catch (error) {
      console.log('error', error);
    }
    return result;
  }
}
