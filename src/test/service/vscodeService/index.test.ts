import { VscodeService } from '../../../services/vscodeService';
import { join } from 'path';
import { getAbsPath } from '../../../common/utils';
import { Uri, WorkspaceFolder, workspace } from 'vscode';
import assert = require('assert');

describe('test VscodeService', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));

  const workspaceOnePath = join(fixtures, './workspace_1');
  const workspaceTwoPath = join(fixtures, './workspace_2');

  const workspaceFolders: WorkspaceFolder[] = [
    {
      uri: Uri.file(workspaceOnePath),
      name: 'workspaceOne',
      index: 0,
    },
    {
      uri: Uri.file(workspaceTwoPath),
      name: 'workspaceTwo',
      index: 1,
    },
  ];

  const configs = workspaceFolders.map(({ uri }) => {
    return workspace.getConfiguration('umi_pro', uri);
  });

  const vscodeService = new VscodeService();
  vscodeService.load(workspaceFolders, configs);

  describe('test vscodeService.getWorkspace', () => {
    it('should get correct workspace', () => {
      const result = vscodeService.getWorkspace(
        join(workspaceOnePath, './1.js')
      );
      assert.notEqual(result, null);
      assert.equal(result!.uri.fsPath, workspaceOnePath);
    });
    it('should get null when no workspace match', () => {
      const result = vscodeService.getWorkspace(join('./1.js'));
      assert.equal(result, null);
    });
  });

  describe('test vscodeService.getProjectPath', () => {
    it('should get correct getProjectPath', () => {
      const result = vscodeService.getProjectPath(
        join(workspaceOnePath, './1.js')
      );
      assert.notEqual(result, null);
      assert.equal(result, workspaceOnePath);
    });
    it('should get null when no workspace match', () => {
      const result = vscodeService.getProjectPath(join('./1.js'));
      assert.equal(result, null);
    });
  });
});
