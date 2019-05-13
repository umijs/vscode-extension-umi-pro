import { getAllPages, getAbsPath } from '../../../../common/utils';

import assert = require('assert');
import { join } from 'path';

describe('test getAllPages', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));

  it('should get getAllPages correct', async () => {
    const result = await getAllPages(fixtures);
    assert.deepEqual(result.sort(), ['index', 'a', 'a/b', 'b/a'].sort());
  });
});
