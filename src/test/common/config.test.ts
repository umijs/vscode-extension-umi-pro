import { getConfig, QuoteType } from '../../common/config';
import assert = require('assert');

describe('test common config', () => {
  it('test quoteString', () => {
    assert.equal(getConfig().quotes, QuoteType.single);
  });
});
