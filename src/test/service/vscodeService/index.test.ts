import { QuoteType } from './../../../common/types';
import {
  VscodeServiceToken,
  loadVscodeService,
} from '../../../services/vscodeService';
import { join } from 'path';
import { getAbsPath } from '../../../common/utils';
import { workspace } from 'vscode';
import { Container } from 'typedi';
import assert = require('assert');

describe('test VscodeService', async () => {
  const workspaceFolders = workspace.workspaceFolders;
  const workspaceFixtures = getAbsPath(join(__dirname, '../../fixtures'));

  const jsProject = join(workspaceFixtures, 'jsProject');
  const tsProject = join(workspaceFixtures, 'tsProject');

  it('should have 3 workspace', () => {
    assert.equal(workspaceFolders!.length, 3);
  });

  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);

  describe('test vscodeService.getWorkspace', () => {
    it('should get correct workspace', () => {
      const result = vscodeService.getWorkspace(join(jsProject, './1.js'));
      assert.notEqual(result, null);
      assert.equal(result!.uri.fsPath, jsProject);
    });
    it('should get null when no workspace match', () => {
      const result = vscodeService.getWorkspace(join('./1.js'));
      assert.equal(result, null);
    });
  });

  describe('test vscodeService.getProjectPath', () => {
    it('should get correct getProjectPath', () => {
      const result = vscodeService.getProjectPath(join(jsProject, './1.js'));
      assert.notEqual(result, null);
      assert.equal(result, jsProject);
    });
    it('should get null when no workspace match', () => {
      const result = vscodeService.getProjectPath(join('./1.js'));
      assert.equal(result, null);
    });
  });

  describe('test vscodeService.getConfig', () => {
    it('should get correct config', () => {
      let result = vscodeService.getConfig(join(tsProject, './1.ts'));
      assert.notEqual(result, null);
      assert.equal(result!.quotes, QuoteType.double);

      result = vscodeService.getConfig(join(jsProject, './1.js'));
      assert.notEqual(result, null);
      assert.equal(result!.quotes, QuoteType.single);
    });
  });
});
