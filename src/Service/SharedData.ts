export interface Processor {
  frequency: number;
  executeStep(): number;
  loadProgram(program: Array<string>): void;
  instructionSet: Array<string>;
}

export interface ThemeData {
  editorBackground: string;
}

export default class SharedData {
  private static _instance: SharedData;

  //public stepMode: boolean = false;
  //   public currentLine: number = 0;
  //   public onStep: Function = (n: number) => {};

  public static theme: ThemeData = {
    editorBackground: "#282a36",
  };

  // monaco editor instance
  public monacoEditor: any = null;
  // monaco instance
  public monaco: any = null;
  // Current address of the program
  public currentPc: number = 0x00400000;
  // Start address of the program
  public pcStart: number = 0x00400000;
  // Pure text code
  private _code: string = "";
  // Current model for simulation
  private _currentProcessor: Processor | null = null;

  public onProcessorChange: Function = (processor: Processor) => {};

  public get currentProcessor(): Processor | null {
    this.onProcessorChange(this._currentProcessor);

    return this._currentProcessor;
  }

  public set currentProcessor(value: Processor | null) {
    this._currentProcessor = value;
    let instructionSet = this._currentProcessor?.instructionSet ?? [];

    //configure mono editor to current instruction set
    if (this.monaco && this._currentProcessor) {
      //TODO
    }
  }

  public get currentStepLine(): number {
    return 1; //this.currentPc - this.PcStart;
  }

  public get code(): string {
    if (this.monacoEditor) return this.monacoEditor.getValue();
    else return this._code;
  }

  public set code(value: string) {
    this._code = value;
  }

  private constructor() {}

  public static get instance(): SharedData {
    if (!SharedData._instance) SharedData._instance = new SharedData();
    return SharedData._instance;
  }
}
