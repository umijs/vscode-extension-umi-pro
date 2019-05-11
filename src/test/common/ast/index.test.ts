import { isPathInRouter } from '../../../common/ast';
import { getAbsPath } from '../../../common/utils';

import { join } from 'path';
import * as vscode from 'vscode';
import assert = require('assert');

describe('test isPathInRouter', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));

  it('show word correct with js code', async () => {
    const text = await vscode.workspace.openTextDocument(
      join(fixtures, 'test.js')
    );

    /**
     * { path: '/', component: './a' },
     */
    const code = text.getText(new vscode.Range(2, 4, 2, 35));
    assert.equal(isPathInRouter(code, './a'), true);
    assert.equal(isPathInRouter(code, '/'), false);

    /**
     * {
     *   path: '/users',
     *   component: './users/_layout',
     *   routes: [
     *     { path: '/users/detail', component: './users/detail' },
     *     { path: '/users/:id', component: './users/id' },
     *   ],
     * },
     */
    const code2 = text.getText(new vscode.Range(4, 4, 11, 5));
    assert.equal(isPathInRouter(code2, './users/_layout'), true);
    assert.equal(isPathInRouter(code2, '/'), false);
    assert.equal(isPathInRouter(code2, './users/detail'), false);
    assert.equal(isPathInRouter(code2, './users/id'), false);
  });
});
