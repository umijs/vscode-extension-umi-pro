import { TextDocumentUtils } from '../../../common/document';
import { getAbsPath } from '../../../common/utils';
import { join } from 'path';
import * as vscode from 'vscode';
import assert = require('assert');

describe('test TextDocumentUtils', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));

  it('test CharAt', async () => {
    const text = await vscode.workspace.openTextDocument(
      join(fixtures, 'offsetChar')
    );
    const textDocumentUtils = new TextDocumentUtils(text);
    assert.equal(textDocumentUtils.CharAt(0), '一');
    assert.equal(textDocumentUtils.CharAt(4), '五');
    assert.equal(textDocumentUtils.CharAt(5), '\n');
    assert.equal(textDocumentUtils.CharAt(6), '六');
    assert.equal(textDocumentUtils.CharAt(10), '十');
    assert.equal(textDocumentUtils.CharAt(11), '\n');
    assert.equal(textDocumentUtils.CharAt(12), null);
  });

  it('test outOfRange', async () => {
    const text = await vscode.workspace.openTextDocument(
      join(fixtures, 'offsetChar')
    );
    const textDocumentUtils = new TextDocumentUtils(text);
    assert.equal(textDocumentUtils.outOfRange(11), false);
    assert.equal(textDocumentUtils.outOfRange(12), true);
  });
});
