import { Range } from 'vscode';
import { VscodeServiceToken, loadVscodeService } from '../../../services/vscodeService';
import { join } from 'path';
import { Container } from 'typedi';
import * as assert from 'assert';
import { getAbsPath } from '../../../common/utils';
import { ModelReferenceServiceToken } from '../../../services/modelReferenceService';

describe('test modelReferenceService', async () => {
  const modelReferenceService = Container.get(ModelReferenceServiceToken);
  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);
  const workspaceFixtures = getAbsPath(join(__dirname, '../../fixtures'));
  const antdPro = join(workspaceFixtures, 'ant-design-pro-master');

  it('test getReference', async function() {
    this.timeout(10000);
    const LoginModel = join(antdPro, 'src/models/login.js');
    const reference = await modelReferenceService.getReference(LoginModel, 'login', 'getCaptcha');

    const result = reference.map(({ uri: { fsPath }, range }) => ({
      path: fsPath,
      range,
    }));
    assert.deepEqual(result, [
      {
        path: join(antdPro, 'src/pages/User/Login.js'),
        range: new Range(32, 18, 32, 36),
      },
    ]);
  });
});
