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

  public monacoEditor: any = null;
  public monaco: any = null;
  public currentPc: number = 0x00400000;
  public PcStart: number = 0x00400000;
  public code: string = "";

  public currentProcessor: processor | null = null;

  public get currentStepLine(): number {
    return 1; //this.currentPc - this.PcStart;
  }

  private constructor() {}

  public static get instance(): SharedData {
    if (!SharedData._instance) SharedData._instance = new SharedData();
    return SharedData._instance;
  }
}
