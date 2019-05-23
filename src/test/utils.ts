import { join } from 'path';
import { getAbsPath } from '../common/utils';

export function getAntdProFilePath(file?: string) {
  return getAbsPath(join(__dirname, './fixtures/ant-design-pro-master', file || ''));
}
