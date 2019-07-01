import { Container } from 'typedi';
import { LocaleDefinitionProvider } from '../../language/locale';
import { LocaleServiceToken } from '../../services/localeService';
import { getAntdProFilePath } from '../utils';
import { VscodeServiceToken, loadVscodeService } from '../../services/vscodeService';
import { workspace, Position, Range } from 'vscode';
import { deepEqual } from 'assert';

describe('test LocaleDefinitionProvider', async () => {
  const provider = Container.get(LocaleDefinitionProvider);
  const vscodeService = Container.get(VscodeServiceToken);
  const localeService = Container.get(LocaleServiceToken);
  await loadVscodeService(vscodeService);
  await localeService.initLocales();

  it('should get correct definition', async () => {
    const text = await workspace.openTextDocument(
      getAntdProFilePath('src/components/SelectLang/index.js')
    );
    const definition = await provider.provideDefinition(text, new Position(43, 60));
    deepEqual(definition!.length, 1);
    deepEqual(definition![0].targetUri.fsPath, getAntdProFilePath('src/locales/zh-CN.js'));
    deepEqual(definition![0].targetRange, new Range(15, 2, 15, 15));
  });

  it('reference from other module by default export', async () => {
    const text = await workspace.openTextDocument(getAntdProFilePath('src/pages/404.js'));
    const definition = await provider.provideDefinition(text, new Position(10, 38));
    deepEqual(definition!.length, 1);
    deepEqual(
      definition![0].targetUri.fsPath,
      getAntdProFilePath('src/locales/zh-CN/exception.js')
    );
    deepEqual(definition![0].targetRange, new Range(1, 2, 1, 22));
  });
});
