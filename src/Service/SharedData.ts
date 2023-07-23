import BinaryNumber from "../Hardware/BinaryNumber";
import MonoMIPS from "../Hardware/Mono Mips/MonoMIPS";
import SISMIPS from "../Hardware/SIS Mips/SIS";
import Logger from "./Logger";

export interface Instruction {
  humanCode: string;
  index: number;
  machineCode: BinaryNumber;
  memAddress: BinaryNumber;
}

export interface IProcessor {
  refname: string;
  frequency: number;
  executeStep(): number;
  loadProgram(program: Array<string>): void;
  execute(): void;
  reset(): void;
  instructionSet: Array<string>;
}

export interface ThemeData {
  editorBackground: string;
}

export default class SharedData {
  private static _instance: SharedData;
  private log = Logger.instance;

  public static theme: ThemeData = {
    editorBackground: "#282a36",
  };

  public cycles_cap: number = 10000;
  // monaco editor instance
  public monacoEditor: any = null;
  // monaco instance
  public monaco: any = null;
  // Current address of the program
  public currentPc: number = 0x00400000;
  // Start address of the program
  public pcStart: number = 0x00400000;
  // Interval responsible for running steps at frequency
  public interval : NodeJS.Timeout | null = null;
  // Pure text code
  private _code: string = "";
  // Current model for simulation
  private _currentProcessor: IProcessor | null = null;

  private _processorFrequency: number = 100;

  //Stores the original program and the machine code
  public program: Array<Instruction> = [];

  public onProcessorChange: Function = (processor: IProcessor) => {};

  public get currentProcessor(): IProcessor | null {
    //this.onProcessorChange(this._currentProcessor);
    if(this._currentProcessor) this._currentProcessor.frequency = this.processorFrequency;
    return this._currentProcessor;
  }

  public set currentProcessor(value: IProcessor | null) {

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

  public set currentStepLine(value: number) {
    if (!this.monacoEditor || !this.monaco) {
      this.log.pushInternalMessage("Monaco editor not initialized");
      return;
    }
    // Displaying the current line is only useful if the processor is running 
    // at a low frequency
    if (this.processorFrequency > 100){
      this.log.pushInternalMessage(`Processor frequency (${this.processorFrequency}) is too high to display current line`)
      return;
    }

    this.log.pushInternalMessage(`Current frequency ${this.processorFrequency} and p ${this.currentProcessor?.frequency}`)

    var selectionRange = new this.monaco.Range(
      value + 1,
      0,
      value + 1,
      this.monacoEditor.getModel().getLineMaxColumn(value + 1)
    );
    this.monacoEditor.setSelection(selectionRange);
    this.monacoEditor.revealLineInCenter(value + 1);
  }

  public get code(): string {
    if (this.monacoEditor) return this.monacoEditor.getValue();
    else return this._code;
  }

  public set code(value: string) {
    this._code = value;
  }

  public set processorFrequency(value: number) {
    this._processorFrequency = value;
    if (this.currentProcessor) this.currentProcessor.frequency = value;
  }

  public get processorFrequency(): number {
    return this._processorFrequency;
  }

  private constructor() {}

  public static get instance(): SharedData {
    if (!SharedData._instance) SharedData._instance = new SharedData();
    return SharedData._instance;
  }
}
