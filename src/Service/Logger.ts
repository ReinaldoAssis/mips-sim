import SharedData from "./SharedData";

export interface SimError {
  message: string;
  instruction: string;
  cycle: number;
  PC: string;
  line?: number;
  type: string;
  level?: number;
}

export let ErrorType = {
  InvalidInstruction: "Invalid Instruction",
  InvalidRegister: "Invalid Register",
  InvalidLabel: "Invalid Label",
  InvalidArgument: "Invalid Argument",
  InvalidNumberOfArguments: "Invalid Number Of Arguments",
  JumpOutOfBounds: "Jump Out Of Bounds",
  InvalidMemoryAccess: "Invalid Memory Access",
  InvalidMemoryAddress: "Invalid Memory Address",
  Warning: "Warning", //always level 0
};

export default class Logger {
  private static _instance: Logger;
  private _log: string = "";

  private _debug: Array<string> = [];
  private _console: Array<string> = [];
  private _error: Array<SimError> = [];

  private _appErrors: Array<string> = [];
  private _appInternalMsgs: Array<string> = [];

  private _onchange: Function = () => {};
  private _ondebugchange: Function = () => {};
  private _onconsolechange: Function = () => {};

  private constructor() {}

  public static get instance(): Logger {
    if (!Logger._instance) Logger._instance = new Logger();
    return Logger._instance;
  }

  public debug(message: string): void {
    this._log += `DEBUG: ${message}\n`;
    this._debug.push(message);

    this._onchange();
    this._ondebugchange();
  }

  public debugAll(...messages: Array<string>): void {
    messages.forEach((m) => this.debug(m));
  }

  public console(message: string, linebrak: boolean = true): void {
    this._log += `[Out]: ${message}\n`;
    if (linebrak) this._console.push(message + "\n");
    else this._console.push(message);

    //remove this
    this._onchange();
    this._onconsolechange();
  }

  public error(
    message: string,
    instruction: string,
    cycle: number,
    pc: number,
    line: number = -1,
    type: string,
    level: number = 0
  ): void {
    let err: SimError = {
      message: message,
      instruction: instruction,
      cycle: cycle,
      PC: `0x${pc.toString(16)}`,
      line: line,
      type: type,
      level: level,
    };

    this._error.push(err);
    this._log += `ERROR: ${this.simErrorToString(err)}\n`;

    this._onchange();
  }

  /* 
    App errors are errors that are not related to the simulation, but to the app itself.
  */
  public pushAppError(message:string)
  {
    this._appErrors.push(message);
  }

  /*
    Debug messages that should not be presented to the end user
  */
  public pushInternalMessage(message:string)
  {
    if(this._appInternalMsgs.includes(message) == false)
    {
      this._appInternalMsgs.push(message);
    }
    
  }

  public get appErrors(): Array<string>
  {
    return this._appErrors;
  }

  public get appInternalMessages(): Array<string>
  {
    return this._appInternalMsgs;
  }

  public popAppError(): string{
    return this._appErrors.pop() ?? "";
  }

  public popAppInternalMessage(): string{
    return this._appInternalMsgs.pop() ?? "";
  }

  private simErrorToString(error: SimError): string {
    let lineNumber = SharedData.instance.code
      .split("\n")
      .findIndex((l) => l.includes(error.instruction));
    if (error.line == -1 || error.line == undefined)
      error.line = lineNumber + 1;
    return `${error.message} at cycle ${error.cycle} and PC (${error.PC}), line ${error.line} instruction ${error.instruction}.`;
  }

  public getErrors(): string {
    if (this._error.length == 0) return "";
    return this._error
      .filter((x) => x.type != ErrorType.Warning)
      .map(this.simErrorToString)
      .join("\n");
  }

  public getConsole(): string {
    return this._console.join("");
  }

  public getDebug(): string {
    return this._debug.join("\n");
  }

  public clearDebug(): void {
    this._debug = [];
    this._ondebugchange();
  }

  public clearConsole(): void {
    this._console = [];
    this._error = [];
    this._onconsolechange();
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
