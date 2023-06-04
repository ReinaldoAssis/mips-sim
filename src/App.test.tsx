import React from "react";
import { screen } from "@testing-library/react";
import { render } from "./test-utils";
import { App } from "./App";
import SimulatorService from "./Service/SimulatorService";
import SISMIPS from "./Hardware/SIS Mips/SIS";
import BinaryNumber from "./Hardware/BinaryNumber";

// test("renders learn react link", () => {
//   render(<App />)
//   const linkElement = screen.getByText(/learn chakra/i)
//   expect(linkElement).toBeInTheDocument()
// })
let simservice = SimulatorService.getInstance();

test("Binary static add", () => {
  let a = new BinaryNumber("2");
  let b = new BinaryNumber("6");
  let c = BinaryNumber.add(a.value, b.value);
  expect(c.value).toBe(8);
});

test("Binary hex instance", () => {
  let a = new BinaryNumber("-6");
  expect(a.value).toBe(-6);
  expect(a.getBinaryValue(16).length).toBe(16);
  expect(a.getBinaryValue(16)).toBe("1111111111111010");
});

test("Binary negative", () => {
  let a = new BinaryNumber("-2");
  let b = new BinaryNumber("6");
  let c = BinaryNumber.add(a.value, b.value);
  expect(c.value).toBe(4);
  let bin = a.getBinaryValue(32);
  expect(bin).toBe("11111111111111111111111111111110");

  //expect(new BinaryNumber("0b" + bin).value).toBe(-2);
});

test("treat offset", () => {
  let offset = simservice.treatOffsets("10 (t3)");
  expect(offset).toBe("10 t3");
});

test("treat labels", () => {
  let sample_code = `
  main:
  addi t0 zero 1
  addi t1 zero 10
  sub t2 t1 t0
  j loop

loop:
    `;

  let treated = simservice.treatLabels(sample_code);
  expect(treated).toContain("j 10000000000000000010000");
});

test("check assembler compiler instructions", () => {
  simservice.register_prefix = "";
  let add = simservice.assemble("add t0 t1 t2");
  expect(add).toContain("0x012a4020");

  let addi = simservice.assemble("addi t0 t1 16");
  expect(addi).toContain("0x21280010");

  let addiu = simservice.assemble("addiu t0 t1 16");
  expect(addiu).toContain("0x25280010");

  let addu = simservice.assemble("addu t0 t1 t2");
  expect(addu).toContain("0x012a4021");

  let and = simservice.assemble("and t0 t1 t2");
  expect(and).toContain("0x012a4024");

  let andi = simservice.assemble("andi t0 t1 16");
  expect(andi).toContain("0x31280010");

  let beq = simservice.assemble("beq t0 t1 16");
  expect(beq).toContain("0x11090010");

  let bne = simservice.assemble("bne zero v1 255");
  expect(bne).toContain("0x140300ff");

  let lui = simservice.assemble("lui t0 16");
  expect(lui).toContain("0x3c080010");

  let lw = simservice.assemble("lw t0 16(t1)");
  expect(lw).toContain("0x8d280010");

  let nor = simservice.assemble("nor t5 t4 t3");
  expect(nor).toContain("0x018b6827");

  let or = simservice.assemble("or t5 t4 t3");
  expect(or).toContain("0x018b6825");

  let ori = simservice.assemble("ori t5 t4 16");
  expect(ori).toContain("0x358d0010");

  let slt = simservice.assemble("slt t5 t4 t3"); //*
  expect(slt).toContain("0x018b682a");

  let slti = simservice.assemble("slti t5 t4 16");
  expect(slti).toContain("0x298d0010");

  let sltiu = simservice.assemble("sltiu t5 t4 16");
  expect(sltiu).toContain("0x2d8d0010");

  let sltu = simservice.assemble("sltu t5 t4 t3");
  expect(sltu).toContain("0x018b682b");

  let sw = simservice.assemble("sw t0 16(t1)");
  expect(sw).toContain("0xad280010");

  let sub = simservice.assemble("sub t0 t1 t2");
  expect(sub).toContain("0x012a4022");

  let subu = simservice.assemble("subu t0 t1 t2");
  expect(subu).toContain("0x012a4023");

  let xor = simservice.assemble("xor t0 t1 t2");
  expect(xor).toContain("0x012a4026");

  let xori = simservice.assemble("xori t0 t1 16");
  expect(xori).toContain("0x39280010");

  let j = simservice.assemble("j 16");
  expect(j).toContain("0x08000010");

  let jal = simservice.assemble("jal 16");
  expect(jal).toContain("0x0c000010");

  let jr = simservice.assemble("jr t0");
  expect(jr).toContain("0x01000008");

  let sll = simservice.assemble("sll t0 t1 16");
  expect(sll).toContain("0x00094400");

  let sllv = simservice.assemble("sllv t0 t1 t2");
  expect(sllv).toContain("0x01494004");

  let sra = simservice.assemble("sra t0 t1 16");
  expect(sra).toContain("0x00094403");

  let srav = simservice.assemble("srav t0 t1 t2");
  expect(srav).toContain("0x01494007");

  let srl = simservice.assemble("srl t0 t1 16");
  expect(srl).toContain("0x00094402");

  let srlv = simservice.assemble("srlv t0 t1 t2");
  expect(srlv).toContain("0x01494006");

  let div = simservice.assemble("div t0 t1");
  expect(div).toContain("0x0109001a");

  let divu = simservice.assemble("divu t0 t1");
  expect(divu).toContain("0x0109001b");

  let mult = simservice.assemble("mult t0 t1");
  expect(mult).toContain("0x01090018");

  let multu = simservice.assemble("multu t0 t1");
  expect(multu).toContain("0x01090019");

  let mfhi = simservice.assemble("mfhi t0");
  expect(mfhi).toContain("0x00004010");

  let mflo = simservice.assemble("mflo t0");
  expect(mflo).toContain("0x00004012");

  let mthi = simservice.assemble("mthi t0");
  expect(mthi).toContain("0x01000011");

  let mtlo = simservice.assemble("mtlo t0");
  expect(mtlo).toContain("0x01000013");

  let bgtz = simservice.assemble("bgtz t0 16");
  expect(bgtz).toContain("0x1D000010");

  let blez = simservice.assemble("blez t0 16");
  expect(blez).toContain("0x19000010");

  let bltzal = simservice.assemble("bltzal t0 16");
  expect(bltzal).toContain("0x05100010");

  let bgezal = simservice.assemble("bgezal t0");
  expect(bgezal).toContain("0x05110010");
});
