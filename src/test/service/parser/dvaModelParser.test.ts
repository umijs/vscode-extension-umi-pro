import { DvaModelParserToken } from './../../../services/parser/dvaModelParser';
import { VscodeServiceToken } from '../../../services/vscodeService';
import assert = require('assert');
import { join } from 'path';
import { getAbsPath } from '../../../common/utils';
import { Container } from 'typedi';

describe('dvaModelParser', async () => {
  const dvaModelParser = Container.get(DvaModelParserToken);
  const vscodeService = Container.get(VscodeServiceToken);
  await vscodeService.init();
  const workspaceFixtures = getAbsPath(join(__dirname, '../../fixtures'));
  const antdPro = join(workspaceFixtures, 'ant-design-pro-master');

  it('test ', async () => {
    const expectResult = [
      {
        namespace: 'user',
        effects: {
          fetch: {
            code:
              "*fetch(_, {\n  call,\n  put\n}) {\n  const response = yield call(queryUsers);\n  yield put({\n    type: 'save',\n    payload: response\n  });\n}",
            loc: { start: { line: 12, column: 4 }, end: { line: 18, column: 5 } },
          },
          fetchCurrent: {
            code:
              "*fetchCurrent(_, {\n  call,\n  put\n}) {\n  const response = yield call(queryCurrent);\n  yield put({\n    type: 'saveCurrentUser',\n    payload: response\n  });\n}",
            loc: { start: { line: 19, column: 4 }, end: { line: 25, column: 5 } },
          },
        },
        reducers: {
          save: {
            code: 'save(state, action) {\n  return { ...state,\n    list: action.payload\n  };\n}',
            loc: { start: { line: 29, column: 4 }, end: { line: 34, column: 5 } },
          },
          saveCurrentUser: {
            code:
              'saveCurrentUser(state, action) {\n  return { ...state,\n    currentUser: action.payload || {}\n  };\n}',
            loc: { start: { line: 35, column: 4 }, end: { line: 40, column: 5 } },
          },
          changeNotifyCount: {
            code:
              'changeNotifyCount(state, action) {\n  return { ...state,\n    currentUser: { ...state.currentUser,\n      notifyCount: action.payload.totalCount,\n      unreadCount: action.payload.unreadCount\n    }\n  };\n}',
            loc: { start: { line: 41, column: 4 }, end: { line: 50, column: 5 } },
          },
        },
      },
    ];
    const userModelPath = join(antdPro, 'src/models/user.js');
    const userModel = await dvaModelParser.parseFile(userModelPath);
    assert.deepEqual(userModel, expectResult);
  });
});
