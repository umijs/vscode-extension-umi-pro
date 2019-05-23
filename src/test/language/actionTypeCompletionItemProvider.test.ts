import { Container } from 'typedi';
import { ActionTypeCompletionItemProvider } from '../../language/model';
import { getAntdProFilePath } from '../utils';
import { VscodeServiceToken, loadVscodeService } from '../../services/vscodeService';
import { workspace, Position } from 'vscode';
import { deepEqual } from 'assert';

describe('test ActionTypeCompletionItemProvider', async () => {
  const provider = Container.get(ActionTypeCompletionItemProvider);
  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);

  it('should get correct CompletionItems', async () => {
    const text = await workspace.openTextDocument(
      getAntdProFilePath('src/pages/List/Applications.js')
    );
    const completionItems = await provider.provideCompletionItems(text, new Position(26, 11));
    deepEqual(
      completionItems!.map(o => o.label).sort(),
      [
        "'global/fetchNotices'",
        "'global/clearNotices'",
        "'global/changeNoticeReadState'",
        "'global/changeLayoutCollapsed'",
        "'global/saveNotices'",
        "'global/saveClearedNotices'",
        "'list/fetch'",
        "'list/appendFetch'",
        "'list/submit'",
        "'list/queryList'",
        "'list/appendList'",
        "'menu/getMenuData'",
        "'menu/save'",
        "'login/login'",
        "'login/getCaptcha'",
        "'login/logout'",
        "'login/changeLoginStatus'",
        "'project/fetchNotice'",
        "'project/saveNotice'",
        "'setting/getSetting'",
        "'setting/changeSetting'",
        "'user/fetch'",
        "'user/fetchCurrent'",
        "'user/save'",
        "'user/saveCurrentUser'",
        "'user/changeNotifyCount'",
        "'rule/fetch'",
        "'rule/add'",
        "'rule/remove'",
        "'rule/update'",
        "'rule/save'",
      ].sort()
    );
  });
});
