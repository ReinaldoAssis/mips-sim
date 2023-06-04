export default class Logger {
  private static _instance: Logger;
  private _log: string = "";

  private constructor() {}

  public static get instance(): Logger {
    if (!Logger._instance) Logger._instance = new Logger();
    return Logger._instance;
  }

  public error(message: string, errortype: ErrorType): void {
    this._log += `${message}`;
  }

  public info(message: string, infotype: InfoType): void {
    this._log += `INFO: ${message}`;
    console.log(`INFO: ${message}`);
  }
}

export enum ErrorType {
  ASSEMBLER,
}

export enum InfoType {
  ASSEMBLER,
}
