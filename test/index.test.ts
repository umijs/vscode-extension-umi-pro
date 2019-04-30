import assert = require('assert');
import * as path from 'path';
import { DvaModelParser } from '../src/common/parser';

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
            code:
              'save(state, action) {\n  return { ...state,\n    list: action.payload\n  };\n}',
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
    const userModelPath = path.resolve(__dirname, './fixture/model/user.js');
    const userModel = await new DvaModelParser().parseFile(userModelPath);
    assert.deepEqual(userModel, expectResult);
  });

  it('empty', async () => {
    const emptyModelPath = path.resolve(__dirname, './fixture/model/empty.js');
    const emptyModel = await new DvaModelParser().parseFile(emptyModelPath);
    assert.deepEqual(emptyModel, []);
  });
});
