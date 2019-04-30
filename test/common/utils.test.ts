/* eslint-disable max-nested-callbacks */
import { getModels } from '../../src/common/utils';
import { join } from 'path';
import assert = require('assert');

describe('test common/utils', () => {
  describe('test getModels', () => {
    const fixtures = join(__dirname, 'fixtures', 'getModels');
    it('should get js first', async () => {
      const dir = join(fixtures, 'should-get-js-first');
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
});
