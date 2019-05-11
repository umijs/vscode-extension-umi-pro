import { TextDocumentUtils, Brackets } from '../../../common/document';
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
    try {
      assert.equal(textDocumentUtils.CharAt(12), null);
    } catch (error) {
      assert.equal(error.message, 'illegal offset');
    }
  });

  it('test outOfRange', async () => {
    const text = await vscode.workspace.openTextDocument(
      join(fixtures, 'offsetChar')
    );
    const textDocumentUtils = new TextDocumentUtils(text);
    assert.equal(textDocumentUtils.outOfRange(11), false);
    assert.equal(textDocumentUtils.outOfRange(12), true);
  });

  it('test growBracketsRange', async () => {
    const text = await vscode.workspace.openTextDocument(
      join(fixtures, 'growBracketsRange.js')
    );
    const textDocumentUtils = new TextDocumentUtils(text);
    const range = textDocumentUtils.growBracketsRange(
      new vscode.Position(20, 17),
      Brackets.CURLY
    );
    assert.notEqual(range, null);
    assert.equal(range!.isEqual(new vscode.Range(17, 6, 21, 7)), true);
    const expendRange = textDocumentUtils.growBracketsRange(
      new vscode.Range(17, 6, 21, 7),
      Brackets.CURLY
    );
    assert.equal(new vscode.Range(6, 2, 26, 3).isEqual(expendRange!), true);
  });
});
