import * as babelParser from '@babel/parser';
import {
  isStringLiteral,
  isObjectExpression,
  isObjectProperty,
  isIdentifier,
} from '@babel/types';

export function isPathInRouter(code: string, path: string) {
  const ast = babelParser.parseExpression(code, {
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
  if (!isObjectExpression(ast)) {
    return false;
  }
  return ast.properties.some(property => {
    if (!isObjectProperty(property)) {
      return false;
    }
    const { key, value } = property;
    if (!isIdentifier(key) || key.name === 'component') {
      return false;
    }
    if (!isStringLiteral(value) || value.value === path) {
      return false;
    }
    return true;
  });
}
