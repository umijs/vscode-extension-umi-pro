import { quoteString, isUndefined } from '../../../common/utils';
import { QuoteType } from '../../../common/types';

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

  it('test isUndefined', () => {
    let undefinedVal;
    assert.equal(isUndefined(undefinedVal), true);
    // eslint-disable-next-line no-undefined
    assert.equal(isUndefined(undefined), true);
    assert.equal(isUndefined(null), false);
  });
});
