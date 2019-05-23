import assert = require('assert');
import { join } from 'path';
import { DvaModelParser } from '../common/parser';
import { getAbsPath } from '../common/utils';

describe('index.test.ts', () => {
  it('test ', async () => {
    const expectResult = [
      {
        effects: {
          fetch: {
            code:
              "*fetch(_, {\n  put\n}) {\n  yield put({\n    type: 'save',\n    payload: []\n  });\n}",
            loc: {
              start: { line: 9, column: 4 },
              end: { line: 14, column: 5 },
            },
          },
          fetchCurrent: {
            code:
              "*fetchCurrent(_, {\n  put\n}) {\n  yield put({\n    type: 'saveCurrentUser',\n    payload: {}\n  });\n}",
            loc: {
              start: { line: 15, column: 4 },
              end: { line: 20, column: 5 },
            },
          },
        },
        reducers: {
          save: {
            code: 'save(state, action) {\n  return { ...state,\n    list: action.payload\n  };\n}',
            loc: {
              start: { line: 23, column: 4 },
              end: { line: 28, column: 5 },
            },
          },
          saveCurrentUser: {
            code:
              'saveCurrentUser(state, action) {\n  return { ...state,\n    currentUser: action.payload || {}\n  };\n}',
            loc: {
              start: { line: 29, column: 4 },
              end: { line: 34, column: 5 },
            },
          },
        },
        namespace: 'user',
      },
    ];
    const userModelPath = getAbsPath(join(__dirname, './fixtures/user.js'));
    const userModel = await new DvaModelParser().parseFile(userModelPath);
    assert.deepEqual(userModel, expectResult);
  });

  it('empty', async () => {
    const emptyModelPath = getAbsPath(join(__dirname, './fixtures/empty.js'));
    const emptyModel = await new DvaModelParser().parseFile(emptyModelPath);
    assert.deepEqual(emptyModel, []);
  });
});
