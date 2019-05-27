import { ModelInfoServiceToken } from '../../../services/modelInfoService';
import { VscodeServiceToken, loadVscodeService } from '../../../services/vscodeService';
import { join } from 'path';
import { Container } from 'typedi';
import assert = require('assert');
import { getAbsPath } from '../../../common/utils';

describe('test ModelInfoService', async () => {
  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);
  const modelInfoService = Container.get(ModelInfoServiceToken);
  const workspaceFixtures = getAbsPath(join(__dirname, '../../fixtures'));
  const antdPro = join(workspaceFixtures, 'ant-design-pro-master');

  it('should get correct namespace', async () => {
    const ListModel = join(antdPro, 'src/models/list.js');
    assert.equal(await modelInfoService.getNameSpace(ListModel), 'list');
    const formModel = join(antdPro, 'src/pages/Forms/models/form.js');
    assert.equal(await modelInfoService.getNameSpace(formModel), 'form');
  });

  it('should get correct models', async () => {
    const ListModel = join(antdPro, 'src/models/list.js');
    const models = await modelInfoService.getModules(ListModel);
    const modelNames = models.map(({ namespace }) => namespace);
    assert.deepEqual(
      modelNames.sort(),
      ['global', 'list', 'login', 'menu', 'project', 'setting', 'user'].sort()
    );
  });

  it('should get correct models', async () => {
    const ListModel = join(antdPro, 'src/pages/Forms/models/form.js');
    const models = await modelInfoService.getModules(ListModel);
    const modelNames = models.map(({ namespace }) => namespace);
    assert.deepEqual(
      modelNames.sort(),
      ['form', 'global', 'list', 'login', 'menu', 'project', 'setting', 'user'].sort()
    );
  });

  it('should get correct namespace after file change', async () => {
    const ListModel = join(antdPro, 'src/models/list.js');
    await modelInfoService.updateFile(ListModel);
    assert.equal(await modelInfoService.getNameSpace(ListModel), 'list');
  });
});
