import { window, OutputChannel } from 'vscode';

interface ILogger {
  info(message: string);
}

class Logger implements ILogger {
  private channel: OutputChannel;
  constructor() {
    this.channel = window.createOutputChannel('dva_helper');
  }

  public info(message) {
    console.log(message);
    this.channel.appendLine(message);
  }
}

export default new Logger() as ILogger;
