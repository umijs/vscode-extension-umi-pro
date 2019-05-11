import * as babelParser from '@babel/parser';
import {
  isStringLiteral,
  isObjectExpression,
  isObjectProperty,
  isIdentifier,
} from '@babel/types';

/**
 *
 * 判断是否是路由配置里面的 component 路径
 *
 * @param code 路由配置的代码
 * @param path 在引号里的字符串
 */
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
    if (!isIdentifier(key) || key.name !== 'component') {
      return false;
    }
    if (!isStringLiteral(value) || value.value !== path) {
      return false;
    }
    return true;
  });
}
