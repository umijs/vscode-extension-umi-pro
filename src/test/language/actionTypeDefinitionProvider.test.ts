import { Container } from 'typedi';
import { ActionTypeDefinitionProvider } from '../../language/model';
import { getAntdProFilePath } from '../utils';
import { VscodeServiceToken, loadVscodeService } from '../../services/vscodeService';
import { workspace, Position, Range } from 'vscode';
import { deepEqual } from 'assert';

describe('test ActionTypeDefinitionProvider', async () => {
  const provider = Container.get(ActionTypeDefinitionProvider);
  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);

  it('should get correct definition', async () => {
    const text = await workspace.openTextDocument(
      getAntdProFilePath('src/pages/Profile/AdvancedProfile.js')
    );
    const definition = await provider.provideDefinition(text, new Position(195, 20));
    deepEqual(definition!.length, 1);
    deepEqual(
      definition![0].targetUri.fsPath,
      getAntdProFilePath('src/pages/Profile/models/profile.js')
    );
    deepEqual(definition![0].targetRange, new Range(20, 4, 26, 5));
  });
});
