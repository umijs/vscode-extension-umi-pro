import assert = require('assert');
import * as path from 'path';
import { DvaModelParser } from '../src/common/parser';

describe('index.test.ts', () => {
  it('test ', () => {
    const userModelPath = path.resolve(__dirname, './fixture/model/user.js');
    const userModel = new DvaModelParser().parseFile(userModelPath);
    assert(userModel !== null);
  });
});
