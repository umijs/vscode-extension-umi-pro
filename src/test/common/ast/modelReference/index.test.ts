import { DvaModelParser } from './../../../../common/parser/index';
import {
  ModelCache,
  ModelCacheKeyParser,
} from './../../../../common/cache/modelCache';
import { ModelInfoCache } from './../../../../common/cache/index';
import { ModelReferenceParser } from '../../../../common/ast/modelReference';
import { getAbsPath } from '../../../../common/utils';
import { join } from 'path';
import { Uri, Range } from 'vscode';
import assert = require('assert');

describe('test isPathInRouter', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));

  it('show word correct with js code', async () => {
    const modelCache = new ModelCache(
      new ModelCacheKeyParser(new DvaModelParser())
    );
    const parser = new ModelReferenceParser(new ModelInfoCache(modelCache));
    const result = await parser.parseFile(join(fixtures, 'projects.js'));
    assert.deepEqual(
      result.sort(),
      [
        {
          namespace: 'list',
          actionType: 'fetch',
          uri: Uri.file(join(fixtures, 'projects.js')),
          range: new Range(41, 12, 41, 24),
        },
        {
          namespace: 'list',
          actionType: 'fetch',
          uri: Uri.file(join(fixtures, 'projects.js')),
          range: new Range(30, 12, 30, 24),
        },
      ].sort()
    );
  });
});
