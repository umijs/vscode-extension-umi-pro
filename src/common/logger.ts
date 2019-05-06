import { window, OutputChannel } from 'vscode';

interface ILogger {
  info(message: string);
}

export class Logger implements ILogger {
  private channel: OutputChannel;
  constructor(channel: OutputChannel) {
    this.channel = channel;
  }

  public info(message) {
    console.log(message);
    this.channel.appendLine(message);
  }
}

export default new Logger(window.createOutputChannel('dva_helper')) as ILogger;
