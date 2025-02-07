import { useToast } from "@chakra-ui/react";
import React from "react";
import MonoMIPS from "../../../../../Hardware/Mono Mips/MonoMIPS";
import Logger from "../../../../../Service/Logger";
import SharedData, { Instruction } from "../../../../../Service/SharedData";
import SimulatorService from "../../../../../Service/SimulatorService";
import WorkerService from "../../../../../Service/WorkerService";
import AssemblyEditor from "../../../../AssemblyEditor";
import { useProgramStore } from "../../SimulatorStore";
import EditorView from "../EditorTab";
import { ScreenRenderer } from "../Screen";
import { useTabs } from "./MultiWindowContext";

export default function SingleWindow ({ callExecuteStep }: { callExecuteStep: () => void })
  {

    const [program, setProgram] = React.useState<Array<Instruction>>();
    const { setProgram: setProgramStore } = useProgramStore.getState();
    const {selectedTab, setEditorCode} = useTabs();
    
     // Handles the assembly code present in the editor
    const [code, setCode] = React.useState<string>("");
    const toast = useToast();



    // Holds the shared state of the application
    let share: SharedData = SharedData.instance;

    // Logger instance
    let log: Logger = Logger.instance;

    let simservice: SimulatorService = SimulatorService.getInstance();


     // Updates the assembly code when the code changes
    function onEditorChange(value: string | undefined, event: any) {
        setCode(value!);
        setEditorCode(selectedTab!, value!);
        share.code = value ?? code;
    }

    function forceGetCode() {

        if (share.monacoEditor == null) {
          log.pushAppError("Monaco editor is null")
          return;
        }
    
        // console.log("monaco editor value ", share.monacoEditor.getValue());
        // console.log("code ", code);

        if (code == "" && share.monacoEditor != null) {
          let monacoCode = share.monacoEditor.getValue();
          setCode(monacoCode);
          share.code = monacoCode;
        }
      }
    
      function setScreenRendererCanva(){
        try{
          let canva = (document.getElementById("screenCanvas") as HTMLCanvasElement).getContext("2d");
          ScreenRenderer.instance.draw = canva;
        }
        catch{}
      }

    function assembleCode()
    {
        // first, we have to link our canvas with our ScreenRenderer
        setScreenRendererCanva()

        // if code state is empty, get code from monaco editor and update share.code
        forceGetCode();
    
        //resets the program
        share.program = [];
    
        // Assembles the code
        simservice.assembledCode = simservice.assemble(share.code);
        // share._debugMemory();
    
        setProgram(simservice.program);
        share.program = simservice.program;
        
        setProgramStore(simservice.program);


        if (log.getErrors().length == 0 && log.appErrors.length == 0) {
        toast({
            title: "Code assembled",
            description: "Your code has been assembled",
            status: "success",
            duration: 4000,
            isClosable: true,
        });
        } else {
        toast({
            title: "Assemble failed",
            description:
            "Your code has not been assembled, please check the terminal for errors",
            status: "error",
            duration: 4000,
            isClosable: true,
        });
        }
    }

    function runCode() {

        // first, we have to link our canvas with our ScreenRenderer
        setScreenRendererCanva()
        share.ibuffer = [0];
        // share.resetStartMemory();

        if (share.currentProcessor == null) share.currentProcessor = new MonoMIPS();

        share.currentProcessor.halted = false;
        WorkerService.instance.runCode(share.program, share.processorFrequency);

        console.log(`Running at frequency ${share.processorFrequency}`)

        
    }

    return (
      <>
      {/* <Input placeholder="Recent" variant={"filled"} onChange={(e) => { */}

      {/* }} /> */}
      {/* <AssemblyEditor onEditorChange={() => {}} /> */}
      <EditorView onEditorChange={onEditorChange} assembleBtn={assembleCode} runBtn={runCode} callExecuteStep={callExecuteStep} />
      </>
    )
  }