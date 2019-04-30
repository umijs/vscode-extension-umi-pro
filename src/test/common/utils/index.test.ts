import { quoteString } from '../../../common/utils';
import { QuoteType } from '../../../common/config';

import assert = require('assert');

describe('test utils', () => {
  it('test quoteString', () => {
    assert.equal(
      quoteString('DiamondYuanLoveOPLinJie', QuoteType.single),
      "'DiamondYuanLoveOPLinJie'"
    );
    assert.equal(
      quoteString('DiamondYuanLoveOPLinJie', QuoteType.double),
      `"DiamondYuanLoveOPLinJie"`
    );
    assert.equal(
      quoteString('DiamondYuanLoveOPLinJie', QuoteType.backtick),
      '`DiamondYuanLoveOPLinJie`'
    );
  });
});
