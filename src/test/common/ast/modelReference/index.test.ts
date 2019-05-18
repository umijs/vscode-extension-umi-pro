import { ModelReferenceParser } from '../../../../common/ast/modelReference';
import { getAbsPath } from '../../../../common/utils';
import { join } from 'path';
import { Uri, Range } from 'vscode';
import assert = require('assert');

describe('test ModelReferenceParser', () => {
  const fixtures = getAbsPath(join(__dirname, './fixtures'));

  const parser = new ModelReferenceParser();

  it('should get correct modelReference from react page', async () => {
    const result = await parser.parseFile(join(fixtures, 'projects.js'));
    assert.deepEqual(result.sort(), [
      {
        type: 'list/fetch',
        uri: Uri.file(join(fixtures, 'projects.js')),
        range: new Range(41, 12, 41, 24),
      },
      {
        type: 'list/fetch',
        uri: Uri.file(join(fixtures, 'projects.js')),
        range: new Range(30, 12, 30, 24),
      },
    ]);
  });

  it('should get correct modelReference from model', async () => {
    const parser = new ModelReferenceParser();
    const filePath = join(fixtures, 'global.js');
    const result = await parser.parseFile(filePath);
    const uri = Uri.file(filePath);
    assert.deepEqual(result, [
      {
        type: 'saveNotices',

        uri,
        range: new Range(14, 14, 14, 27),
      },
      {
        type: 'user/changeNotifyCount',
        uri,
        range: new Range(21, 14, 21, 38),
      },
      {
        type: 'saveClearedNotices',
        uri,
        range: new Range(30, 14, 30, 34),
      },
      {
        type: 'user/changeNotifyCount',
        uri,
        range: new Range(38, 14, 38, 38),
      },
      {
        type: 'saveNotices',
        uri,
        range: new Range(56, 14, 56, 27),
      },
      {
        type: 'user/changeNotifyCount',
        uri,
        range: new Range(60, 14, 60, 38),
      },
    ]);
  });
});
