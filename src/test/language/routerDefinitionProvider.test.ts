import { Container } from 'typedi';
import { UmiRouterDefinitionProvider } from '../../language/router';
import { getAntdProFilePath } from '../utils';
import {
  VscodeServiceToken,
  loadVscodeService,
} from '../../services/vscodeService';
import { workspace, Position } from 'vscode';
import * as assert from 'assert';

describe('test UmiRouterDefinitionProvider', async () => {
  const provider = Container.get(UmiRouterDefinitionProvider);
  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);

  it('should get correct page path', async () => {
    const text = await workspace.openTextDocument(
      getAntdProFilePath('config/router.config.js')
    );
    const definition = await provider.provideDefinition(
      text,
      new Position(35, 35)
    );
    assert.equal(!!definition, true);
    assert.equal(
      definition!.uri.fsPath,
      getAntdProFilePath('src/pages/Dashboard/Analysis.js')
    );
  });

  it('should get correct layout path', async () => {
    const text = await workspace.openTextDocument(
      getAntdProFilePath('config/router.config.js')
    );
    const definition = await provider.provideDefinition(
      text,
      new Position(4, 27)
    );
    assert.equal(!!definition, true);
    assert.equal(
      definition!.uri.fsPath,
      getAntdProFilePath('src/layouts/UserLayout.js')
    );
  });
});
