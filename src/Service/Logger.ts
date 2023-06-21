export default class Logger {
  private static _instance: Logger;
  private _log: string = "";

  private _debug: Array<string> = [];
  private _console: Array<string> = [];

  private _onchange: Function = () => {};
  private _ondebugchange: Function = () => {};
  private _onconsolechange: Function = () => {};

  private constructor() {}

  public static get instance(): Logger {
    if (!Logger._instance) Logger._instance = new Logger();
    return Logger._instance;
  }

  public error(message: string, errortype: ErrorType): void {
    this._log += `ERROR: ${message} [${errortype}]\n`;
    this._onchange();
  }

  public warning(message: string, errortype: ErrorType): void {
    this._log += `WARNING: ${message} [${errortype}]\n`;
    this._onchange();
  }

  public info(message: string, infotype: InfoType): void {
    if (infotype != InfoType.OUTPUT) this._log += `INFO: ${message}\n`;
    else this._log += `[Out]: ${message}\n`;
    this._onchange();
  }

  public debug(message: string): void {
    this._log += `DEBUG: ${message}\n`;
    this._debug.push(message);

    this._onchange();
    this._ondebugchange();
  }

  public getConsole(): string {
    let logs = this._log.split("\n").filter((x) => x.startsWith("[Out]"));
    return logs.join("\n");
  }

  public getDebug(): string {
    return this._debug.join("\n");
  }

  public clearDebug(): void {
    this._debug = [];
    this._ondebugchange();
  }

  public clearConsole(): void {
    this._log = "";
  }

  public onLogChange(f: Function): void {
    this._onchange = f;
  }

  public onDebugChange(f: Function): void {
    this._ondebugchange = f;
  }

  public onConsoleChange(f: Function): void {
    this._onconsolechange = f;
  }
}

export enum ErrorType {
  ASSEMBLER,
  SIMULATOR,
}

export enum InfoType {
  ASSEMBLER,
  SIMULATOR,
  OUTPUT,
}
