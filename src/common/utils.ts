import { join, resolve, dirname } from 'path';
import * as fs from 'mz/fs';
import globby from 'globby';
import { QuoteType, QuoteCharMap, JS_EXT_NAMES } from './types';

export async function getModels(cwd: string): Promise<string[]> {
  for (const extName of JS_EXT_NAMES) {
    const absFilePath = join(cwd, `model${extName}`);
    if (await fs.exists(absFilePath)) {
      return [absFilePath];
    }
  }
  const modules = (await globby(['./models/**/*.{ts,tsx,js,jsx}'], {
    cwd,
    deep: true,
  })).filter(p =>
    ['.d.ts', '.test.js', '.test.jsx', '.test.ts', '.test.tsx'].every(ext => !p.endsWith(ext))
  );
  return modules.map(p => join(cwd, p));
}

/**
 * 参考了 umi 的源码
 * @see https://github.com/umijs/umi/blob/master/packages/umi-plugin-dva/src/index.js
 * @param filePath 文件路径
 * @param projectPath 项目路径
 */
export async function getPageModels(filePath, projectPath): Promise<string[]> {
  let models: string[] = [];
  let cwd = dirname(filePath);
  while (cwd !== projectPath && cwd !== join(projectPath, 'src')) {
    models = models.concat(await getModels(cwd));
    cwd = dirname(cwd);
  }
  return models;
}

export function quoteString(input: string, type: QuoteType) {
  const quote = QuoteCharMap[type];
  return `${quote}${input}${quote}`;
}

export function getAbsPath(input: string) {
  const rootPath = resolve(__dirname, '../../');
  return input.replace(join(rootPath, 'out'), join(rootPath, 'src'));
}

export function isUndefined<T>(data: T | undefined): data is T {
  // eslint-disable-next-line no-undefined
  return data === undefined;
}

export function isNotNull<T>(data: T | null): data is T {
  // eslint-disable-next-line no-undefined
  return data !== null;
}

export function duplicateUnicodeCharacter(str: string, num: number) {
  return new Array(num).fill(str).join('');
}
