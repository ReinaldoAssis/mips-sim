import { addr, INPUT_BUFFER_ADDR, SCREEN_MEM_END, SCREEN_MEM_START } from "../Hardware/TemplatePorcessor";
import Logger, { ErrorType } from "./Logger";
import SharedData, { Instruction } from "./SharedData";

// Label type
type Label = {
  name: string;
  address: number;
};

export default class SimulatorService {
  public editorValue: string = "";
  public assembledCode: string = "";
  private log: Logger = Logger.instance;
  private share: SharedData = SharedData.instance;

  public currentAddr = this.share.pcStart;
  public currentCodeInstruction: string = "";

  public program : Array<Instruction> = new Array<Instruction>();

  // an array containing all the instructions names
  private instruction_set = [
    "add",
    "addi",
    "addiu",
    "addu",
    "and",
    "andi",
    "beq",
    "bne",
    "lui",
    "lw",
    "nor",
    "or",
    "ori",
    "slt",
    "slti",
    "sltiu",
    "sltu",
    "sw",
    "sub",
    "subu",
    "xor",
    "xori",
    "j",
    "jal",
    "jr",
    "sll",
    "push",
    "pop",
    "sllv",
    "sra",
    "srav",
    "srl",
    "srlv",
    "div",
    "divu",
    "mult",
    "multu",
    "mfhi",
    "mflo",
    "mthi",
    "call",
  ];

  public register_prefix = "$";

  private static instance: SimulatorService;
  private constructor() {
    // ...
  }

  // Singleton pattern to avoid multiple instances of the service
  // @returns {SimulatorService} The instance of the service
  public static getInstance(): SimulatorService {
    if (!SimulatorService.instance) {
      SimulatorService.instance = new SimulatorService();
    }
    return SimulatorService.instance;
  }

