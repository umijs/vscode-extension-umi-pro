import { Container } from 'typedi';
import { UmiRouterCompletionItemProvider } from '../../language/router';
import { getAntdProFilePath } from '../utils';
import { VscodeServiceToken } from '../../services/vscodeService';
import { workspace, Position } from 'vscode';
import { deepEqual } from 'assert';

describe('test UmiRouterCompletionItemProvider', async () => {
  const provider = Container.get(UmiRouterCompletionItemProvider);
  const vscodeService = Container.get(VscodeServiceToken);
  await vscodeService.init();

  it('should get correct page CompletionItems', async () => {
    const text = await workspace.openTextDocument(getAntdProFilePath('config/router.config.js'));
    const completionItems = await provider.provideCompletionItems(text, new Position(296, 29));
    deepEqual(
      completionItems!.map(({ label }) => label).sort(),
      [
        'GGEditor/Flow',
        'GGEditor/Koni',
        'GGEditor/Mind',
        'GGEditor/common/IconFont',
        'GGEditor/components/EditorContextMenu/FlowContextMenu',
        'GGEditor/components/EditorContextMenu/KoniContextMenu',
        'GGEditor/components/EditorContextMenu/MenuItem',
        'GGEditor/components/EditorContextMenu/MindContextMenu',
        'GGEditor/components/EditorContextMenu',
        'GGEditor/components/EditorDetailPanel/DetailForm',
        'GGEditor/components/EditorDetailPanel/FlowDetailPanel',
        'GGEditor/components/EditorDetailPanel/KoniDetailPanel',
        'GGEditor/components/EditorDetailPanel/MindDetailPanel',
        'GGEditor/components/EditorDetailPanel',
        'GGEditor/components/EditorItemPanel/FlowItemPanel',
        'GGEditor/components/EditorItemPanel/KoniItemPanel',
        'GGEditor/components/EditorItemPanel',
        'GGEditor/components/EditorMinimap',
        'GGEditor/components/EditorToolbar/KoniToolbar',
        'GGEditor/components/EditorToolbar/FlowToolbar',
        'GGEditor/components/EditorToolbar/MindToolbar',
        'GGEditor/components/EditorToolbar/ToolbarButton',
        'GGEditor/components/EditorToolbar',
        'GGEditor/Koni/shape/nodes/KoniCustomNode',
      ].sort()
    );
  });

  it('should get correct layout CompletionItems', async () => {
    const text = await workspace.openTextDocument(getAntdProFilePath('config/router.config.js'));
    const completionItems = await provider.provideCompletionItems(text, new Position(300, 31));
    deepEqual(
      completionItems!.map(({ label }) => label).sort(),
      ['BasicLayout', 'BlankLayout', 'Footer', 'Header', 'MenuContext', 'UserLayout'].sort()
    );
  });
});
