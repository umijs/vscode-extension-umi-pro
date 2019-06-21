import { ModelEffectsParserToken } from './../../../services/parser/modelEffectsParser';
import { VscodeServiceToken, loadVscodeService } from '../../../services/vscodeService';
import { join } from 'path';
import { getAbsPath } from '../../../common/utils';
import { Container } from 'typedi';
import { equal, deepEqual } from 'assert';

describe('modelEffectsParser', async () => {
  const modelEffectsParser = Container.get(ModelEffectsParserToken);
  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);
  const workspaceFixtures = getAbsPath(join(__dirname, '../../fixtures'));
  it('test js project', async () => {
    const response = await modelEffectsParser.parseFile(
      join(workspaceFixtures, 'jsProject/user.js')
    );
    equal(response.length, 4);
    deepEqual(JSON.parse(JSON.stringify(response)), [
      {
        range: [{ line: 12, character: 4 }, { line: 18, character: 5 }],
        code:
          "// eslint-disable-next-line @typescript-eslint/no-unused-vars\n*toManyEffects(payload, {\n  call,\n  put\n}) {\n  const response = yield call(queryUsers);\n  yield put({\n    type: 'save',\n    payload: response\n  });\n}",
      },
      {
        range: [{ line: 19, character: 4 }, { line: 25, character: 5 }],
        code:
          "*lackEffects(_, {\n  call,\n  put\n}) {\n  const response = yield call(queryUsers);\n  yield put({\n    type: 'save',\n    payload: response\n  });\n}",
      },
      {
        range: [{ line: 33, character: 4 }, { line: 41, character: 5 }],
        code:
          "*noEffects(_, {\n  call,\n  put,\n  select\n}) {\n  const response = yield call(queryCurrent);\n  const res = yield select(data => data);\n  console.log(res);\n  yield put({\n    type: 'saveCurrentUser',\n    payload: response\n  });\n}",
      },
      {
        range: [{ line: 42, character: 4 }, { line: 48, character: 5 }],
        code:
          "*noParams(_, {\n  call,\n  put\n}) {\n  const response = yield call(queryCurrent);\n  yield put({\n    type: 'saveCurrentUser',\n    payload: response\n  });\n}",
      },
    ]);
  });
  it('test ts project', async () => {
    const response = await modelEffectsParser.parseFile(
      join(workspaceFixtures, 'tsProject/user.ts')
    );
    equal(response.length, 4);
    deepEqual(JSON.parse(JSON.stringify(response)), [
      {
        range: [{ line: 11, character: 39 }, { line: 14, character: 3 }],
        code: 'function* (_, {\n  call\n}) {\n  //@ts-ignore\n  yield call(console.log);\n}',
      },
      {
        range: [{ line: 16, character: 45 }, { line: 19, character: 3 }],
        code: 'function* (_, {\n  call\n}) {\n  //@ts-ignore\n  yield call(console.log);\n}',
      },
      {
        range: [{ line: 20, character: 43 }, { line: 24, character: 3 }],
        code:
          'function* (_, {\n  call,\n  put\n}) {\n  //@ts-ignore\n  yield call(console.log);\n  yield put({});\n}',
      },
      {
        range: [{ line: 25, character: 41 }, { line: 30, character: 3 }],
        code:
          'function* (_, {\n  call,\n  put\n}) {\n  //@ts-ignore\n  yield call(console.log); //@ts-ignore\n\n  yield put({});\n}',
      },
    ]);
  });
});
