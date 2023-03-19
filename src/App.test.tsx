import React from "react";
import { screen } from "@testing-library/react";
import { render } from "./test-utils";
import { App } from "./App";
import SimulatorService from "./Service/SimulatorService";

// test("renders learn react link", () => {
//   render(<App />)
//   const linkElement = screen.getByText(/learn chakra/i)
//   expect(linkElement).toBeInTheDocument()
// })

test("treat offset", () => {
  let simservice = SimulatorService.getInstance();
  let offset = simservice.treatOffsets("10 (t3)");
  expect(offset).toBe("10 t3");
});

test("check assembler compiler instructions", () => {
  let simservice = SimulatorService.getInstance();
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
});
