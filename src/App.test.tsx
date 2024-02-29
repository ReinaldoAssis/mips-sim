import { assert } from "console";
import MonoMIPS from "./Hardware/Mono Mips/MonoMIPS";
import SimulatorService from "./Service/SimulatorService";
import { render } from "./test-utils";

const sim : SimulatorService = SimulatorService.getInstance();
const mono : MonoMIPS = new MonoMIPS();

// test("fibonacci", () => 
// {
//     let code = `addi $t0, $zero, 0 #f1
//     addi $t1, $zero, 1 #f2
//     addi $a0, $zero, 14 #n - 1
    
//     fibonacci:
//         addi $a0, $a0, -1
//         add $t2, $t0, $t1 #soma
//         add $t0, $zero, $t1 #f1 = f2
//         add $t1, $zero, $t2 #f2 = soma
//         beq $a0, $zero, main
//         bne $a0, $zero, fibonacci
    
//     main:
//         addi $v0, $t1, 0
//         call 1`;

//     sim.assemble(code);
//     mono.loadProgram(sim.program);
//     mono.execute();
//     expect(mono.regbank[1]).toBe(610);
//     mono.reset();

// });

// test("offsets", () => {
//     let code = `
//     addi $t0 $zero 10
//     addi $t1 $zero 15
//     sw $t1 10($t0)
//     lw $v0 20($zero)
//     `;
//     sim.assemble(code);
//     mono.loadProgram(sim.program);
//     mono.execute();
//     expect(mono.regbank[1]).toBe(15);
//     mono.reset();

// })

test("null", ()=>{
    let t = true;
    expect(t).toBe(true);
})