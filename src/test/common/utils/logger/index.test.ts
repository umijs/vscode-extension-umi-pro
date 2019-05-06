import { Logger } from '../../../../common/logger';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import assert = require('assert');

describe('test logger', () => {
  class FakeOutputChannel implements vscode.OutputChannel {
    name = 'FakeOutputChannel';
    appendLine = sinon.fake();
    append = sinon.fake();
    show = sinon.fake();
    clear = sinon.fake();
    hide = sinon.fake();
    dispose = sinon.fake();
  }

  it('test logger.info', () => {
    const fakeOutputChannel = new FakeOutputChannel();
    const logger = new Logger(fakeOutputChannel);
    const message = Math.random()
      .toString()
      .slice(-10);
    logger.info(message);
    assert(fakeOutputChannel.appendLine.called);
    assert(fakeOutputChannel.appendLine.calledWith(message));
  });
});
