import { UmircParserToken } from './../../../services/parser/umircParser';
import { VscodeServiceToken, loadVscodeService } from '../../../services/vscodeService';
import assert = require('assert');
import { join } from 'path';
import { getAbsPath } from '../../../common/utils';
import { Container } from 'typedi';

describe('umircParser', async () => {
  const umircParser = Container.get(UmircParserToken);
  const vscodeService = Container.get(VscodeServiceToken);
  await loadVscodeService(vscodeService);
  const workspaceFixtures = getAbsPath(join(__dirname, '../../fixtures'));
  const antdPro = join(workspaceFixtures, 'ant-design-pro-master');

  it('test ', async () => {
    const expectResult = [
      {
        key: 'plugins',
        start: 1768,
        end: 1775,
        loc: { start: { line: 64, column: 2 }, end: { line: 64, column: 9 } },
      },
      {
        key: 'define',
        start: 1779,
        end: 2017,
        loc: { start: { line: 65, column: 2 }, end: { line: 68, column: 3 } },
      },
      {
        key: 'treeShaking',
        start: 2021,
        end: 2038,
        loc: { start: { line: 69, column: 2 }, end: { line: 69, column: 19 } },
      },
      {
        key: 'targets',
        start: 2042,
        end: 2068,
        loc: { start: { line: 70, column: 2 }, end: { line: 72, column: 3 } },
      },
      {
        key: 'devtool',
        start: 2072,
        end: 2153,
        loc: { start: { line: 73, column: 2 }, end: { line: 73, column: 83 } },
      },
      {
        key: 'routes',
        start: 2167,
        end: 2185,
        loc: { start: { line: 75, column: 2 }, end: { line: 75, column: 20 } },
      },
      {
        key: 'theme',
        start: 2263,
        end: 2310,
        loc: { start: { line: 78, column: 2 }, end: { line: 80, column: 3 } },
      },
      {
        key: 'ignoreMomentLocale',
        start: 2494,
        end: 2518,
        loc: { start: { line: 88, column: 2 }, end: { line: 88, column: 26 } },
      },
      {
        key: 'lessLoaderOptions',
        start: 2522,
        end: 2575,
        loc: { start: { line: 89, column: 2 }, end: { line: 91, column: 3 } },
      },
      {
        key: 'disableRedirectHoist',
        start: 2579,
        end: 2605,
        loc: { start: { line: 92, column: 2 }, end: { line: 92, column: 28 } },
      },
      {
        key: 'cssLoaderOptions',
        start: 2609,
        end: 3354,
        loc: { start: { line: 93, column: 2 }, end: { line: 114, column: 3 } },
      },
      {
        key: 'manifest',
        start: 3358,
        end: 3392,
        loc: { start: { line: 115, column: 2 }, end: { line: 117, column: 3 } },
      },
      {
        key: 'chainWebpack',
        start: 3397,
        end: 3424,
        loc: { start: { line: 119, column: 2 }, end: { line: 119, column: 29 } },
      },
    ];
    const configPath = join(antdPro, 'config/config.js');
    const umircs = await umircParser.parseFile(configPath);
    assert.deepEqual(umircs, expectResult);
  });
});
