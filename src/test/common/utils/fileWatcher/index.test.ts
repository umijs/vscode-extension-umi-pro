import { join } from 'path';
import * as vscode from 'vscode';
import { getAbsPath } from '../../../../common/utils';
import { getUmiFileWatcher } from '../../../../common/fileWatcher';
import assert = require('assert');

describe('test common/fileWatcher', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));

  it('should get null when workspaceFolders is undefined', async () => {
    let workspaceFolders;
    assert.equal(await getUmiFileWatcher(workspaceFolders), null);
  });
  it('should get null when workspaceFolders not use umi or dva', async () => {
    const workspaceFolders: vscode.WorkspaceFolder[] = [
      {
        uri: vscode.Uri.file(join(fixtures, 'not-use-umi-or-dva')),
        name: 'not-use-umi-or-dva',
        index: 0,
      },
    ];
    assert.equal(await getUmiFileWatcher(workspaceFolders), null);
  });
  it('should get fileWatcher when workspaceFolders use dva or umi', async () => {
    const workspaceFolders: vscode.WorkspaceFolder[] = [
      {
        uri: vscode.Uri.file(join(fixtures, 'use-umi')),
        name: 'use-umi',
        index: 0,
      },
    ];
    const fileWatcher = await getUmiFileWatcher(workspaceFolders);
    assert.notEqual(fileWatcher, null);
  });
});
