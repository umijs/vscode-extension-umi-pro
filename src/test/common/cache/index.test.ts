import { ModelCache, ModelCacheKeyParser } from '../../../common/cache';
import { getAbsPath } from '../../../common/utils';
import { join } from 'path';
import { DvaModelParser } from '../../../common/parser';
import * as os from 'os';
import * as fs from 'mz/fs';
import assert = require('assert');

describe('test ModelCache', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));
  const notExist = join(fixtures, 'notExist.js');
  const errorFile = join(fixtures, 'error');

  it('test ModelCacheKeyParser', async () => {
    const modelCacheKeyParser = new ModelCacheKeyParser(new DvaModelParser());
    assert.equal(await modelCacheKeyParser.getKey(notExist), null);
    assert.equal(await modelCacheKeyParser.getValue(notExist), null);
    assert.equal(await modelCacheKeyParser.getValue(errorFile), null);
  });

  it('test ModelCache', async () => {
    const tmpDir = await fs.mkdtemp(
      join(os.tmpdir(), 'diamondyuan-vscode-extension-umi-pro'),
      'utf-8'
    );
    const modelCache = new ModelCache(
      new ModelCacheKeyParser(new DvaModelParser())
    );
    assert.deepEqual(await modelCache.get(notExist), null);
    const testTempFile = join(tmpDir, 'user.js');
    const user1 = join(fixtures, 'user1.js');
    fs.copyFileSync(user1, testTempFile);
    let expectResult = [
      {
        effects: {},
        reducers: {
          saveCurrentUser: {
            code:
              'saveCurrentUser(state, action) {\n  return { ...state,\n    currentUser: action.payload || {}\n  };\n}',
            loc: {
              start: { line: 10, column: 4 },
              end: { line: 15, column: 5 },
            },
          },
        },
        namespace: 'user1',
      },
    ];
    assert.deepEqual(await modelCache.get(testTempFile), expectResult);
    const user2 = join(fixtures, 'user2.js');
    fs.copyFileSync(user2, testTempFile);
    assert.deepEqual(await modelCache.get(testTempFile), expectResult);
    await modelCache.update(testTempFile);
    expectResult[0].namespace = 'user2';
    assert.deepEqual(await modelCache.get(testTempFile), expectResult);
    await modelCache.update(notExist);
    assert.deepEqual(await modelCache.get(testTempFile), expectResult);
  });
});
