import { getModels, getAbsPath } from '../../../../common/utils';

import assert = require('assert');
import { join } from 'path';

describe('test getModels', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));

  it('should get js first', async () => {
    const dir = join(fixtures, 'js-first');
    const expectResult = [join(dir, 'model.js')];
    assert.deepEqual(await getModels(dir), expectResult);
  });

  it('should get single model first', async () => {
    const dir = join(fixtures, 'single-file');
    const expectResult = [join(dir, 'model.js')];
    assert.deepEqual(await getModels(dir), expectResult);
  });

  it('getModel with models directory', async () => {
    const dir = join(fixtures, 'deep');
    const models = await getModels(dir);
    const expectResult = [
      './models/a.js',
      './models/models/a.js',
      './models/models/a.jsx',
      './models/models/a.ts',
      './models/models/a.tsx',
      './models/models/b/b.js',
    ].map(p => join(dir, p));
    assert.deepEqual(models.sort(), expectResult.sort());
  });
});