  // clear all comments from the code
  // @param {string} code - The code to be cleaned
  public clearComments(code: string): string {
    let lines = code.split("\n");
    let cleanCode = "";
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.indexOf("#") !== -1) {
        line = line.substring(0, line.indexOf("#"));
      }
      cleanCode += line + "\n";
    }
    return cleanCode;
  }

  // clear all special characters from the code
  public clearSpecialChars(code: string): string {
    let temp = code
      .replaceAll("\t", "")
      .replaceAll("    ", "")
      .replaceAll(",", " ");

    return temp.replaceAll("  ", " ");
  }

  // treat the offsets in the code, like "4 (label)"
  // @param {string} code - The code to be treated
  public treatLabelOffsets(code: string): string {
    // regex to find offsets such as "4 (label)" and "4(label)"
    let offsets = Array.from(code.matchAll(/\d+\s?\([a-z]+\d*\)/g))[0];

    if (!offsets) return code; // if there are no offsets, return the code

    offsets.forEach((x) => {
      // treat the offset to separate the value from the label
      let offset = x.toString().replaceAll(" ", "");
      let value = offset.substring(0, offset.indexOf("("));
      let label = offset.substring(
        offset.indexOf("(") + 1,
        offset.indexOf(")")
      );

      // replace the offset with the value and the label
      // this is what instructions expect to find
      code = code.replaceAll(x.toString(), value + " " + label);
    });

    return code;
  }

  // treat the offsets in the code, like "4 ($t0)"
  // @param {string} code - The code to be treated
  public treatOffsets(code: string): string {
    let offsets = Array.from(code.matchAll(/\d+\s?\(\$\w+\d*\)/g));
    if (!offsets) return code;

    offsets.forEach((x) => {
      // treat the offset to separate the value from the register
      let offset = x.toString().replaceAll(" ", "");
      let value = offset.substring(0, offset.indexOf("("));
      let reg = offset.substring(offset.indexOf("(") + 1, offset.indexOf(")"));

      // replace the offset with the value and the label
      // this is what instructions expect to find
      code = code.replaceAll(x.toString(), value + " " + reg);
    });

    return code;
  }

  /* TODO: DESCRIPTION */
  public treatLabels(code: string): string {
    // regex to find labels such as "label:"
    let labels = code.match(/^\s*([a-zA-Z_]\w*):$/gm);

    if (!labels) return code; // if there are no labels, return the code

    // array to store the labels and their addresses
    let addrlabels: Array<Label> = new Array<Label>();

    // add all existing labels to the array with an initial addr of -1
    labels.forEach((x) => {
      //separate the value from the label
      addrlabels.push({ name: x.toString().replace(/[\n\t\s]/g, '').replace(":", ""), address: -1 });
    });

    code = this.clearComments(code);
    code = this.clearSpecialChars(code);

    let lines = code.split("\n");
    let PC: number = this.share.pcStart;

    // for each line, check if it's an instruction or a label
    for (let i = 0; i < lines.length; i++) {
      let tokens = lines[i].split(" ");

      // if the line is empty, skip it
      if (tokens[0] === "") continue;

      // if it's an instruction, add 4 to the PC
      if (this.instruction_set.includes(tokens[0].toLowerCase())) {
        let tk = tokens[0].toLowerCase();
        if (tk == "push" || tk == "pop") {
          PC += 8;
        }
        else PC += 4;
      }
      // if it's a label, save the PC value
      else {
        let islabel = addrlabels.find(
          (x) => x.name === tokens[0].replace(":", "")
        );

        // console.log(`addr labels: ${addrlabels}  token: ${tokens[0].replace(":", "")}`)

        if (islabel !== undefined) {
          islabel.address = PC; //sets the address of the label with a padding of 26 bits
        }
      }
    }

    //removes the labels definitions from the code (such as "label:")
    // labels.forEach((x) => (code = code.replaceAll(x.toString(), "")));
    //replaces the labels with their addresses
    addrlabels.forEach(
      (x) =>
        (code = code.replaceAll(
          new RegExp("\\b" + x.name + "\\b", "gm"),
          x.address.toString()
        ))
    );

    //REMOVE
    // addrlabels.forEach(x => {
    //     console.log(`label ${x.name} converted to ${x.address}`);
    // })

    // this.found_labels = addrlabels;

    return code;
  }

  /*
    * Computes the offset for branch instructions
    * @param {string} token - The token to be computed
    * @param {number} pc - The current PC value
  */
  private computeBrenchOffset(token: string, pc: number): string {
    // if the token is a label, convert it to its address, 
    // otherwise, use it as is
    if (!token.toLowerCase().includes("0x")) {
      let offset : number = Number(token); //the label is already in binary

      offset -= pc + 4;

      return this.signedToBinary(offset, 16);
    } 
    else 
    {
      //if it's not a label, parse it as a number
      //the number is treated as already the offset, so the calculation is not necessary
      return  Number(token).toString(2).padStart(16,"0");
    }
  }

  private checkInvalidLabel(label: string) {
    if (new RegExp("/[a-zA-Z]/g").test(label)) {
      this.log.error(
        `Couldn't find label ${label}`,
        this.currentCodeInstruction,
        0,
        this.currentAddr,
        -1,
        ErrorType.InvalidLabel
      );
    }
  }

  private handleDirectives(code: string): string {
    // Regular expression to match lines starting with a period followed by a word
    const directiveRegex = /^\.(\w+)\s+(.+)$/gm;
    const directives = [];

    // Split the code into lines to handle replacements
    const lines = code.split('\n');
    
    let match;
    while ((match = directiveRegex.exec(code)) !== null) {
        const directive = match[1];
        const argumentsString = match[2];
        const args = argumentsString.split(' ').map(arg => arg.trim());

        directives.push({
            directive,
            args
        });

        if (directive === "include") {
            // TODO: Validate arguments
            if (args.length !== 1 || !args[0].startsWith("\"") || !args[0].endsWith("\"")) {
                throw new Error(`Invalid arguments for .include directive: ${argumentsString}`);
            }

            // Load the imported code
            const fileName = args[0].replaceAll("\"",""); // Remove the surrounding quotes
            const importedCode = this.share.loadProgram(fileName);

            // Replace the directive line with the imported code
            const directiveLine = match[0];
            const lineIndex = lines.findIndex(line => line.includes(directiveLine));
            const line_text = lines[lineIndex]

            // console.log(`replacing line, ${fileName} -> `+ line_text)
            // console.log("imported code", importedCode)

            code = code.replace(line_text, importedCode)

        }

        if (directive == "def")
        {
          // TODO: Validate arguments
          if (args.length !== 2) {
            throw new Error(`Invalid arguments for .def directive: ${argumentsString}`);
          }
          
          // there are more efficent ways of doing this, but I don't find the extra complexity 
          // worth it. In this implementation, we search line by line because we want to support
          // multiple .def for the same symbol.
          code.split("\n").forEach(line => {
            if (line.startsWith(".def"))
            {
              // ex: .def name  $s0
              //          arg0 arg1
              const args2 = line.replace(".def ","").split(" ")

              // if they are defining the same symbol, stop (another .def directive with the same symbol)
              if (args2[0] == args[0])
              {
                return;
              }
              
            } else
            {
              // const newline = line.replaceAll(args[0], args[1]);

              // TODO: check if this works
              let newline : Array<string> = [];
              line.split(" ").forEach(l_token => {
                if (l_token == args[0]) newline.push(args[1])
                else newline.push(l_token)
              })

              // const newline = line.replaceAll(args[0], args[1]);
              code = code.replaceAll(line,newline.join(" "));
              // console.log(`found .def match with ${args[0]} ${args[1]}`)
            }



          })

        }
    }

    console.log("code directives", directives);

    return code;
}

  private handleConstants(code: string): string {
    const ck: Record<string, number> = { "PC_START": this.share.pcStart, "SCREEN_MEM_START": SCREEN_MEM_START,
    "SCREEN_MEM_END": SCREEN_MEM_END, "INPUT_BUFFER_ADDR": INPUT_BUFFER_ADDR, "STACK_START": this.share.stackStart };
    const keys = Object.keys(ck);

    keys.forEach(k => {
      code = code.replaceAll(k, ck[k].toString());
    });

    return code;
  }

  public signedToBinary(n : number, pad : number) : string
  {
    let binary = (n >>> 0).toString(2).padStart(pad, "0");
    if (binary.length > pad) {
      return binary.substring(binary.length - pad);
    }
    return binary;
  }

  // assemble the code to machine code
  // @param {string} code - The code to be assembled
  // @returns {string} The machine code
  public assemble(code: string): string {
    // treats the code to be assembled
    // let originalCode = code;

    // originalCode = originalCode.replace(/\t/g, "").replace(/    /g, "")

    // code = this.clearComments(code);
    // code = this.clearSpecialChars(code);
    this.program = new Array<Instruction>();
    this.share.resetStartMemory();

    code = this.handleDirectives(code);
    code = this.handleConstants(code);
    code = this.treatLabelOffsets(code);
    code = this.treatOffsets(code);
  
    code = this.treatLabels(code);

    console.log(code);
    console.log("========");
    console.log(JSON.stringify(code));
    console.log("========");

    const pushInstruction = (instruction: string, i:number, humanCode:string="") => {
      // Saves the state so we can look up the instruction later in a readable format
      this.share.program.push({
        humanCode: humanCode == "" ? lines[i] : humanCode,
        index: i,
        machineCode: parseInt(instruction,2),
        memAddress: this.currentAddr,
      });

      this.program.push({
        humanCode: humanCode == "" ? lines[i] : humanCode,
        index: i,
        machineCode: parseInt(instruction,2),
        memAddress: this.currentAddr,
      });

      this.currentAddr += 4; //increment PC by 4
      machineCode = "0x"+parseInt(instruction,2).toString(16);

      // console.log(`binary ${instruction}`)

      // console.log(
      //   `[Assembler] Assembled instruction ${this.currentCodeInstruction} to ${machineCode}!`
      // );
    }

    // split the code into lines
    let lines = code.split("\n");

    // final machine code
    let machineCode = "";


    // one line is converted at a time
    for (let i = 0; i < lines.length; i++) {
      this.currentCodeInstruction = lines[i];

      // split the line into tokens (arguments)
      let tokens = lines[i].split(" ");

      // DYNAMIC DIRECTIVES HANDLER ===========================================
      // if it is not an instruction, it may be a directive
      if (this.instruction_set.indexOf(tokens[0].toLowerCase()) == -1){
        // console.log(`token ${tokens[0]} was not in the IS`)

        const _tk = tokens[0].toLowerCase()
        if (_tk.startsWith(".") == false) continue; // it is not a directive

        
        if (_tk == ".org" && tokens.length == 2)
        {
          const newPC = Number.parseInt(tokens[1])
          this.currentAddr = newPC;
        }

        else if (_tk == ".dw") 
        {
          
          let arg = tokens.join(" ").replace(".dw","").trim();

          // check if its a string
          // adds a terminator byte (all zeros)
          if (arg.startsWith("\"") && arg.endsWith("\""))
          {
            arg = arg.replaceAll("\"","")
            const bytes = arg.length + 1

            // let arr : Array<addr> = []

            for (let j = 0; j<bytes - 1; j++)
              this.share.startMemory.push({address:this.currentAddr+(j*4), value:arg[j].charCodeAt(0)})

            this.share.startMemory.push({address:this.currentAddr+((bytes-1)*4), value:0})


            this.currentAddr += bytes;
          }
          else
          {
            let n = 0;
            if(arg.startsWith("0x"))
            {
              n = Number.parseInt(arg.replace("0x",""),16) & 0xffffffff
              
            }
            else if (arg.startsWith("0b"))
            {
              n = Number.parseInt(arg.replace("0b",""),2) & 0xffffffff
            } 
            else 
            {
              n = Number.parseInt(arg) & 0xffffffff
            }

            this.share.startMemory.push({address:this.currentAddr, value: n})
            this.currentAddr += 4
          }

        }

        continue;
      }
      // ===========================================================================

      tokens = tokens.filter((x) => x !== "" && x.startsWith("#") == false);
      if (tokens.length == 0) continue;

      // result of the assembly of the line
      let instruction: string = "";

      // if the line is empty, skip it
      if (tokens[0] === "") continue;

      //console.log(`PC = ${PC.toHex()}`);

      // all instructions are dealt with here
      switch (tokens[0].toLowerCase()) {
        case "add":
          if (tokens.length < 4)
            this.log.error(
              "Invalid number of arguments for ADD instruction",
              tokens.join(" "),
              0,
              this.currentAddr,
              -1,
              ErrorType.InvalidNumberOfArguments
            );

          instruction = "000000"; //opcode
          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100000"; //function code funct

          break;

        case "addi":
          instruction = "001000";

          if (tokens.length < 4 || tokens.length > 4)
            this.log.error(
              `Invalid number of arguments for ADDI instruction (expected 3, got ${
                tokens.length - 1
              })`,
              tokens.join(" "),
              0,
              this.currentAddr,
              -1,
              ErrorType.InvalidNumberOfArguments
            );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          
          instruction += this.signedToBinary(parseInt(tokens[3]), 16); //immediate value in binary
          

          break;

        case "addiu":
          instruction = "001001";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for addiu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += this.signedToBinary(parseInt(tokens[3]), 16);; //immediate value in binary

          break;

        case "addu":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for addu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100001"; //function code funct

          break;

        case "mult":
          instruction = "000000";
          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += this.assembleRegister(tokens[2]); //source register rt
          instruction += "0000000000"; //shift amount and rd are 0
          instruction += "011000"; //function code funct

        break;

        case "div":
          instruction = "000000";
          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += this.assembleRegister(tokens[2]); //source register rt
          instruction += "0000000000"; //shift amount and rd are 0
          instruction += "011010"; //function code funct
        break;

        case "mfhi":
          instruction = "000000";
          instruction += "00000000000"; //rs, rt are 0
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000";
          instruction += "010000"; //function code funct

        break;

        case "mflo":
          instruction = "000000";
          instruction += "00000000000"; //rs, rt are 0
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000";
          instruction += "010010"; //function code funct

        break;

        case "and":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for and instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100100"; //function code funct

          break;

        case "andi":
          instruction = "001100";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for andi instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += this.signedToBinary(parseInt(tokens[3]), 16);; //immediate value in binary

          break;

        case "beq":
          instruction = "000100";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for beq instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += this.assembleRegister(tokens[2]); //source register rt

          //calculate the offset
          //the treatlabels function already converted the label to its address
          //so we just need to calculate the offset

          //but first we need to make some checks
          //check if its number or label, only hex are allowed as numbers

          instruction += this.computeBrenchOffset(tokens[3], this.currentAddr);

          break;

        case "bne":
          instruction = "000101";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for bne instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += this.assembleRegister(tokens[2]); //source register rt

          instruction += this.computeBrenchOffset(tokens[3], this.currentAddr);

          break;

        case "j":
          instruction = "000010";

          // if (tokens.length < 2)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for j instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          this.checkInvalidLabel(tokens[1]);

          instruction += Number(tokens[1]).toString(2).padStart(26,"0"); // the value tokens[1] is the label in decimal

          break;

        case "jal":
          instruction = "000011";

          // if (tokens.length < 2)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for jal instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += Number(tokens[1]).toString(2).padStart(26,"0"); //immediate value in binary

          break;

        case "jr":
          instruction = "000000";

          // if (tokens.length < 2)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for jr instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[1]); //source register rs
          instruction += "000000000000000"; //shift amount shamt
          instruction += "001000"; //function code funct

          break;

        case "lui":
          instruction = "001111";

          // if (tokens.length < 3)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for lui instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += "00000"; //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += parseInt(tokens[2],2).toString().padStart(16, "0"); //immediate value in binary

          break;

        case "nor":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for nor instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100111"; //function code funct

          break;

        case "or":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for or instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100101"; //function code funct

          break;

        case "lw":
          instruction = "100011";

          // if (tokens.length < 3)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for lw instruction!`,
          //     ErrorType.ASSEMBLER
          //   );
          
          // first we need to check if an offset value was provided
          if(tokens.length == 4){
          instruction += this.assembleRegister(tokens[3]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += this.signedToBinary(Number(tokens[2]),16); //offset value
          


          } else {
            instruction += this.assembleRegister(tokens[2]); //source register rs
            instruction += this.assembleRegister(tokens[1]); //destination register rt
            instruction += "0000000000000000"; //offset value
          }

          break;

        case "sw":
          instruction = "101011";

          // if (tokens.length < 3)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for sw instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          // first we need to check if an offset value was provided
          if(tokens.length == 4){

            instruction += this.assembleRegister(tokens[3]); //source register rs
            instruction += this.assembleRegister(tokens[1]); //destination register rt
            instruction += this.signedToBinary(Number(tokens[2]),16); //offset value

          } else {
            instruction += this.assembleRegister(tokens[2]); //source register rs
            instruction += this.assembleRegister(tokens[1]); //destination register rt
            instruction += "0000000000000000"; //offset value
          }

          break;

        case "push": //pseudo instruction
          instruction = "001000"; //addi
          instruction += this.assembleRegister("$sp"); //source register rs
          instruction += this.assembleRegister("$sp"); //destination register rt
          instruction += this.signedToBinary(-4,16); //immediate value in binary

          pushInstruction(instruction, i, "addi $sp $sp -4");

          instruction = "101011"; //sw
          instruction += this.assembleRegister("$sp"); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += "0000000000000000"; //offset value
          pushInstruction(instruction, i, `sw ${tokens[1]} 0($sp)`);

          continue;
          
        case "pop": //pseudo instruction
          instruction = "100011"; //lw
          instruction += this.assembleRegister("$sp"); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += "0000000000000000"; //offset value
          pushInstruction(instruction, i, `lw ${tokens[1]} 0($sp)`);

          instruction = "001000"; //addi
          instruction += this.assembleRegister("$sp"); //source register rs
          instruction += this.assembleRegister("$sp"); //destination register rt
          instruction += "0000000000000100"; //immediate value in binary
          pushInstruction(instruction, i, "addi $sp $sp 4");
          continue;


        case "ori":
          instruction = "001101";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for ori instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += this.signedToBinary(parseInt(tokens[3]), 16);; //immediate value in binary

          break;

        case "sll":
          instruction = "000000";
            instruction += "00000"; //source register rs
            instruction += this.assembleRegister(tokens[2]); //destination register rt
            instruction += this.assembleRegister(tokens[1]); //destination register rd
            instruction += parseInt(tokens[3]).toString(2).padStart(5,"0"); //shift amount shamt
            instruction += "000000"; //function code funct

        break;

        case "srl":
          instruction = "000000";
            instruction += "00000"; //source register rs
            instruction += this.assembleRegister(tokens[2]); //destination register rt
            instruction += this.assembleRegister(tokens[1]); //destination register rd
            instruction += parseInt(tokens[3]).toString(2).padStart(5, "0"); //shift amount shamt
            instruction += "000010"; //function code funct
          break;

        case "slt":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for slt instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "101010"; //function code funct

          break;

        case "slti":
          instruction = "001010";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for slti instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += this.signedToBinary(parseInt(tokens[3]), 16);; //immediate value in binary

          break;

        case "sltiu":
          instruction = "001011";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for sltiu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += this.signedToBinary(parseInt(tokens[3]), 16);; //immediate value in binary

          break;

        case "sltu":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for sltu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "101011"; //function code funct

          break;

        case "sub":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for sub instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100010"; //function code funct

          break;

        case "subu":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for subu instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100011"; //function code funct

          break;

        case "xor":
          instruction = "000000";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for xor instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[3]); //source register rt
          instruction += this.assembleRegister(tokens[1]); //destination register rd
          instruction += "00000"; //shift amount shamt
          instruction += "100110"; //function code funct

          break;

        case "xori":
          instruction = "001110";

          // if (tokens.length < 4)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for xori instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += this.assembleRegister(tokens[2]); //source register rs
          instruction += this.assembleRegister(tokens[1]); //destination register rt
          instruction += this.signedToBinary(parseInt(tokens[3]), 16);; //immediate value in binary

          break;

        case "call":
          instruction = "111111";

          // if (tokens.length < 2)
          //   this.log.error(
          //     `[Assembler] Invalid number of arguments for call instruction!`,
          //     ErrorType.ASSEMBLER
          //   );

          instruction += parseInt(tokens[1]).toString(2).padStart(26, "0"); //immediate value in binary

          break;
      }

      pushInstruction(instruction, i);
    }

    this.currentAddr = this.share.pcStart;
    return machineCode;
  }

  //assembles a register into a 5-bit binary string
  //@param {register} - the register to assemble
  //@returns {string} - the 5-bit binary string
  public assembleRegister(register: string): string {
    //check if register is a number, if so, return the binary value, otherwise, return the register value
    // if (register.includes("$") === false) {
    let p = this.register_prefix;
    switch (register.toLowerCase()) {
      case p + "zero":
        return "00000";

      case p + "at":
        return "00001";

      case p + "v0":
        return "00010";

      case p + "v1":
        return "00011";

      case p + "a0":
        return "00100";

      case p + "a1":
        return "00101";

      case p + "a2":
        return "00110";

      case p + "a3":
        return "00111";

      case p + "t0":
        return "01000";

      case p + "t1":
        return "01001";

      case p + "t2":
        return "01010";

      case p + "t3":
        return "01011";

      case p + "t4":
        return "01100";

      case p + "t5":
        return "01101";

      case p + "t6":
        return "01110";

      case p + "t7":
        return "01111";

      case p + "s0":
        return "10000";

      case p + "s1":
        return "10001";

      case p + "s2":
        return "10010";

      case p + "s3":
        return "10011";

      case p + "s4":
        return "10100";

      case p + "s5":
        return "10101";

      case p + "s6":
        return "10110";

      case p + "s7":
        return "10111";

      case p + "ra":
        return "11111";

      case p + "sp":
        return "11101";
    }
    // }

    let reg = register.replace("$", "");
    let regNumber = Number.parseInt(reg);
    if (regNumber < 0 || regNumber > 31) {
      this.log.error(
        "Invalid register number",
        register,
        0,
        -1,
        -1,
        ErrorType.InvalidRegister,
        1
      );
    }
    return regNumber.toString(2).padStart(5, "0");
  }

}
