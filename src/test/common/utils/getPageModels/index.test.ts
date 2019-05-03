import { getPageModels, getAbsPath } from '../../../../common/utils';
import assert = require('assert');
import { join } from 'path';

describe('test getPageModels', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));
  const projectPath = fixtures;
  const pagesPath = join(fixtures, 'src', 'pages');

  function getAbsModelsPaths(paths: string[]) {
    return paths.map(path => join(projectPath, 'src', 'pages', path));
  }

  it('page a models should correct', async () => {
    const page = join(pagesPath, 'a', 'page.js');
    const models = await getPageModels(page, projectPath);
    assert.deepEqual(
      models.sort(),
      getAbsModelsPaths([
        'a/models/a.js',
        'a/models/b.js',
        'a/models/ss/s.js',
      ]).sort()
    );
  });

  it('page c models should correct', async () => {
    const page = join(pagesPath, 'c', 'page.js');
    const models = await getPageModels(page, projectPath);
    assert.deepEqual(models.sort(), getAbsModelsPaths(['c/model.js']).sort());
  });

  it('page d models should correct', async () => {
    const page = join(pagesPath, 'c', 'd', 'page.js');
    const models = await getPageModels(page, projectPath);
    assert.deepEqual(
      models.sort(),
      getAbsModelsPaths(['c/model.js', 'c/d/models/d.js']).sort()
    );
  });
});
