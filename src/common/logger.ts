import { window, OutputChannel } from 'vscode';
import { Token, Service } from 'typedi';

export interface ILogger {
  info(message: string);
}

export const LoggerService = new Token<ILogger>();

function createLogger() {
  return new Logger(window.createOutputChannel('Umi Pro'));
}

@Service({ id: LoggerService, factory: createLogger })
class Logger implements ILogger {
  private channel: OutputChannel;
  constructor(channel: OutputChannel) {
    this.channel = channel;
  }

  public info(message) {
    console.log(message);
    this.channel.appendLine(message);
  }
}

export { Logger };
export default new Logger(window.createOutputChannel('Umi Pro')) as ILogger;
