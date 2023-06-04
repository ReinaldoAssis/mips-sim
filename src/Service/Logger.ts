export default class Logger {
  private static _instance: Logger;
  private _log: string = "";
  private onchange: Function = () => {};

  private constructor() {}

  public static get instance(): Logger {
    if (!Logger._instance) Logger._instance = new Logger();
    return Logger._instance;
  }

  public error(message: string, errortype: ErrorType): void {
    this._log += `ERROR: ${message} [${errortype}]\n`;
    this.onchange();
  }

  public warning(message: string, errortype: ErrorType): void {
    this._log += `WARNING: ${message} [${errortype}]\n`;
    this.onchange();
  }

  public info(message: string, infotype: InfoType): void {
    if (infotype != InfoType.OUTPUT) this._log += `INFO: ${message}\n`;
    else this._log += `[Out]: ${message}\n`;
    this.onchange();
  }

  public debug(message: string): void {
    this._log += `DEBUG: ${message}\n`;
    this.onchange();
  }

  public getConsole(): string {
    let logs = this._log.split("\n").filter((x) => x.startsWith("[Out]"));
    return logs.join("\n");
  }

  public getDebug(): string {
    return this._log
      .split("\n")
      .filter(
        (x) =>
          x.includes("WARNING") || x.includes("ERROR") || x.includes("DEBUG")
      )
      .join("\n");
  }

  public clearConsole(): void {
    this._log = "";
  }

  public onLogChange(f: Function): void {
    this.onchange = f;
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
