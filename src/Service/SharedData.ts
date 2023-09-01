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
  halted: boolean;
  instructionSet: Array<string>;
}

export interface ICachedProgram {
  name: string;
  id: number;
  code: string;
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

  public cycles_cap: number = 7000;
  // monaco editor instance
  public monacoEditor: any = null;
  // monaco instance
  public monaco: any = null;
  // Current address of the program
  public currentPc: number = 0x00400000;
  // Start address of the program
  public pcStart: number = 0x00400000;
  // Start address of the stack
  public stackStart: number = 0xFFF9E57F;
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

  public updateCode(){
    if(this.monacoEditor) this._code = this.monacoEditor.getValue();
  }

  public get code(): string {
    // if (this.monacoEditor) return this.monacoEditor.getValue();
    // else return this._code;
    return this._code;
  }

  public set code(value: string) {
    this._code = value;
  }

  public updateMonacoCode(){
    if(this.monacoEditor) this.monacoEditor.setValue(this.code);
  }

  public set processorFrequency(value: number) {
    this._processorFrequency = value;
    if (this.currentProcessor) this.currentProcessor.frequency = value;
  }

  public get processorFrequency(): number {
    return this._processorFrequency;
  }

  /*
    Gets a value from local storage
    @param key: key of the item to be retrieved
    @returns the value of the item, or null if it does not exist
  */
  public getCached(key:string){
    let parsed = JSON.parse(localStorage.getItem(key) ?? "null");
    console.log(`Getting ${key} from local storage, value: ${parsed}`)
    return parsed;
  }

  /*
    Stores a value in local storage
    @param key: key of the item to be stored
    @param value: value of the item to be stored
    @param ignoreStringify: if true, the value will not be stringified
  */
  public setCached(key:string, value:any, ignoreStringify:boolean = false){
    try{
      if(!ignoreStringify) value = JSON.stringify(value);
      localStorage.setItem(key, value);
      console.log(`Saved ${key} in local storage`)
    } catch{
      //TODO: implementar tela de erro
      console.log(`Error saving ${key} in local storage`)
    }
  }

  /*
   Removes a cached item from local storage if it exists
    @param key: key of the item to be removed
    @returns true if the item was removed, false otherwise
  */
  public removeCached(key:string) : boolean {
    if (this.existsCached(key) == false) return false;
    localStorage.removeItem(key);
    return true;
  }

  /*
    Checks if a cached item exists
    @param key: key of the item to be checked
    @returns true if the item exists, false otherwise
  */
  public existsCached(key:string){
    return localStorage.getItem(key) !== null;
  }

  /*
    Updates a cached item if it exists, otherwise creates it
    @param key: key of the item to be updated
    @param value: value of the item to be updated
    @param ignoreStringify: if true, the value will not be stringified
  */
  public updateCached(key:string, value:any, ignoreStringify:boolean = false){
    this.removeCached(key);
    this.setCached(key, value, ignoreStringify);
  }

  /*
    Saves a program in local storage and updates the list of cached programs
    @param programName: name of the program to be saved
    @returns void
  */
  public saveProgram(programName: string, code: string){
    if(this.existsCached("cached_programs")){
      let list = this.getCached("cached_programs") as Array<string>;
      if (!list.includes(programName)){
        list.push(programName);
      this.updateCached("cached_programs", list);
      }

      this.setCached(programName, code);
      return;
    }

    this.setCached("cached_programs", [programName]);
    this.setCached(programName, code);

  }

  /*
    Load program from local storage if it exists
    @param programName: name of the program to be loaded
    @returns code or null
  */
  public loadProgram(programName: string){
    if (!this.existsCached(programName)) return null;
    return this.getCached(programName);
  }

  public getListOfCachedPrograms() : Array<string> {
    let chached_programs = this.getCached("cached_programs");
    if(chached_programs) return chached_programs as Array<string>;
    else return [];
  }


  private constructor() {}

  public static get instance(): SharedData {
    if (!SharedData._instance) SharedData._instance = new SharedData();
    return SharedData._instance;
  }
}
