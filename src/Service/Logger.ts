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
    this._log += `${message} [${errortype}]\n`;
    this.onchange();
  }

  public warning(message: string, errortype: ErrorType): void {
    this._log += `WARNING: ${message} [${errortype}]\n`;
    this.onchange();
    console.log(`WARNING: ${message}`);
  }

  public info(message: string, infotype: InfoType): void {
    if (infotype != InfoType.OUTPUT) this._log += `INFO: ${message}\n`;
    else this._log += `[Out]: ${message}\n`;
    this.onchange();
    console.log(`INFO: ${message}`);
  }

  public console(): string {
    let logs = this._log.split("\n").filter((x) => x.startsWith("[Out]"));
    return logs.join("\n");
  }

  public clear(): void {
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
