import { join } from 'path';
import * as vscode from 'vscode';
import * as fs from 'mz/fs';
import logger from './logger';

/**
 *
 * 检查项目是否安装了 umi 或者 dva
 *
 * @param projectPath 项目路径
 */
async function needExtension(projectPath: string) {
  if (!projectPath) {
    return false;
  }
  const packageJsonPath = join(projectPath, './package.json');
  if (!(await fs.exists(packageJsonPath))) {
    return false;
  }
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, { encoding: 'utf-8' }));
    const { dependencies = {} } = packageJson;
    return !!(dependencies.umi || dependencies.dva);
  } catch (error) {
    logger.info(error);
    return false;
  }
}

export async function getUmiFileWatcher(workspaceFolders: vscode.WorkspaceFolder[] | undefined) {
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return null;
  }
  const result: string[] = [];
  for (let workspaceFolder of workspaceFolders) {
    const {
      uri: { fsPath },
    } = workspaceFolder;
    if (await needExtension(fsPath)) {
      result.push(fsPath);
    }
  }
  if (result.length === 0) {
    return null;
  }
  logger.info(`watch ${result.length} project \n${result.join('\n')}`);
  const pattern = `{${result.join(',')}}/**/*.{ts,tsx,js,jsx}`;
  return vscode.workspace.createFileSystemWatcher(pattern, false, false, false);
}
