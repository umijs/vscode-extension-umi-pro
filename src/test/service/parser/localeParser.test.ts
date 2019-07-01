import { LocaleParserToken } from './../../../services/parser/localeParser';
import { LocaleServiceToken } from './../../../services/localeService';
import { VscodeServiceToken, loadVscodeService } from '../../../services/vscodeService';
import assert = require('assert');
import { join } from 'path';
import { getAbsPath } from '../../../common/utils';
import { Container } from 'typedi';

import snapShot from './localeParser.test.snapshot';

describe('localeParser', async () => {
  const localeParser = Container.get(LocaleParserToken);
  const localeService = Container.get(LocaleServiceToken);
  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);
  await localeService.initLocales();
  const workspaceFixtures = getAbsPath(join(__dirname, '../../fixtures'));
  const antdPro = join(workspaceFixtures, 'ant-design-pro-master');

  it('test parser result', async () => {
    const localFile = join(antdPro, 'src/locales/zh-CN.js');
    const localeAst = await localeParser.parseFile(localFile);
    assert.equal(JSON.stringify(localeAst), JSON.stringify(snapShot));
  });
});
