import { join } from 'path';
import * as fs from 'mz/fs';
import globby from 'globby';

const JS_EXT_NAMES = ['.js', '.jsx', '.ts', '.tsx'];

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
    ['.d.ts', '.test.js', '.test.jsx', '.test.ts', '.test.tsx'].every(
      ext => !p.endsWith(ext)
    )
  );
  return modules.map(p => join(cwd, p));
}
