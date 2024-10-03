![Chakra](https://img.shields.io/badge/chakra-%234ED1C5.svg?style=for-the-badge&logo=chakraui&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)

**Choose your language**

<a target="_blank" href="https://github.com/ReinaldoAssis/mips-sim">
<img src="https://img.shields.io/badge/English%20-%20%231E90FF?style=flat-square&link=https%3A%2F%2Fgithub.com%2FReinaldoAssis%2Fmips-sim%2Ftree%2Fmaster" />
</a>

<a target="_blank" href="./README-br.md">
<img src="https://img.shields.io/badge/Brazilian%20Portuguese%20-%20%23228B22?style=flat-square&link=https%3A%2F%2Fgithub.com%2FReinaldoAssis%2Fmips-sim%2Fblob%2Fmaster%2FREADME-br.md"/>
</a>

<a target="_blank" href="./README-fr.md">
<img src="https://img.shields.io/badge/French%20-%20%23DC143C?style=flat-square&link=https%3A%2F%2Fgithub.com%2FReinaldoAssis%2Fmips-sim%2Fblob%2Fmaster%2FREADME-fr.md"/>
</a>




# WIMS (Web-based Interactive MIPS Simulator)

A simulator based on the MIPS 32 architecture envisioned to help students learn and explore the foundations of assembly language and architecture schematics.


## Features

- Built-in code editor
- Step by step execution and debugging
- I/O Output (screen and keyboard)
- Terminal Output
- Datapath visualization


## Documentation

The simulator's documentation can be viewed at [WIMS Doc.](https://reinaldoassis.github.io/wims-doc/docs/intro)


## Usage/Examples

This is the default code when you first open the editor, it computes the nth number of the fibonacci sequence. You can either press the green button to assemble and run or you can step through each instruction using the yellow button. The result is displayed in the terminal.

```assembly
addi $t0, $zero, 0 #f1
addi $t1, $zero, 1 #f2
addi $a0, $zero, 15 #n
addi $a0 $a0 -1

fibonacci:
	addi $a0, $a0, -1
	add $t2, $t0, $t1 #soma
	add $t0, $zero, $t1 #f1 = f2
	add $t1, $zero, $t2 #f2 = soma
	beq $a0, $zero, main
	bne $a0, $zero, fibonacci

main:
	addi $v0, $t1, 0
	call 1
```


## Screenshots

Editor and terminal

![Editor and terminal](https://i.ibb.co/3RHngxw/image.png)

Instruction Set

![Instruction Set](https://i.ibb.co/PYVB0np/image.png)

## Authors

- [@reinaldoassis](https://www.github.com/reinaldoassis)

