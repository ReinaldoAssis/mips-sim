export interface processor {
  frequency: number;
  executeStep(): number;
  loadProgram(program: Array<string>): void;
}

export default class SharedData {
  private static _instance: SharedData;

  //public stepMode: boolean = false;
  //   public currentLine: number = 0;
  //   public onStep: Function = (n: number) => {};

  // monaco editor instance
  public monacoEditor: any = null;
  // monaco instance
  public monaco: any = null;
  // Current address of the program
  public currentPc: number = 0x00400000;
  // Start address of the program
  public PcStart: number = 0x00400000;
  // Pure text code
  private _code: string = "";
  // Current model for simulation
  public currentProcessor: processor | null = null;

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
