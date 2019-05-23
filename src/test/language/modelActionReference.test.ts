import { Container } from 'typedi';
import { workspace, Position, Location } from 'vscode';
import { deepEqual } from 'assert';
import { ModelActionReference } from '../../language/model';
import { getAntdProFilePath } from '../utils';
import { VscodeServiceToken, loadVscodeService } from '../../services/vscodeService';

describe('test ModelActionReference', async () => {
  const provider = Container.get(ModelActionReference);
  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);

  function flattenLocation({
    uri: { fsPath },
    range: {
      start: { line: startLine, character: startCharacter },
      end: { line: endLine, character: endCharacter },
    },
  }: Location) {
    return {
      fsPath,
      startLine,
      startCharacter,
      endLine,
      endCharacter,
    };
  }

  it('should get correct references', async function() {
    this.timeout(10000);
    const text = await workspace.openTextDocument(
      getAntdProFilePath('src/pages/Profile/models/profile.js')
    );
    const references = await provider.provideReferences(text, new Position(20, 12));
    deepEqual(references!.length, 1);
    deepEqual(references!.map(flattenLocation), [
      {
        fsPath: getAntdProFilePath('src/pages/Profile/AdvancedProfile.js'),
        startLine: 195,
        startCharacter: 12,
        endLine: 195,
        endCharacter: 35,
      },
    ]);
  });
});
