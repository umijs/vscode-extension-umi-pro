import { Container } from 'typedi';
import { ActionTypeHoverProvider } from '../../language/model';
import { getAntdProFilePath } from '../utils';
import { VscodeServiceToken } from '../../services/vscodeService';
import { workspace, Position, Range } from 'vscode';
import { deepEqual } from 'assert';

describe('test ActionTypeHoverProvider', async () => {
  const provider = Container.get(ActionTypeHoverProvider);
  const vscodeService = Container.get(VscodeServiceToken);
  await vscodeService.init();

  it('should get correct hover', async () => {
    const text = await workspace.openTextDocument(
      getAntdProFilePath('src/pages/Profile/AdvancedProfile.js')
    );
    const hover = await provider.provideHover(text, new Position(195, 20));
    deepEqual(hover, {
      range: new Range(195, 12, 195, 35),
      contents: [
        {
          language: 'typescript',
          value: [
            '*fetchAdvanced(_, {',
            '  call,',
            '  put',
            '}) {',
            '  const response = yield call(queryAdvancedProfile);',
            '  yield put({',
            "    type: 'show',",
            '    payload: response',
            '  });',
            '}',
          ].join('\n'),
        },
      ],
    });
  });
});
